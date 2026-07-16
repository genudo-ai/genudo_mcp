# Getting Started with the Genudo Plugin

Build, edit, and analyze your Genudo AI sales/support agents from Claude.

## 1. Get your token

1. Log in at [app.genudo.ai](https://app.genudo.ai).
2. Sidebar → **Developer** → **API Keys & Tokens** → **Create token**.
3. Name it (e.g. `claude-mcp`), scroll **Scopes** and check **`mcp:use`**, pick an
   **Expiry** (30/90 days, 1 year, or No Expiry).
4. **Create token** and copy it right away — **it's shown only once**.

## 2. Install (Claude Desktop app)

The Desktop app's plugin upload doesn't ask for a token, so install two pieces:

1. **Skills + agents** — Settings → **Plugins** → **Add** → **Upload plugin** → drop
   `genudo-plugin-desktop.zip`.
2. **Connector** — Settings → **Extensions** → install `genudo.mcpb` → paste your token
   when prompted.

*(On claude.ai / Cowork, upload `genudo-plugin.zip` instead — Customize → Personal plugins →
**+** → **Upload plugin** — and paste your token when prompted. Web and mobile tool access
aren't supported yet.)*

## Use it

Type `/` in chat to run a skill, or just say what you want:

- *"Build me a WhatsApp sales agent for a summer camp."* → guided pipeline build
- *"Register interested leads to Google Sheets via n8n."* → webhook automation
- *"Why did my agent say that? Here's the conversation link."* → root-cause + fix
- *"How's my funnel doing?"* → funnel + numbers

**Agents** (pipeline-architect, pipeline-doctor, automation-engineer, revenue-analyst,
kb-librarian, pipeline-migrator)
run in **Cowork** for hands-off, multi-step work.

## Good to know

- **It always confirms before changing your account** — you see a diff first.
- New pipelines and edits are drafted as local files you can review.
- Knowledge-base and follow-up management are fully live, and `pipeline-migrator` can
  upgrade old-format pipelines to the current authoring approach.

## Trouble?

- **"tool not found" / stale behaviour** → re-upload the latest zip (Replace); if it
  persists, clear the npx cache: `rm -rf ~/.npm/_npx`.
- **401 / not connected** → your token is wrong or expired; remove the plugin fully,
  re-upload, and enter a fresh token.

Help: help@genudo.ai
