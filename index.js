#!/usr/bin/env node

const EventSource = require('eventsource');
const fetch = require('node-fetch');
const readline = require('readline');
const https = require('https');

// Configuration from environment variables
const BASE_URL = process.env.GENUDO_BASE_URL || 'https://api.genudo.ai';
const SSE_URL = `${BASE_URL}/api/user/mcp/sse`;
const API_KEY = process.env.GENUDO_API_KEY;
const ALLOW_INSECURE_SSL = process.env.GENUDO_ALLOW_INSECURE_SSL === 'true';

// The Genudo backend can be slow to answer the first request after connecting
// (cold start — observed 1s to 30s+). Rather than let one slow attempt hang the
// whole MCP handshake, we time out each attempt fast and retry.
const REQUEST_TIMEOUT = parseInt(process.env.GENUDO_REQUEST_TIMEOUT || '8000', 10);
const REQUEST_RETRIES = parseInt(process.env.GENUDO_REQUEST_RETRIES || '4', 10);

// HTTPS agent configuration
// For local development with self-signed certificates, set GENUDO_ALLOW_INSECURE_SSL=true
const httpsAgent = new https.Agent({
  rejectUnauthorized: !ALLOW_INSECURE_SSL
});

// Validate configuration
if (!API_KEY) {
  console.error('ERROR: GENUDO_API_KEY environment variable is required');
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
        'Api-Key': API_KEY
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
          'Api-Key': API_KEY
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
          capabilities: { tools: {} },
          serverInfo: { name: 'Genudo', version: '1.0.0' }
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
