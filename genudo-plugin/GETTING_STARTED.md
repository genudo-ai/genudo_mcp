# Getting Started with the Genudo Plugin

Build, edit, and analyze your Genudo AI sales/support agents from Claude.

## Install (5 steps)

1. **Get your token** — Genudo → **Settings → API Keys**.
2. **Open Claude Desktop** (or Cowork). *Web and mobile aren't supported yet.*
3. **Install** — Customize → Personal plugins → **+** → **Upload plugin** → drop
   `genudo-plugin.zip` → **Upload** → **Continue**.
4. **Paste your token** when prompted.
5. **Check it connected** — Customize → Genudo → **Connectors → genudo** should show
   `-y genudo-mcp-client@2.0.1`.

## Use it

Type `/` in chat to run a skill, or just say what you want:

- *"Build me a WhatsApp sales agent for a summer camp."* → guided pipeline build
- *"Register interested leads to Google Sheets via n8n."* → webhook automation
- *"Why did my agent say that? Here's the conversation link."* → root-cause + fix
- *"How's my funnel doing?"* → funnel + numbers

**Agents** (pipeline-architect, pipeline-doctor, automation-engineer, revenue-analyst)
run in **Cowork** for hands-off, multi-step work.

## Good to know

- **It always confirms before changing your account** — you see a diff first.
- New pipelines and edits are drafted as local files you can review.
- Two skills (follow-ups, knowledge base) are ready and switch on automatically when
  those features reach the connector.

## Trouble?

- **"tool not found" / stale behaviour** → re-upload the latest zip (Replace); if it
  persists, clear the npx cache: `rm -rf ~/.npm/_npx`.
- **401 / not connected** → your token is wrong or expired; remove the plugin fully,
  re-upload, and enter a fresh token.

Help: help@genudo.ai
