# Getting Started with the Genudo Plugin

Build, edit, and analyze your Genudo AI sales/support agents from Claude.

## 1. Install

Settings → **Plugins** → **Add** → **Upload plugin** → drop `genudo-plugin.zip`.

*(On claude.ai / Cowork: Customize → Personal plugins → **+** → **Upload plugin**.
In Claude Code: add this repo as a marketplace, then `/plugin install genudo`.)*

## 2. Sign in

There is **no token to create**. The first time a Genudo tool is used, Claude opens
your browser and asks you to approve access to your Genudo account. Approve it once
and you're connected — the plugin ships the connector, so nothing else to install.

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

- **"tool not found" / stale behaviour** → re-upload the latest zip (Replace), then
  start a new chat (hosts load a server's tool list when a chat starts).
- **401 / not connected** → your sign-in expired or was revoked. Reconnect the Genudo
  server from the connector/MCP settings to run the browser sign-in again.

Help: help@genudo.ai
