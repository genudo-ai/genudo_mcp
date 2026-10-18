# GenuDo Plugin for Google Antigravity & Gemini CLI (`agy`)

Official GenuDo integration for **Google Antigravity IDE** and **Gemini CLI (`agy`)**.

This plugin bundles:
- **GenuDo Remote MCP Connection**: Streamable HTTP MCP server at `https://api.genudo.ai/mcp`.
- **Workflow Skills**: On-demand runbooks with progressive disclosure for pipelines, knowledge bases, messaging analytics, and follow-up sequences.
- **Agent Conventions**: Operating guidelines, safety rules, and validation standards for GenuDo tools.

---

## Plugin Directory Structure

```text
genudo/
├── plugin.json               # Plugin manifest (name, version, author)
├── mcp_config.json           # Remote MCP HTTP configuration
├── README.md                 # Plugin documentation and installation guide
├── rules/
│   └── genudo-conventions.md # Agent safety and validation guidelines
└── skills/
    ├── pipeline-management/
    │   └── SKILL.md          # Pipeline, stage, and action creation & troubleshooting
    ├── knowledge-tables/
    │   └── SKILL.md          # Vector grounding, table schemas, and points curation
    ├── messaging-operations/
    │   └── SKILL.md          # Multi-channel analytics, transcript audit, CRM sync
    ├── stage-followups/
    │   └── SKILL.md          # Per-stage timed re-engagement sequence runbook
    ├── shopify-catalog-export/
    │   └── SKILL.md          # Shopify product export, clean CSV & formatted Excel KB generator
    │   # Agent QA loop (engine: github.com/genudo-ai/genudo-agent-testing-engine)
    ├── mine-customer-chats/       # Real buyer intents + knowledge gaps from live chats
    ├── generate-test-journeys/    # Multi-turn synthetic-customer test suites
    ├── setup-testing-engine/      # Install + verify the testing engine
    ├── run-agent-tests/           # Run suites against a live agent, archive test leads
    ├── evaluate-agent-replies/    # Deterministic checks + assistant-as-judge
    ├── remediate-agent-defects/   # Root cause + surgical instruction/KB fixes
    └── plan-qa-sprint/            # 2-week sprint backlog in Excel
```

---

## Installation

### Option 1: Global Installation (Machine-wide)
Install the plugin globally so it is available across all Antigravity projects on your machine:

```bash
# Create global plugin directory and copy plugin files
mkdir -p ~/.gemini/config/plugins/genudo
cp -R antigravity/genudo/* ~/.gemini/config/plugins/genudo/
```

### Option 2: Per-Project Installation (Team & VCS Shared)
Commit the plugin into your project's `.agents/` directory:

```bash
mkdir -p .agents/plugins/genudo
cp -R antigravity/genudo/* .agents/plugins/genudo/
```

---

## Authentication & Seamless Sign-In

GenuDo provides a seamless browser-based authorization flow for Antigravity & Gemini CLI:

1. **Seamless Browser Flow (Recommended)**:
   - When configuring or connecting via CLI, open the generated authorization link in your browser.
   - Click **Allow** to approve access.
   - The redirect page immediately provides your authenticated token.
   - Copy the token and paste it into the CLI prompt, or export it in your environment:
     ```bash
     export GENUDO_TOKEN="your_token_here"
     ```
2. **Dashboard Alternative**:
   - You can also generate a token manually at [app.genudo.ai](https://app.genudo.ai) under **Developer > API Keys & Tokens** with the `mcp:use` scope checked.

The plugin's `mcp_config.json` automatically injects this token into HTTP Authorization headers:
```json
{
  "mcpServers": {
    "genudo": {
      "type": "http",
      "url": "https://api.genudo.ai/mcp",
      "serverUrl": "https://api.genudo.ai/mcp",
      "headers": {
        "Authorization": "Bearer ${GENUDO_TOKEN}"
      },
      "trust": true
    }
  }
}
```

---

## Verification

### Validate Plugin
Run the Antigravity CLI plugin validator:

```bash
agy plugin validate antigravity/genudo
```

Expected output:
```text
  [ok]    antigravity/genudo
          ✔ skills      : 11 processed
          - agents      : skipped (not found)
          - commands    : skipped (not found)
          ✔ mcpServers  : 1 processed
          - hooks       : skipped (not found)
```

### Check MCP Server
Verify that the `genudo` MCP server is registered:

```bash
agy mcp list
```

---

## Included Skills

- **`genudo-pipeline-management`**: Discover, scaffold, update, and troubleshoot multi-stage conversational pipelines and action bindings.
- **`genudo-knowledge-tables`**: Manage structured knowledge schemas, upsert vector grounding points with stable IDs, and test semantic retrieval.
- **`genudo-messaging-operations`**: Review messaging volume across WhatsApp, Instagram, Messenger, and LinkedIn, inspect conversation histories, and sync opportunities.
- **`genudo-stage-followups`**: Configure automated re-engagement schedules, drafting instructions, and expiration transitions for inactive leads.
