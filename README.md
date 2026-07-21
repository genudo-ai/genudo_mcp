# Genudo MCP Client

[![npm version](https://img.shields.io/npm/v/genudo-mcp-client)](https://www.npmjs.com/package/genudo-mcp-client)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)

Genudo is the platform to build AI agents for any communication or sequence-based channel — pipeline-aware agents with integration capabilities and company-knowledge access, all managed from one platform, one inbox, and one analytics dashboard. This lightweight bridge connects [Claude](https://claude.com) and other MCP clients to your Genudo workspace so you can build, run, and improve those agents directly from chat.

> 📖 **Which install is right for you?** See **[CONNECT.md](CONNECT.md)** — every way to connect
> Genudo to Claude (plugin, connector, desktop extension, other MCP clients, remote OAuth),
> weighted by value with copy-paste install commands.

## Overview

Genudo MCP Client bridges the communication gap between Claude Code's stdio-based MCP implementation and Genudo's HTTP/SSE-based MCP server. This allows you to leverage Genudo's powerful business automation tools directly within your Claude Code conversations.

## Features

Access Genudo's business automation tools directly from Claude Code. The server exposes 29 tools across five areas:

- **📊 Analytics** — account summary, messaging volume stats, AI performance & cost (`get_account_summary`, `get_messaging_stats`, `get_ai_performance`)
- **🔎 Discover** — list pipelines, stages, actions, variables, contacts, opportunities, messages, and knowledge tables; search knowledge; read follow-up configs; valid build options (`list_pipelines`, `list_pipeline_stages`, `list_actions`, `list_variables`, `list_contacts`, `list_opportunities`, `list_messages`, `list_knowledge_tables`, `search_knowledge_table`, `get_stage_followup`, `get_pipeline_options`)
- **🚀 Build** — a guided step-by-step builder plus direct creation of pipelines, stages, variables, webhook actions, follow-up sequences, and knowledge tables (`start_pipeline_journey`, `create_pipeline`, `create_stage`, `create_variable`, `create_action`, `create_followup`, `create_knowledge_table`, `upsert_knowledge_points`)
- **🔧 Update** — tune live pipelines, stages, actions, variables, opportunities (bulk), and follow-ups (`update_pipeline`, `update_stage`, `update_action`, `update_variable`, `update_opportunities`, `update_followup`)
- **🗑️ Delete** — remove knowledge rows by stable id (`delete_knowledge_points`)

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
claude mcp add --env GENUDO_TOKEN=YOUR_TOKEN --transport stdio genudo -- npx -y genudo-mcp-client
```

Replace `YOUR_TOKEN` with your Genudo token (**API Keys & Tokens** → **Create token** with the `mcp:use` scope — see [Get Your Token](#step-1-get-your-token)). Restart Claude Code and start using Genudo tools!

## Prerequisites

- Node.js 18.0.0 or higher
- A Genudo account with API access
- Your Genudo token

## Installation

### Recommended: one command

```bash
claude mcp add --env GENUDO_TOKEN=YOUR_TOKEN --transport stdio genudo -- npx -y genudo-mcp-client
```

`npx` fetches and runs the published package — no clone, no local path. Get your token from **API Keys & Tokens** (see below), then restart Claude Code.

### Alternative: from source

For local development or contributions:

```bash
git clone https://github.com/genudo-ai/genudo_mcp.git
cd genudo_mcp
npm install
```

Then configure Claude Code manually (see Configuration section below).

## Configuration

### Step 1: Get Your Token

1. Log in to your [Genudo account](https://app.genudo.ai)
2. In the sidebar, under **Developer**, open **API Keys & Tokens**
3. Click **Create token**
4. Name it (e.g. `claude-mcp`)
5. Under **Scopes**, scroll the list and check **`mcp:use`** (Access MCP server — SSE + JSON-RPC tool calls)
6. Pick an **Expiry** (30 days, 90 days, 1 year, or No Expiry)
7. Click **Create token** and copy the token — **it's shown only once**; Genudo keeps only a hashed copy

### Step 2: Connect your MCP client

**Recommended — Claude Code, one command:**

```bash
claude mcp add --env GENUDO_TOKEN=YOUR_TOKEN --transport stdio genudo -- npx -y genudo-mcp-client
```

**Other clients (Codex, Cursor, Windsurf, Claude Desktop):** same package, add this block to the client's MCP config:

```json
{
  "mcpServers": {
    "genudo": {
      "command": "npx",
      "args": ["-y", "genudo-mcp-client"],
      "env": {
        "GENUDO_TOKEN": "your_token_here"
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
      "env": { "GENUDO_TOKEN": "your_token_here" }
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
# Set your token
export GENUDO_TOKEN="your_token_here"

# Run the bridge
node index.js

# Send a test message (paste this and press Enter):
{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}

# You should receive a response with server info
```

## Troubleshooting

### "GENUDO_TOKEN environment variable is required"
- Make sure you've set the token in your Claude Code config
- Verify the token is valid in your Genudo account

### "Timeout waiting for endpoint from SSE"
- Check that `GENUDO_BASE_URL` is correct (defaults to `https://api.genudo.ai`)
- Verify your server is running and accessible
- Check firewall/network settings

### "HTTP 401: Unauthorized"
- Your token is invalid or expired
- Generate a new token in your Genudo account settings

### Connection Issues with Self-Signed Certificates
- The bridge is configured to accept self-signed certificates for local development
- For production, use proper SSL certificates

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GENUDO_TOKEN` | **Yes** | - | Your Genudo token from account settings |
| `GENUDO_BASE_URL` | No | `https://api.genudo.ai` | Base URL for self-hosted Genudo instances |
| `GENUDO_ALLOW_INSECURE_SSL` | No | `false` | Allow self-signed SSL certificates (local development only) |
| `GENUDO_REQUEST_TIMEOUT` | No | `8000` | Per-attempt request timeout in ms before retrying |
| `GENUDO_REQUEST_RETRIES` | No | `4` | Number of attempts for a request before giving up |
| `GENUDO_WORKDIR` | No | current directory | Root the agent writes local pipeline mirrors, version snapshots and cached guides into |

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

- **Never commit your token** to version control
- Store tokens securely (environment variables, secrets manager)
- Rotate tokens regularly
- Use HTTPS in production
- Limit token scopes to minimum required access

## Privacy Policy

This client is a local bridge. It does not collect, store, or transmit your data
anywhere except your configured Genudo endpoint.

- **Data handled:** your `GENUDO_TOKEN` and the JSON-RPC requests your MCP
  client makes are sent, over HTTPS, only to your Genudo server
  (`https://api.genudo.ai` by default) in the `Authorization: Bearer` header.
- **Local storage:** none. The bridge keeps no logs, no cache, and no telemetry;
  it holds nothing on disk. Your token stays in your MCP client's own config.
- **Third parties:** no data is sent to any party other than Genudo.
- **Retention & account data:** data you access or create through Genudo is
  governed by Genudo's policies.

Full policies: [Privacy Policy](https://genudo.ai/legal/privacy-policy) ·
[Terms of Service](https://genudo.ai/legal/terms-of-service). Questions:
help@genudo.ai.

## License

MIT

## Support

Need help? We're here for you:

- 📖 [Documentation](https://docs.genudo.ai)
- 💬 [Community Forum](https://community.genudo.ai)
- 🐛 [Report an Issue](https://github.com/genudo-ai/genudo_mcp/issues)
- 📧 [Email Support](mailto:help@genudo.ai)

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
