#!/usr/bin/env node

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
// Streamable HTTP: one endpoint, every JSON-RPC message is a POST to it. The old
// two-step SSE flow (GET /api/user/mcp/sse -> endpoint event -> POST there) was
// retired backend-side and now 404s on both prod and staging.
const MCP_URL = `${BASE_URL}/mcp`;
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
const TOKEN_FROM_ENV = isUsableToken(process.env.GENUDO_TOKEN);
let TOKEN = TOKEN_FROM_ENV
  ? process.env.GENUDO_TOKEN.trim()
  : readSavedToken();

// The Genudo backend can be slow to answer the first request after connecting
// (cold start — observed 1s to 30s+). Rather than let one slow attempt hang the
// whole MCP handshake, we time out each attempt fast and retry.
const REQUEST_TIMEOUT = parseInt(process.env.GENUDO_REQUEST_TIMEOUT || '8000', 10);
const REQUEST_RETRIES = parseInt(process.env.GENUDO_REQUEST_RETRIES || '4', 10);

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
// Where the agent writes local working files. `guides.ROOT` resolves $GENUDO_WORKDIR.
const WORKDIR_HINT =
  guides.ROOT === '.'
    ? 'the current working directory (set GENUDO_WORKDIR to pin it to one stable folder)'
    : `${guides.ROOT} (from GENUDO_WORKDIR)`;

const SERVER_INSTRUCTIONS = [
  'Genudo MCP: control + analytics for AI sales/support pipelines (pipelines, stages, actions/webhooks, variables, contacts, opportunities, messages, knowledge tables, follow-ups, analytics). 29 tools, read + write.',
  '',
  'PICK A PATTERN:',
  '- Audit a pipeline: list_pipelines -> list_pipeline_stages -> list_actions -> list_variables -> list_opportunities -> list_contacts -> list_messages',
  '- Build from scratch: start_pipeline_journey (ALWAYS first) -> get_pipeline_options (valid IDs) -> create_pipeline -> create_stage (xN) -> create_variable -> create_action',
  '- Add an integration: list_pipelines -> list_pipeline_stages -> list_actions (avoid duplicates) -> list_variables -> create_variable -> create_action; tune existing ones with update_action.',
  '- Knowledge base: list_knowledge_tables -> create_knowledge_table (columns = the schema) -> upsert_knowledge_points (rows) -> search_knowledge_table (verify retrieval) -> delete_knowledge_points (remove rows). The pipeline agent searches these tables at runtime.',
  '- Follow-ups: get_stage_followup FIRST (one follow-up per stage) -> create_followup (new) or update_followup (existing).',
  '- Edit agent instructions: get_instruction_guides -> read current text with verbose:true (list_pipelines gives persona+instructions; list_pipeline_stages gives stage instructions+enter_condition+ai_persona; both truncate long texts unless verbose:true) -> edit only what must change -> show DIFF + expected impact -> confirm -> update_pipeline / update_stage.',
  '- Report activity: get_account_summary -> get_ai_performance -> list_opportunities -> get_messaging_stats',
  '',
  'RULES THAT PREVENT FAILURES:',
  '1. Discover IDs before writing: get_pipeline_options (agent_type_id, ai_model_id, language_id, channel_id); list_pipelines (pipeline_id); list_pipeline_stages (stage_id); list_actions (action_id); list_variables (variable_id); list_knowledge_tables (knowledge_table_id); get_stage_followup (followup_id).',
  '2. Actions CANNOT use raw system placeholders. Never put {{opportunity.contact_email}} in an action url/headers/payload. Instead create_variable {type:"from_system", value:"opportunity.contact_email"} and reference {{its_name}}. Variable types: fixed | from_system | from_action | from_ai.',
  '3. create_pipeline: if is_model_routing_enabled=true, model_pool is required with exactly 4 tiers (router, simple, moderate, complex). persona + instructions drive quality — ask the user for a 1-2 sentence business description, then offer to write them.',
  '4. create_stage nature in {neutral, won, lost}. create_action fixed_trigger in {stage_started, on_any_message, on_user_message, custom}; omit stage_id for a pipeline-wide action.',
  '5. Immutable after create: pipeline agent_type; action fixed_trigger can only change to on_user_message/custom on update; update_opportunities stage moves must stay within the same pipeline; update_variable name change is ignored once actions reference the variable.',
  '6. Editing instructions is a WRITE to a live agent: before touching any pipeline persona/instructions or stage instructions/enter_condition/ai_persona, call get_instruction_guides (rules+templates) and get_editing_playbook (safe load->mirror->stage->edit->diff->confirm->push->record). Never push update_pipeline/update_stage without showing a before/after diff and getting explicit user confirmation. After a push, record the outcome in the staged version folder (CHANGES.md Status + manifest.json) so staged and shipped stay distinguishable. Prompts (slash-commands): edit_instructions, build_pipeline, audit_pipeline.',
  '7. Knowledge rows: every row needs a stable default_id (upsert matches on it) and a value for EVERY column of the table. There is no table-delete tool — only delete_knowledge_points for rows.',
  '8. Follow-ups: each stage holds at most ONE followup. update_followup intervals REPLACE the whole schedule — send the full list, not a delta.',
  '9. Not exposed (do not attempt): deleting pipelines/stages/actions/variables, sending manual messages, reading plan limits.',
  `10. Local working files (pipeline mirrors, build drafts, version snapshots, cached guides) go under ONE staging root: ${WORKDIR_HINT}. Wherever a skill or guide writes "<workdir>/..." — e.g. <workdir>/genudo-build/<pipeline>/ or <workdir>/pipelines/<pipeline>/ — "<workdir>" means that root. Never create a literal "<workdir>" folder, and never scatter these files wherever the session happened to start.`,
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
  'NEVER ask the user to paste the token into the chat.',
  'After connecting, the full Genudo toolset may only appear in a NEW task/chat',
  '(hosts often snapshot tool lists at task start). Do not work around missing tools',
  'with shell commands or by driving the connector manually — just tell the user to',
  'start a new task.'
].join('\n');

const CONNECT_TOOL = {
  name: 'genudo_connect',
  description: 'Connect the Genudo account. Opens a secure page in the user\'s local browser where they paste their Genudo API token (Genudo -> API Keys & Tokens -> Create token with the mcp:use scope). Call when Genudo tools are missing or not connected, or after the user says they saved the token. Pass reconnect:true when the user wants to switch Genudo accounts, replace, or update the saved token. Never ask for the token in chat.',
  inputSchema: {
    type: 'object',
    properties: {
      reconnect: {
        type: 'boolean',
        description: 'Discard the saved token and reopen the connect page — use to switch accounts or update the token (default false).'
      }
    },
    required: []
  }
};

// Global state
let sessionId = null;
let isInitialized = false;

/**
 * Exit. Used when retrying can't help (bad token) — dying is far lighter on the
 * backend than an in-process loop that can never succeed.
 */
function fatalExit(message) {
  debug(message);
  process.exit(1);
}

/**
 * Log debug messages to stderr (won't interfere with stdout JSON-RPC)
 */
function debug(...args) {
  console.error('[Genudo MCP Bridge]', ...args);
}

/** POST one JSON-RPC message to the Streamable HTTP endpoint. */
function postMcp(body, signal) {
  return fetch(MCP_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Streamable HTTP servers may answer either way; the spec requires the
      // client to accept both.
      'Accept': 'application/json, text/event-stream',
      'Authorization': `Bearer ${TOKEN}`,
      ...(sessionId ? { 'Mcp-Session-Id': sessionId } : {})
    },
    body: JSON.stringify(body),
    agent: httpsAgent,
    signal
  });
}

/**
 * Read a JSON-RPC reply that may arrive as plain JSON or as a single SSE frame
 * ("event: message\ndata: {...}"). One POSTed request yields one reply, so
 * concatenating the data lines is enough — we never multiplex on this channel.
 */
async function readJsonRpc(response) {
  if (response.status === 204) return null;
  const text = await response.text();
  if (!text.trim()) return null;
  if ((response.headers.get('content-type') || '').includes('text/event-stream')) {
    const data = text
      .split('\n')
      .filter((l) => l.startsWith('data:'))
      .map((l) => l.slice(5).trim())
      .join('');
    return data ? JSON.parse(data) : null;
  }
  return JSON.parse(text);
}

/**
 * Perform the MCP handshake against the backend and remember the session.
 *
 * The bridge answers the host's `initialize` locally (fast startup), so this is
 * the only place the backend handshake happens. A stateful server hands back an
 * `Mcp-Session-Id` that every later POST must echo; a stateless one returns no
 * header and this just costs one round trip.
 */
async function handshake(options) {
  const exitOnAuthError = !options || options.exitOnAuthError !== false;
  debug('Connecting to MCP endpoint:', MCP_URL);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
  let response;
  try {
    response = await postMcp({
      jsonrpc: '2.0',
      id: 'init',
      method: 'initialize',
      params: {
        protocolVersion: '2025-06-18',
        capabilities: {},
        clientInfo: { name: 'genudo-mcp-client', version: pkg.version }
      }
    }, controller.signal);
  } finally {
    clearTimeout(timer);
  }

  if (isAuthError(response.status)) {
    // Wrong/expired token can NEVER succeed by retrying. In lazy/setup mode we
    // reject instead of exiting so the host session survives a bad saved token.
    if (!exitOnAuthError) {
      const err = new Error(`MCP auth failed (HTTP ${response.status})`);
      err.authError = true;
      throw err;
    }
    return fatalExit(`MCP auth failed (HTTP ${response.status}) — check GENUDO_TOKEN. Not retrying a bad token.`);
  }
  if (!response.ok) {
    throw new Error(`MCP handshake failed: HTTP ${response.status} ${response.statusText}`);
  }

  sessionId = response.headers.get('mcp-session-id') || null;
  await readJsonRpc(response);
  isInitialized = true;
  debug('Backend handshake OK', sessionId ? `(session ${sessionId})` : '(stateless)');

  // Best-effort: a stateful server wants this before it will serve requests.
  try {
    await postMcp({ jsonrpc: '2.0', method: 'notifications/initialized' });
  } catch (e) {
    debug('notifications/initialized failed (continuing):', e.message);
  }
  return sessionId;
}

// Single-flight lazy connect — used when the token arrived after startup
// (saved via genudo_connect) rather than via env at launch.
let connecting = null;
function lazyConnect() {
  if (isInitialized) return Promise.resolve(sessionId);
  if (!connecting) {
    connecting = handshake({ exitOnAuthError: false }).finally(() => { connecting = null; });
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
  if (!isInitialized) {
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
      const response = await postMcp(jsonRpcRequest, controller.signal);
      clearTimeout(timer);

      if (!response.ok) {
        const err = new Error(`HTTP ${response.status}: ${response.statusText}`);
        err.noRetry = !isRetryableStatus(response.status);
        throw err;
      }

      return await readJsonRpc(response);
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
    const resp = await fetch(MCP_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream',
        'Authorization': `Bearer ${tok}`
      },
      body: JSON.stringify({ jsonrpc: '2.0', id: 'verify', method: 'tools/list', params: {} }),
      agent: httpsAgent,
      signal: controller.signal
    });
    return !isAuthError(resp.status);
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

async function handleConnectCall(id, args) {
  // reconnect: discard the saved token and force fresh entry (account switch).
  if (args && args.reconnect) {
    if (TOKEN_FROM_ENV) {
      return console.log(JSON.stringify(toolText(id,
        'The Genudo token is set via the GENUDO_TOKEN environment variable, which overrides the connect flow. Remove it from the host/server config to switch accounts via the connect page.')));
    }
    debug('reconnect requested — discarding saved token');
    deleteSavedToken();
    TOKEN = null;
    isInitialized = false;
    sessionId = null;
  }
  // Token may have arrived since startup (env at launch, or saved via the page).
  if (!TOKEN) {
    TOKEN = readSavedToken();
  }
  if (TOKEN) {
    try {
      await lazyConnect();
      notify('notifications/tools/list_changed');
      return console.log(JSON.stringify(toolText(id,
        'Genudo is connected and the token is saved. NOTE: some hosts (ChatGPT desktop/Codex) only load a server\'s tool list when a task starts, so the full Genudo toolset may not be visible in THIS task. If the Genudo tools (list_pipelines etc.) are not available to you right now, do NOT try to work around it — just tell the user: "Connected! Start a new task/chat and ask me again — the Genudo tools load there." In hosts that refresh tools live, simply retry the user\'s original request.')));
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

// ---------------------------------------------------------------------------
// Response slimming: list_* backend responses embed FULL agent instructions and
// personas (thousands of chars per pipeline/stage). Hosts' models drown in it
// and start improvising (ID scans, log spelunking). Truncate long prompt-text
// fields by default; verbose:true (handled here, stripped before forwarding)
// returns full text — required before editing instructions.
// ---------------------------------------------------------------------------
const SLIMMED_TOOLS = new Set(['list_pipelines', 'list_pipeline_stages']);
const LONG_TEXT_FIELDS = new Set(['instructions', 'persona', 'ai_persona', 'enter_condition']);
const TRUNCATE_AT = 400;
const VERBOSE_HINT = ' Long instructions/persona texts are truncated by default for readability; pass verbose:true when you need the FULL text (required before editing instructions).';

function truncateLongFields(node) {
  if (Array.isArray(node)) { node.forEach(truncateLongFields); return; }
  if (!node || typeof node !== 'object') return;
  for (const [k, v] of Object.entries(node)) {
    if (typeof v === 'string' && LONG_TEXT_FIELDS.has(k) && v.length > TRUNCATE_AT) {
      node[k] = v.slice(0, TRUNCATE_AT) + ` …[truncated ${v.length - TRUNCATE_AT} chars — re-call with verbose:true for the full text]`;
    } else {
      truncateLongFields(v);
    }
  }
}

function slimToolResponse(response) {
  try {
    const content = response && response.result && response.result.content;
    if (!Array.isArray(content)) return;
    for (const item of content) {
      if (item && item.type === 'text' && typeof item.text === 'string') {
        const parsed = JSON.parse(item.text);
        truncateLongFields(parsed);
        item.text = JSON.stringify(parsed);
      }
    }
    if (response.result.structuredContent) truncateLongFields(response.result.structuredContent);
  } catch (e) {
    // Non-JSON payload — leave untouched.
  }
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
      // Advertise the bridge-level verbose escape hatch on slimmed tools.
      for (const tool of backendTools) {
        if (SLIMMED_TOOLS.has(tool.name)) {
          tool.description = (tool.description || '') + VERBOSE_HINT;
          if (tool.inputSchema && tool.inputSchema.properties) {
            tool.inputSchema.properties.verbose = {
              type: 'boolean',
              description: 'Return full instruction/persona texts instead of truncated previews (default false).'
            };
          }
        }
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
      await handleConnectCall(request.id, request.params.arguments);
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

    // Slimmed tools: honor + strip the bridge-level verbose flag before forwarding.
    let wantsVerbose = false;
    if (request.method === 'tools/call' && request.params
        && SLIMMED_TOOLS.has(request.params.name)) {
      const args = request.params.arguments || {};
      wantsVerbose = args.verbose === true || args.verbose === 'true';
      if ('verbose' in args) delete args.verbose;
    }

    const response = await forwardRequest(request);

    // Only write response if there is one (notifications don't get responses)
    if (response !== null) {
      if (request.method === 'tools/call' && request.params
          && SLIMMED_TOOLS.has(request.params.name) && !wantsVerbose) {
        slimToolResponse(response);
      }
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

    if (TOKEN && TOKEN_FROM_ENV) {
      // Env-configured token: fail fast like always — the operator set it and
      // should see the process die on a bad token.
      await handshake();
      debug('Bridge initialized successfully');
    } else if (TOKEN) {
      // Saved (genudo_connect) token: a revoked token must NOT kill the server —
      // clear it and fall back to setup mode so the connect page can reopen.
      try {
        await handshake({ exitOnAuthError: false });
        debug('Bridge initialized successfully');
      } catch (e) {
        if (e.authError) {
          debug('Saved token was rejected — clearing it; starting in setup mode.');
          deleteSavedToken();
          TOKEN = null;
        } else {
          debug(`Startup connect failed (${e.message}) — will retry on demand.`);
        }
      }
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
