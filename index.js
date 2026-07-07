#!/usr/bin/env node

const EventSource = require('eventsource');
const fetch = require('node-fetch');
const readline = require('readline');
const https = require('https');
const guides = require('./guides');

// Configuration from environment variables
const BASE_URL = process.env.GENUDO_BASE_URL || 'https://api.genudo.ai';
const SSE_URL = `${BASE_URL}/api/user/mcp/sse`;
const TOKEN = process.env.GENUDO_TOKEN;
const ALLOW_INSECURE_SSL = process.env.GENUDO_ALLOW_INSECURE_SSL === 'true';

// The Genudo backend can be slow to answer the first request after connecting
// (cold start — observed 1s to 30s+). Rather than let one slow attempt hang the
// whole MCP handshake, we time out each attempt fast and retry.
const REQUEST_TIMEOUT = parseInt(process.env.GENUDO_REQUEST_TIMEOUT || '8000', 10);
const REQUEST_RETRIES = parseInt(process.env.GENUDO_REQUEST_RETRIES || '4', 10);

// Server-level guidance returned in the `initialize` handshake. MCP clients
// (Claude Code, Codex, Cursor, ...) inject this into the model's context, so it
// teaches any client how to get value fast and avoid the common failure modes —
// without the user having to write prompts. Keep it concise and high-signal.
const SERVER_INSTRUCTIONS = [
  'Genudo MCP: control + analytics for AI sales/support pipelines (pipelines, stages, actions/webhooks, variables, contacts, opportunities, messages, analytics). 21 tools, read + write.',
  '',
  'PICK A PATTERN:',
  '- Audit a pipeline: list_pipelines -> list_pipeline_stages -> list_variables -> list_opportunities -> list_contacts -> list_messages',
  '- Build from scratch: start_pipeline_journey (ALWAYS first) -> get_pipeline_options (valid IDs) -> create_pipeline -> create_stage (xN) -> create_variable -> create_action',
  '- Add an integration: list_pipelines -> list_pipeline_stages -> list_variables -> create_variable -> create_action',
  '- Edit agent instructions: get_instruction_guides -> read current text (list_pipelines gives persona+instructions; list_pipeline_stages gives stage instructions+enter_condition+ai_persona) -> edit only what must change -> show DIFF + expected impact -> confirm -> update_pipeline / update_stage.',
  '- Report activity: get_account_summary -> get_ai_performance -> list_opportunities -> get_messaging_stats',
  '',
  'RULES THAT PREVENT FAILURES:',
  '1. Discover IDs before writing: get_pipeline_options (agent_type_id, ai_model_id, language_id, channel_id); list_pipelines (pipeline_id); list_pipeline_stages (stage_id); list_variables (variable_id).',
  '2. Actions CANNOT use raw system placeholders. Never put {{opportunity.contact_email}} in an action url/headers/payload. Instead create_variable {type:"from_system", value:"opportunity.contact_email"} and reference {{its_name}}. Variable types: fixed | from_system | from_action | from_ai.',
  '3. create_pipeline: if is_model_routing_enabled=true, model_pool is required with exactly 4 tiers (router, simple, moderate, complex). persona + instructions drive quality — ask the user for a 1-2 sentence business description, then offer to write them.',
  '4. create_stage nature in {neutral, won, lost}. create_action fixed_trigger in {stage_started, on_any_message, on_user_message, custom}; omit stage_id for a pipeline-wide action.',
  '5. Immutable after create: pipeline agent_type; action fixed_trigger can only change to on_user_message/custom on update; update_opportunities stage moves must stay within the same pipeline.',
  '6. Editing instructions is a WRITE to a live agent: before touching any pipeline persona/instructions or stage instructions/enter_condition/ai_persona, call get_instruction_guides (rules+templates) and get_editing_playbook (safe load->edit->diff->confirm->push). Never push update_pipeline/update_stage without showing a before/after diff and getting explicit user confirmation. Prompts (slash-commands): edit_instructions, build_pipeline, audit_pipeline.',
  '7. Not exposed (do not attempt): listing actions, deleting actions/stages/pipelines, KB management, sending manual messages, reading plan limits.',
  '',
  'Confirm before bulk writes (update_opportunities is bulk). The backend can be slow on the first call — retries are automatic.'
].join('\n');

// HTTPS agent configuration
// For local development with self-signed certificates, set GENUDO_ALLOW_INSECURE_SSL=true
const httpsAgent = new https.Agent({
  rejectUnauthorized: !ALLOW_INSECURE_SSL
});

// Validate configuration
if (!TOKEN) {
  console.error('ERROR: GENUDO_TOKEN environment variable is required');
  process.exit(1);
}

// Global state
let messageEndpoint = null;
let isInitialized = false;

/**
 * Log debug messages to stderr (won't interfere with stdout JSON-RPC)
 */
function debug(...args) {
  console.error('[Genudo MCP Bridge]', ...args);
}

/**
 * Connect to SSE endpoint to get the message endpoint URL
 */
function connectSSE() {
  return new Promise((resolve, reject) => {
    debug('Connecting to SSE endpoint:', SSE_URL);

    const eventSource = new EventSource(SSE_URL, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`
      },
      https: { rejectUnauthorized: !ALLOW_INSECURE_SSL }
    });

    eventSource.addEventListener('endpoint', (event) => {
      messageEndpoint = event.data;
      debug('Received message endpoint:', messageEndpoint);
      isInitialized = true;
      resolve(messageEndpoint);
    });

    eventSource.onerror = (error) => {
      debug('SSE connection error:', error);
      // Don't reject - SSE will auto-reconnect
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

/**
 * Forward JSON-RPC request to the Laravel MCP server
 */
async function forwardRequest(jsonRpcRequest) {
  if (!messageEndpoint) {
    throw new Error('Message endpoint not initialized');
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
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
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
      debug(`Attempt ${attempt}/${REQUEST_RETRIES} failed (${reason})`);
      if (attempt < REQUEST_RETRIES) {
        await new Promise((r) => setTimeout(r, 500));
      }
    }
  }
  throw lastError;
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
          capabilities: { tools: {}, prompts: {} },
          serverInfo: { name: 'Genudo', version: '2.0.1' },
          instructions: SERVER_INSTRUCTIONS
        }
      }));
      forwardRequest({ jsonrpc: '2.0', id: 'warmup', method: 'tools/list', params: {} })
        .catch(() => {});
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
    if (request.method === 'tools/list') {
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

    // Connect to SSE and get message endpoint
    await connectSSE();
    debug('Bridge initialized successfully');

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

// Start the bridge
main();
