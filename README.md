# Genudo MCP Client

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)](https://nodejs.org)

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

One command — no clone, no manual config:

```bash
claude mcp add --env GENUDO_API_KEY=YOUR_KEY --transport stdio genudo -- npx -y genudo-mcp-client
```

Replace `YOUR_KEY` with your Genudo API key (Settings → API Keys). Restart Claude Code and start using Genudo tools!

## Prerequisites

- Node.js 14.0.0 or higher
- A Genudo account with API access
- Your Genudo API key

## Installation

### Recommended: one command

```bash
claude mcp add --env GENUDO_API_KEY=YOUR_KEY --transport stdio genudo -- npx -y genudo-mcp-client
```

`npx` fetches and runs the published package — no clone, no local path. Get your API key from Settings → API Keys, then restart Claude Code.

### Alternative: from source

For local development or contributions:

```bash
git clone https://github.com/genudo-ai/genudo_mcp.git
cd genudo_mcp
npm install
```

Then configure Claude Code manually (see Configuration section below).

## Configuration

### Step 1: Get Your API Key

1. Log in to your [Genudo account](https://genudo.ai)
2. Navigate to **Settings** → **API Keys**
3. Click **Generate New API Key**
4. Copy your API key (keep it secure!)

### Step 2: Configure Claude Code

Edit your Claude Code configuration file at `~/.claude.json` and add:

```json
{
  "mcpServers": {
    "genudo": {
      "type": "stdio",
      "command": "node",
      "args": ["/absolute/path/to/genudo_mcp/index.js"],
      "env": {
        "GENUDO_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

**Important:** Replace `/absolute/path/to/genudo_mcp/` with the actual absolute path where you cloned the repository.

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
- 🐛 [Report an Issue](https://github.com/genudo-ai/genudo_mcp/issues)
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
