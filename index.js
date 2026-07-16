#!/usr/bin/env node

const EventSource = require('eventsource');
const fetch = require('node-fetch');
const readline = require('readline');
const https = require('https');
const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');
const crypto = require('crypto');
const guides = require('./guides');
const pkg = require('./package.json');

// Configuration from environment variables
const BASE_URL = process.env.GENUDO_BASE_URL || 'https://api.genudo.ai';
const SSE_URL = `${BASE_URL}/api/user/mcp/sse`;
const ALLOW_INSECURE_SSL = process.env.GENUDO_ALLOW_INSECURE_SSL === 'true';

// Token sources, in order: env var, then the token saved by the genudo_connect
// browser flow. Plugin hosts (ChatGPT desktop) pass env templates through
// unresolved — a value still containing "${" means "not configured", not a token.
const TOKEN_FILE = path.join(os.homedir(), '.config', 'genudo', 'token');
function isUsableToken(t) {
  return typeof t === 'string' && t.trim() !== '' && !t.includes('${');
}
function readSavedToken() {
  try {
    const t = fs.readFileSync(TOKEN_FILE, 'utf8').trim();
    return t || null;
  } catch (e) {
    return null;
  }
}
function saveToken(t) {
  fs.mkdirSync(path.dirname(TOKEN_FILE), { recursive: true, mode: 0o700 });
  fs.writeFileSync(TOKEN_FILE, t.trim() + '\n', { mode: 0o600 });
}
function deleteSavedToken() {
  try { fs.unlinkSync(TOKEN_FILE); } catch (e) { /* not saved */ }
}
let TOKEN = isUsableToken(process.env.GENUDO_TOKEN)
  ? process.env.GENUDO_TOKEN.trim()
  : readSavedToken();

// The Genudo backend can be slow to answer the first request after connecting
// (cold start — observed 1s to 30s+). Rather than let one slow attempt hang the
// whole MCP handshake, we time out each attempt fast and retry.
const REQUEST_TIMEOUT = parseInt(process.env.GENUDO_REQUEST_TIMEOUT || '8000', 10);
const REQUEST_RETRIES = parseInt(process.env.GENUDO_REQUEST_RETRIES || '4', 10);

// The `eventsource` lib auto-reconnects every ~1s forever on a dropped/failed
// SSE connection. With a bad token or a down backend that becomes a retry storm
// (many clients x 1/sec). Cap it, and treat auth failures as fatal — a wrong
// token can NEVER succeed by retrying.
const MAX_RECONNECTS = parseInt(process.env.GENUDO_MAX_RECONNECTS || '5', 10);

// A request is worth retrying only if it might succeed next time: transient
// network/timeout errors (no HTTP status) or 5xx. Any 4xx — 401/403 bad token,
// 400 bad request, 404, 429 overloaded — is permanent for this token/request;
// retrying just piles load on the backend.
function isRetryableStatus(status) {
  return typeof status !== 'number' || status >= 500;
}
function isAuthError(status) {
  return status === 401 || status === 403;
}

// Server-level guidance returned in the `initialize` handshake. MCP clients
// (Claude Code, Codex, Cursor, ...) inject this into the model's context, so it
// teaches any client how to get value fast and avoid the common failure modes —
// without the user having to write prompts. Keep it concise and high-signal.
const SERVER_INSTRUCTIONS = [
  'Genudo MCP: control + analytics for AI sales/support pipelines (pipelines, stages, actions/webhooks, variables, contacts, opportunities, messages, knowledge tables, follow-ups, analytics). 29 tools, read + write.',
  '',
  'PICK A PATTERN:',
  '- Audit a pipeline: list_pipelines -> list_pipeline_stages -> list_actions -> list_variables -> list_opportunities -> list_contacts -> list_messages',
  '- Build from scratch: start_pipeline_journey (ALWAYS first) -> get_pipeline_options (valid IDs) -> create_pipeline -> create_stage (xN) -> create_variable -> create_action',
  '- Add an integration: list_pipelines -> list_pipeline_stages -> list_actions (avoid duplicates) -> list_variables -> create_variable -> create_action; tune existing ones with update_action.',
  '- Knowledge base: list_knowledge_tables -> create_knowledge_table (columns = the schema) -> upsert_knowledge_points (rows) -> search_knowledge_table (verify retrieval) -> delete_knowledge_points (remove rows). The pipeline agent searches these tables at runtime.',
  '- Follow-ups: get_stage_followup FIRST (one follow-up per stage) -> create_followup (new) or update_followup (existing).',
  '- Edit agent instructions: get_instruction_guides -> read current text (list_pipelines gives persona+instructions; list_pipeline_stages gives stage instructions+enter_condition+ai_persona) -> edit only what must change -> show DIFF + expected impact -> confirm -> update_pipeline / update_stage.',
  '- Report activity: get_account_summary -> get_ai_performance -> list_opportunities -> get_messaging_stats',
  '',
  'RULES THAT PREVENT FAILURES:',
  '1. Discover IDs before writing: get_pipeline_options (agent_type_id, ai_model_id, language_id, channel_id); list_pipelines (pipeline_id); list_pipeline_stages (stage_id); list_actions (action_id); list_variables (variable_id); list_knowledge_tables (knowledge_table_id); get_stage_followup (followup_id).',
  '2. Actions CANNOT use raw system placeholders. Never put {{opportunity.contact_email}} in an action url/headers/payload. Instead create_variable {type:"from_system", value:"opportunity.contact_email"} and reference {{its_name}}. Variable types: fixed | from_system | from_action | from_ai.',
  '3. create_pipeline: if is_model_routing_enabled=true, model_pool is required with exactly 4 tiers (router, simple, moderate, complex). persona + instructions drive quality — ask the user for a 1-2 sentence business description, then offer to write them.',
  '4. create_stage nature in {neutral, won, lost}. create_action fixed_trigger in {stage_started, on_any_message, on_user_message, custom}; omit stage_id for a pipeline-wide action.',
  '5. Immutable after create: pipeline agent_type; action fixed_trigger can only change to on_user_message/custom on update; update_opportunities stage moves must stay within the same pipeline; update_variable name change is ignored once actions reference the variable.',
  '6. Editing instructions is a WRITE to a live agent: before touching any pipeline persona/instructions or stage instructions/enter_condition/ai_persona, call get_instruction_guides (rules+templates) and get_editing_playbook (safe load->edit->diff->confirm->push). Never push update_pipeline/update_stage without showing a before/after diff and getting explicit user confirmation. Prompts (slash-commands): edit_instructions, build_pipeline, audit_pipeline.',
  '7. Knowledge rows: every row needs a stable default_id (upsert matches on it) and a value for EVERY column of the table. There is no table-delete tool — only delete_knowledge_points for rows.',
  '8. Follow-ups: each stage holds at most ONE followup. update_followup intervals REPLACE the whole schedule — send the full list, not a delta.',
  '9. Not exposed (do not attempt): deleting pipelines/stages/actions/variables, sending manual messages, reading plan limits.',
  '',
  'Confirm before bulk writes (update_opportunities is bulk) and before delete_knowledge_points. The backend can be slow on the first call — retries are automatic.'
].join('\n');

// HTTPS agent configuration
// For local development with self-signed certificates, set GENUDO_ALLOW_INSECURE_SSL=true
const httpsAgent = new https.Agent({
  rejectUnauthorized: !ALLOW_INSECURE_SSL
});

// No token is NOT fatal: the bridge starts in setup mode, exposing only the
// genudo_connect tool, which captures the token via a local browser page —
// plugin hosts (ChatGPT desktop) give users no UI to edit a bundled server's env.

// Instructions served while no account is connected.
const SETUP_INSTRUCTIONS = [
  'Genudo account NOT connected yet. Only one tool is available: genudo_connect.',
  'Call genudo_connect to open a secure local browser page where the user pastes their',
  'Genudo token (Genudo account -> API Keys & Tokens -> Create token, scope mcp:use).',
  'NEVER ask the user to paste the token into the chat.'
].join('\n');

const CONNECT_TOOL = {
  name: 'genudo_connect',
  description: 'Connect the Genudo account. Opens a secure page in the user\'s local browser where they paste their Genudo API token (Genudo -> API Keys & Tokens -> Create token with the mcp:use scope). Call when Genudo tools are missing or not connected, or after the user says they saved the token. Never ask for the token in chat.',
  inputSchema: { type: 'object', properties: {}, required: [] }
};

// Global state
let messageEndpoint = null;
let isInitialized = false;
let eventSource = null;
let reconnectCount = 0;

/**
 * Stop the SSE connection and exit. Used when retrying can't help (bad token) or
 * we've hit the reconnect cap — exiting is far lighter on the backend than an
 * unbounded in-process reconnect loop.
 */
function fatalExit(message) {
  debug(message);
  if (eventSource) {
    try { eventSource.close(); } catch (e) { /* already closed */ }
  }
  process.exit(1);
}

/**
 * Log debug messages to stderr (won't interfere with stdout JSON-RPC)
 */
function debug(...args) {
  console.error('[Genudo MCP Bridge]', ...args);
}

/**
 * Connect to SSE endpoint to get the message endpoint URL
 */
function connectSSE(options) {
  const exitOnAuthError = !options || options.exitOnAuthError !== false;
  return new Promise((resolve, reject) => {
    debug('Connecting to SSE endpoint:', SSE_URL);

    eventSource = new EventSource(SSE_URL, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`
      },
      https: { rejectUnauthorized: !ALLOW_INSECURE_SSL }
    });

    // A successful (re)connection means the storm guard can reset.
    eventSource.addEventListener('open', () => {
      reconnectCount = 0;
    });

    eventSource.addEventListener('endpoint', (event) => {
      messageEndpoint = event.data;
      reconnectCount = 0;
      debug('Received message endpoint:', messageEndpoint);
      isInitialized = true;
      resolve(messageEndpoint);
    });

    eventSource.onerror = (error) => {
      const status = error && error.status;
      // Wrong/expired token: reconnecting can NEVER succeed and just hammers the
      // backend. This is the retry storm — stop it dead. In lazy/setup mode we
      // reject instead of exiting so the host session survives a bad saved token.
      if (isAuthError(status)) {
        if (!exitOnAuthError) {
          try { eventSource.close(); } catch (e) { /* already closed */ }
          const err = new Error(`SSE auth failed (HTTP ${status})`);
          err.authError = true;
          return reject(err);
        }
        return fatalExit(`SSE auth failed (HTTP ${status}) — check GENUDO_TOKEN. Not retrying a bad token.`);
      }
      // Transient error: the lib will auto-reconnect (~1s). Bound it so a down
      // backend can't turn into an unbounded reconnect loop.
      reconnectCount++;
      debug(`SSE connection error${status ? ` (HTTP ${status})` : ''} — reconnect ${reconnectCount}/${MAX_RECONNECTS}`);
      if (reconnectCount >= MAX_RECONNECTS) {
        return fatalExit(`Giving up after ${MAX_RECONNECTS} SSE reconnect attempts.`);
      }
    };

    // Timeout if no endpoint received within 10 seconds
    setTimeout(() => {
      if (!isInitialized) {
        eventSource.close();
        reject(new Error('Timeout waiting for endpoint from SSE'));
      }
    }, 10000);
  });
}

// Single-flight lazy connect — used when the token arrived after startup
// (saved via genudo_connect) rather than via env at launch.
let connecting = null;
function lazyConnect() {
  if (isInitialized && messageEndpoint) return Promise.resolve(messageEndpoint);
  if (!connecting) {
    connecting = connectSSE({ exitOnAuthError: false }).finally(() => { connecting = null; });
  }
  return connecting;
}

/** Emit a server-initiated MCP notification on stdout. */
function notify(method) {
  console.log(JSON.stringify({ jsonrpc: '2.0', method }));
}

/**
 * Forward JSON-RPC request to the Laravel MCP server
 */
async function forwardRequest(jsonRpcRequest) {
  if (!messageEndpoint) {
    if (TOKEN) {
      await lazyConnect();
    } else {
      throw new Error('Genudo account not connected — call the genudo_connect tool first.');
    }
  }

  debug('Forwarding request:', jsonRpcRequest.method, 'id:', jsonRpcRequest.id);

  let lastError;
  for (let attempt = 1; attempt <= REQUEST_RETRIES; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
    try {
      const response = await fetch(messageEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${TOKEN}`
        },
        body: JSON.stringify(jsonRpcRequest),
        agent: httpsAgent,
        signal: controller.signal
      });
      clearTimeout(timer);

      if (!response.ok) {
        const err = new Error(`HTTP ${response.status}: ${response.statusText}`);
        err.noRetry = !isRetryableStatus(response.status);
        throw err;
      }

      // Handle 204 No Content (for notifications)
      if (response.status === 204) {
        return null;
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timer);
      lastError = error;
      const reason = error.name === 'AbortError'
        ? `timeout after ${REQUEST_TIMEOUT}ms`
        : error.message;
      // Permanent failure (4xx) — retrying won't fix it, so don't add load.
      if (error.noRetry) {
        debug(`Request failed, not retrying (${reason})`);
        throw error;
      }
      debug(`Attempt ${attempt}/${REQUEST_RETRIES} failed (${reason})`);
      if (attempt < REQUEST_RETRIES) {
        await new Promise((r) => setTimeout(r, 500));
      }
    }
  }
  throw lastError;
}

// ---------------------------------------------------------------------------
// genudo_connect: local browser page for token entry (no terminal, no token in
// chat). Tool call opens http://127.0.0.1:<port>/ ; the form POST saves the
// token to TOKEN_FILE, then the bridge connects and announces tools/list_changed.
// ---------------------------------------------------------------------------
let setupServer = null;
let setupPort = null;
// Random single-use path segment: a page in the user's regular browser can't
// guess it, so drive-by CSRF/DNS-rebinding POSTs to the setup server miss.
let setupNonce = null;

const SETUP_PAGE = (msg, ok, action) => `<!doctype html>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Connect Genudo</title>
<style>
  body{font:16px/1.5 system-ui;margin:0;display:grid;place-items:center;min-height:100vh;background:#f6f7fb;color:#1a1d27}
  .card{background:#fff;border-radius:16px;padding:36px;max-width:420px;box-shadow:0 8px 30px rgba(20,24,40,.08)}
  h1{font-size:20px;margin:0 0 6px} p{color:#5a6072;margin:8px 0 20px;font-size:14px}
  input{width:100%;box-sizing:border-box;padding:12px;border:1px solid #d6d9e4;border-radius:10px;font-size:14px}
  button{margin-top:14px;width:100%;padding:12px;border:0;border-radius:10px;background:#2f3bd9;color:#fff;font-size:15px;cursor:pointer}
  .ok{color:#0a7d38}.err{color:#b3261e}
</style>
<div class="card">
  <h1>Connect Genudo</h1>
  ${msg ? `<p class="${ok ? 'ok' : 'err'}">${msg}</p>` : ''}
  ${ok ? '<p>You can close this tab and go back to your chat.</p>' : `
  <p>Paste your Genudo API token. Get it from your Genudo account:
     <b>API Keys &amp; Tokens → Create token</b> with the <b>mcp:use</b> scope
     (shown only once — copy it at creation).</p>
  <form method="POST" action="${action}">
    <input type="password" name="token" placeholder="Genudo token" autofocus required>
    <button type="submit">Save &amp; connect</button>
  </form>`}
</div>`;

/** Cheap remote check: only reject tokens the backend explicitly refuses. */
async function verifyTokenRemote(tok) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const resp = await fetch(SSE_URL, {
      headers: { 'Authorization': `Bearer ${tok}`, 'Accept': 'text/event-stream' },
      agent: httpsAgent,
      signal: controller.signal
    });
    const ok = !isAuthError(resp.status);
    controller.abort();
    return ok;
  } catch (e) {
    return true; // network trouble ≠ bad token; the real connect will decide
  } finally {
    clearTimeout(timer);
  }
}

function startSetupServer() {
  if (setupServer) return Promise.resolve(setupPort);
  setupNonce = crypto.randomBytes(16).toString('hex');
  return new Promise((resolve, reject) => {
    const srv = http.createServer((req, res) => {
      // Anti-CSRF / anti-DNS-rebinding: only same-origin browser traffic for
      // exactly this host:port, and only on the unguessable nonce path.
      const host = req.headers.host || '';
      if (host !== `127.0.0.1:${setupPort}` && host !== `localhost:${setupPort}`) {
        res.writeHead(403); return res.end();
      }
      const origin = req.headers.origin;
      if (origin && origin !== `http://127.0.0.1:${setupPort}` && origin !== `http://localhost:${setupPort}`) {
        res.writeHead(403); return res.end();
      }
      if (req.headers['sec-fetch-site'] === 'cross-site') {
        res.writeHead(403); return res.end();
      }
      const saveAction = `/save/${setupNonce}`;
      if (req.method === 'GET' && req.url === `/connect/${setupNonce}`) {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        return res.end(SETUP_PAGE('', false, saveAction));
      }
      if (req.method === 'POST' && req.url === saveAction) {
        if (!(req.headers['content-type'] || '').startsWith('application/x-www-form-urlencoded')) {
          res.writeHead(403); return res.end();
        }
        let body = '';
        req.on('data', (c) => { body += c; if (body.length > 65536) req.destroy(); });
        req.on('end', async () => {
          const tok = decodeURIComponent((body.match(/(?:^|&)token=([^&]*)/) || [])[1] || '')
            .replace(/\+/g, ' ').trim();
          if (!isUsableToken(tok)) {
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            return res.end(SETUP_PAGE('That does not look like a token — try again.', false, saveAction));
          }
          if (!(await verifyTokenRemote(tok))) {
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            return res.end(SETUP_PAGE('Genudo rejected this token. Check it has the mcp:use scope and try again.', false, saveAction));
          }
          saveToken(tok);
          TOKEN = tok;
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(SETUP_PAGE('Token saved — Genudo is connecting.', true, saveAction));
          debug('Token saved via setup page; connecting...');
          lazyConnect()
            .then(() => notify('notifications/tools/list_changed'))
            .catch((e) => debug('Connect after token save failed:', e.message));
        });
        return;
      }
      res.writeHead(404); res.end();
    });
    srv.on('error', reject);
    srv.listen(0, '127.0.0.1', () => {
      setupServer = srv;
      setupPort = srv.address().port;
      // Don't hold the process open for the setup page alone.
      srv.unref();
      resolve(setupPort);
    });
  });
}

function openBrowser(url) {
  if (process.env.GENUDO_NO_BROWSER) return;
  try {
    if (process.platform === 'win32') {
      spawn('cmd', ['/c', 'start', '', url], { detached: true, stdio: 'ignore' }).unref();
    } else {
      spawn(process.platform === 'darwin' ? 'open' : 'xdg-open', [url],
        { detached: true, stdio: 'ignore' }).unref();
    }
  } catch (e) {
    debug('Could not open browser:', e.message);
  }
}

function toolText(id, text) {
  return { jsonrpc: '2.0', id, result: { content: [{ type: 'text', text }] } };
}

async function handleConnectCall(id) {
  // Token may have arrived since startup (env at launch, or saved via the page).
  if (!TOKEN) {
    TOKEN = readSavedToken();
  }
  if (TOKEN) {
    try {
      await lazyConnect();
      notify('notifications/tools/list_changed');
      return console.log(JSON.stringify(toolText(id,
        'Genudo is connected. All Genudo tools are now available — retry the user\'s original request.')));
    } catch (e) {
      if (e.authError) {
        deleteSavedToken();
        TOKEN = null;
        // fall through to reopen the setup page below
      } else {
        return console.log(JSON.stringify(toolText(id,
          `Genudo backend unreachable right now (${e.message}). Token looks saved — try again in a moment.`)));
      }
    }
  }
  const port = await startSetupServer();
  const url = `http://127.0.0.1:${port}/connect/${setupNonce}`;
  openBrowser(url);
  return console.log(JSON.stringify(toolText(id,
    `A secure Genudo connect page was opened in the user's browser (${url} — local only). ` +
    'Tell the user: paste your Genudo token there (Genudo account -> API Keys & Tokens -> Create token, scope mcp:use) and click Save. ' +
    'After they confirm saving, call genudo_connect again to finish. Never ask for the token in chat.')));
}

/**
 * Process a single line of input (JSON-RPC request)
 */
async function processInput(line) {
  try {
    const request = JSON.parse(line);
    debug('Received request:', request.method);

    // Answer the MCP handshake locally so Claude's startup never blocks on
    // backend cold-start latency. The Genudo server accepts tool calls without a
    // forwarded initialize (verified), so we synthesize the response and warm the
    // backend in the background for the first real request.
    if (request.method === 'initialize') {
      console.log(JSON.stringify({
        jsonrpc: '2.0',
        id: request.id,
        result: {
          protocolVersion: (request.params && request.params.protocolVersion) || '2024-11-05',
          capabilities: { tools: { listChanged: true }, prompts: {} },
          serverInfo: { name: 'Genudo', version: pkg.version },
          instructions: TOKEN ? SERVER_INSTRUCTIONS : SETUP_INSTRUCTIONS
        }
      }));
      if (TOKEN) {
        forwardRequest({ jsonrpc: '2.0', id: 'warmup', method: 'tools/list', params: {} })
          .catch(() => {});
      }
      return;
    }

    // Handshake is handled locally, so there is no server session to notify.
    if (request.method === 'notifications/initialized') {
      return;
    }

    // Prompts are portable slash-commands served entirely client-side.
    if (request.method === 'prompts/list') {
      console.log(JSON.stringify({
        jsonrpc: '2.0',
        id: request.id,
        result: { prompts: guides.PROMPTS }
      }));
      return;
    }
    if (request.method === 'prompts/get') {
      const name = request.params && request.params.name;
      const result = guides.getPromptMessages(name, request.params && request.params.arguments);
      if (result) {
        console.log(JSON.stringify({ jsonrpc: '2.0', id: request.id, result }));
      } else {
        console.log(JSON.stringify({
          jsonrpc: '2.0',
          id: request.id,
          error: { code: -32602, message: `Unknown prompt: ${name}` }
        }));
      }
      return;
    }

    // tools/list: proxy the backend tools, then append our local guide tools.
    // No token yet -> the connect tool is the only thing on offer.
    if (request.method === 'tools/list') {
      if (!TOKEN) {
        console.log(JSON.stringify({
          jsonrpc: '2.0',
          id: request.id,
          result: { tools: [CONNECT_TOOL] }
        }));
        return;
      }
      let backendTools = [];
      try {
        const backendResponse = await forwardRequest(request);
        backendTools = (backendResponse && backendResponse.result && backendResponse.result.tools) || [];
      } catch (error) {
        // Backend unreachable — still expose the local guide tools (they are static).
        debug('tools/list backend fetch failed, serving local tools only:', error.message);
      }
      console.log(JSON.stringify({
        jsonrpc: '2.0',
        id: request.id,
        result: { tools: [...backendTools, ...guides.LOCAL_TOOLS] }
      }));
      return;
    }

    // genudo_connect: handled entirely locally.
    if (request.method === 'tools/call'
        && request.params && request.params.name === CONNECT_TOOL.name) {
      await handleConnectCall(request.id);
      return;
    }

    // tools/call: answer the local guide tools ourselves; proxy everything else.
    if (request.method === 'tools/call'
        && request.params && guides.LOCAL_TOOL_NAMES.has(request.params.name)) {
      console.log(JSON.stringify({
        jsonrpc: '2.0',
        id: request.id,
        result: guides.handleLocalToolCall(request.params.name)
      }));
      return;
    }

    const response = await forwardRequest(request);

    // Only write response if there is one (notifications don't get responses)
    if (response !== null) {
      // Write response to stdout for Claude Code to read
      console.log(JSON.stringify(response));
    }
  } catch (error) {
    debug('Error processing request:', error.message);

    // Try to extract ID from the line if possible
    let id = null;
    try {
      const parsed = JSON.parse(line);
      id = parsed.id;
    } catch (e) {
      // Ignore
    }

    // Send error response
    const errorResponse = {
      jsonrpc: '2.0',
      id: id,
      error: {
        code: -32603,
        message: error.message
      }
    };
    console.log(JSON.stringify(errorResponse));
  }
}

/**
 * Main function
 */
async function main() {
  try {
    debug('Starting Genudo MCP Bridge...');

    if (TOKEN) {
      // Connect to SSE and get message endpoint
      await connectSSE();
      debug('Bridge initialized successfully');
    } else {
      debug('No token configured — starting in setup mode (genudo_connect only).');
    }

    // Set up readline to process stdin line by line
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false
    });

    // Process each line of input
    rl.on('line', async (line) => {
      if (line.trim()) {
        await processInput(line);
      }
    });

    // Handle EOF
    rl.on('close', () => {
      debug('Input stream closed, exiting...');
      process.exit(0);
    });

  } catch (error) {
    debug('Fatal error:', error.message);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  debug('Received SIGINT, shutting down...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  debug('Received SIGTERM, shutting down...');
  process.exit(0);
});

// Start the bridge. Claude Desktop's MCPB host require()s this file (so
// require.main !== module there — a `require.main` guard breaks it); tests
// opt out via env instead.
if (!process.env.GENUDO_SKIP_MAIN) {
  main();
}

module.exports = { isRetryableStatus, isAuthError };
