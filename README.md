# Genudo MCP Client

[![npm version](https://img.shields.io/npm/v/genudo-mcp-client.svg)](https://www.npmjs.com/package/genudo-mcp-client)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/node/v/genudo-mcp-client.svg)](https://nodejs.org)

A lightweight bridge that connects [Claude Code](https://code.claude.com) to Genudo's Model Context Protocol (MCP) server, enabling AI-powered workflow automation directly from your Claude Code interface.

## Overview

Genudo MCP Client bridges the communication gap between Claude Code's stdio-based MCP implementation and Genudo's HTTP/SSE-based MCP server. This allows you to leverage Genudo's powerful business automation tools directly within your Claude Code conversations.

## Features

Access Genudo's powerful business automation tools from Claude Code:

- **📊 Account Analytics** - Get comprehensive account summaries including channels, contacts, and message statistics
- **📈 Messaging Insights** - Retrieve detailed messaging volume statistics with date and provider filtering
- **🤖 AI Performance Metrics** - Monitor AI agent performance, response times, and operational costs
- **⚙️ Pipeline Management** - List available agent types, AI models, languages, and connected channels
- **🚀 Pipeline Creation** - Create and configure new AI-powered automation pipelines on the fly

## Quick Start

```bash
# Install globally via npm
npm install -g genudo-mcp-client

# Or use directly with npx (no installation needed)
npx genudo-mcp-client
```

Add to your `~/.claude.json`:
```json
{
  "mcpServers": {
    "genudo": {
      "type": "stdio",
      "command": "npx",
      "args": ["genudo-mcp-client"],
      "env": {
        "GENUDO_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

Restart Claude Code and start using Genudo tools!

## Prerequisites

- Node.js 14.0.0 or higher
- A Genudo account with API access
- Your Genudo API key

## Installation

### Option 1: Install from Local Directory (Development)

1. Clone this repository:
```bash
git clone <repository-url>
cd genudo-mcp-client
```

2. Install dependencies:
```bash
npm install
```

3. Get your API key from your Genudo account settings

4. Configure Claude Code to use the client (see Configuration section below)

### Option 2: Install via npm

```bash
npm install -g genudo-mcp-client
```

### Option 3: Use with npx (No Installation)

```bash
# Just add to config and Claude Code will run it automatically
# No separate installation needed
```

## Configuration

### Step 1: Get Your API Key

1. Log in to your [Genudo account](https://genudo.ai)
2. Navigate to **Settings** → **API Keys**
3. Click **Generate New API Key**
4. Copy your API key (keep it secure!)

### Step 2: Configure Claude Code

Edit your Claude Code configuration file at `~/.claude.json` and add:

**Recommended (using npx):**
```json
{
  "mcpServers": {
    "genudo": {
      "type": "stdio",
      "command": "npx",
      "args": ["genudo-mcp-client"],
      "env": {
        "GENUDO_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

**Using global installation:**
```json
{
  "mcpServers": {
    "genudo": {
      "type": "stdio",
      "command": "genudo-mcp-client",
      "env": {
        "GENUDO_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

### Step 3: Restart Claude Code

Exit your current Claude Code session and start a new one:

```bash
# Exit current session
exit

# Start new session
claude
```

## Usage

Once configured, Claude Code will automatically have access to your Genudo tools. You can use them in your conversations:

**Example:**
```
User: "Show me my account summary"
Claude: [Uses get_account_summary tool to fetch your data]

User: "Create a new sales pipeline using GPT-4"
Claude: [Uses get_pipeline_options and create_pipeline tools]
```

## Testing the Connection

You can test the bridge manually:

```bash
# Set your API key
export GENUDO_API_KEY="your_api_key_here"

# Run the bridge
node index.js

# Send a test message (paste this and press Enter):
{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}

# You should receive a response with server info
```

## Troubleshooting

### "GENUDO_API_KEY environment variable is required"
- Make sure you've set the API key in your Claude Code config
- Verify the API key is valid in your Genudo account

### "Timeout waiting for endpoint from SSE"
- Check that the GENUDO_SSE_URL is correct
- Verify your server is running and accessible
- Check firewall/network settings

### "HTTP 401: Unauthorized"
- Your API key is invalid or expired
- Generate a new API key in your Genudo account settings

### Connection Issues with Self-Signed Certificates
- The bridge is configured to accept self-signed certificates for local development
- For production, use proper SSL certificates

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GENUDO_API_KEY` | **Yes** | - | Your Genudo API key from account settings |
| `GENUDO_BASE_URL` | No | `https://api.genudo.ai` | Base URL for self-hosted Genudo instances |
| `GENUDO_ALLOW_INSECURE_SSL` | No | `false` | Allow self-signed SSL certificates (local development only) |

## Development

### Project Structure
```
genudo-mcp-client/
├── index.js           # Main bridge script
├── package.json       # Node.js project config
├── .env.example       # Environment variables template
└── README.md          # This file
```

### How It Works

1. Bridge connects to SSE endpoint to get the message POST URL
2. Reads JSON-RPC requests from stdin (from Claude Code)
3. Forwards requests as HTTP POST to the Genudo server
4. Returns responses via stdout back to Claude Code

```
Claude Code → (stdin) → Bridge → (HTTPS) → Genudo MCP Server
                ↑                              ↓
                └─────── (stdout) ←────────────┘
```

## Security Notes

- **Never commit your API key** to version control
- Store API keys securely (environment variables, secrets manager)
- Rotate API keys regularly
- Use HTTPS in production
- Limit API key permissions to minimum required access

## License

MIT

## Support

Need help? We're here for you:

- 📖 [Documentation](https://docs.genudo.ai)
- 💬 [Community Forum](https://community.genudo.ai)
- 🐛 [Report an Issue](https://github.com/genudo/genudo-mcp-client/issues)
- 📧 [Email Support](mailto:support@genudo.ai)

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to get started.

Quick overview:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a list of changes and version history.

## Related Projects

- [Genudo Platform](https://github.com/genudo/platform) - The main Genudo automation platform
- [Model Context Protocol](https://modelcontextprotocol.io) - Learn more about MCP
- [Claude Code](https://code.claude.com) - The Claude AI coding assistant
