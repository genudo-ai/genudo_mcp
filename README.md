# Genudo MCP Client

[![npm version](https://img.shields.io/npm/v/genudo-mcp-client)](https://www.npmjs.com/package/genudo-mcp-client)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)

A lightweight bridge that connects [Claude Code](https://code.claude.com) to Genudo's Model Context Protocol (MCP) server, enabling AI-powered workflow automation directly from your Claude Code interface.

## Overview

Genudo MCP Client bridges the communication gap between Claude Code's stdio-based MCP implementation and Genudo's HTTP/SSE-based MCP server. This allows you to leverage Genudo's powerful business automation tools directly within your Claude Code conversations.

## Features

Access Genudo's business automation tools directly from Claude Code. The server exposes 21 tools across five areas:

- **📊 Analytics** — account summary, messaging volume stats, AI performance & cost (`get_account_summary`, `get_messaging_stats`, `get_ai_performance`)
- **🔎 Read your workspace** — list pipelines, stages, contacts, messages, opportunities, and variables (`list_pipelines`, `list_pipeline_stages`, `list_contacts`, `list_messages`, `list_opportunities`, `list_variables`)
- **🚀 Build pipelines** — a guided step-by-step builder plus direct create/update (`start_pipeline_journey`, `get_pipeline_options`, `create_pipeline`, `update_pipeline`)
- **🧩 Stages & actions** — configure pipeline stages and external-integration actions/webhooks (`create_stage`, `update_stage`, `create_action`, `update_action`)
- **⚙️ Variables & opportunities** — manage pipeline variables and update opportunities (`create_variable`, `update_variable`, `delete_variable`, `update_opportunities`)

### Three workflows to start with

1. **Audit my AI business operations** — Claude pulls your account, messaging, and AI-cost stats and surfaces the top fixes.
2. **Analyze my agent performance** — spot expensive agents, low-completion stages, and actions that aren't triggering.
3. **Create or improve a pipeline** — e.g. "Create a Messenger sales agent for a summer camp; collect name, phone, branch, child age; escalate on special-needs questions."

### Guided instruction editing (built in)

The connector doesn't just expose tools — it teaches the agent *how* to write good agent
instructions, entirely client-side (no extra setup):

- **Guide tools** — `get_instruction_guides` (authoring rules + persona/global + stage
  templates + a token-aware QA checklist) and `get_editing_playbook` (a safe
  load → edit → diff → confirm → push workflow). The agent pulls these on demand.
- **Prompts (slash-commands in any MCP client)** — `edit_instructions`, `build_pipeline`,
  `audit_pipeline`.
- **Safety** — before changing a live agent, the agent reads current text from
  `list_pipelines` / `list_pipeline_stages`, shows you a before/after diff with expected
  impact, and pushes with `update_pipeline` / `update_stage` only after you confirm.

## Quick Start

One command — no clone, no manual config:

```bash
claude mcp add --env GENUDO_API_KEY=YOUR_KEY --transport stdio genudo -- npx -y genudo-mcp-client
```

Replace `YOUR_KEY` with your Genudo API key (Settings → API Keys). Restart Claude Code and start using Genudo tools!

## Prerequisites

- Node.js 18.0.0 or higher
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

### Step 2: Connect your MCP client

**Recommended — Claude Code, one command:**

```bash
claude mcp add --env GENUDO_API_KEY=YOUR_KEY --transport stdio genudo -- npx -y genudo-mcp-client
```

**Other clients (Codex, Cursor, Windsurf, Claude Desktop):** same package, add this block to the client's MCP config:

```json
{
  "mcpServers": {
    "genudo": {
      "command": "npx",
      "args": ["-y", "genudo-mcp-client"],
      "env": {
        "GENUDO_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

<details>
<summary>Running from source instead (contributors)</summary>

If you cloned the repo rather than using the published package, point at your local `index.js`:

```json
{
  "mcpServers": {
    "genudo": {
      "command": "node",
      "args": ["/absolute/path/to/genudo_mcp/index.js"],
      "env": { "GENUDO_API_KEY": "your_api_key_here" }
    }
  }
}
```

Replace the path with where you cloned the repo.
</details>

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
- Check that `GENUDO_BASE_URL` is correct (defaults to `https://api.genudo.ai`)
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
| `GENUDO_REQUEST_TIMEOUT` | No | `8000` | Per-attempt request timeout in ms before retrying |
| `GENUDO_REQUEST_RETRIES` | No | `4` | Number of attempts for a request before giving up |

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

## Privacy Policy

This client is a local bridge. It does not collect, store, or transmit your data
anywhere except your configured Genudo endpoint.

- **Data handled:** your `GENUDO_API_KEY` and the JSON-RPC requests your MCP
  client makes are sent, over HTTPS, only to your Genudo server
  (`https://api.genudo.ai` by default) using the `Api-Key` header.
- **Local storage:** none. The bridge keeps no logs, no cache, and no telemetry;
  it holds nothing on disk. Your API key stays in your MCP client's own config.
- **Third parties:** no data is sent to any party other than Genudo.
- **Retention & account data:** data you access or create through Genudo is
  governed by Genudo's policies.

Full policies: [Privacy Policy](https://genudo.ai/legal/privacy-policy) ·
[Terms of Service](https://genudo.ai/legal/terms-of-service). Questions:
support@genudo.ai.

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

See the [GitHub Releases](https://github.com/genudo-ai/genudo_mcp/releases) page for changes and version history.

## Related Projects

- [Genudo](https://genudo.ai) - The main Genudo automation platform
- [Model Context Protocol](https://modelcontextprotocol.io) - Learn more about MCP
- [Claude Code](https://code.claude.com) - The Claude AI coding assistant
