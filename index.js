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
      https: { rejectUnauthorized: false }
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

  const response = await fetch(messageEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Api-Key': API_KEY
    },
    body: JSON.stringify(jsonRpcRequest),
    agent: httpsAgent
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  // Handle 204 No Content (for notifications)
  if (response.status === 204) {
    return null;
  }

  return await response.json();
}

/**
 * Process a single line of input (JSON-RPC request)
 */
async function processInput(line) {
  try {
    const request = JSON.parse(line);
    debug('Received request:', request.method);

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
