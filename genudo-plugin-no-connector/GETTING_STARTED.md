# Getting Started — Genudo Plugin (no-connector build)

Build, edit, and analyze your Genudo AI sales/support agents from Claude.

This build carries the skills and agents only — you connect Genudo yourself, in step 2.
There is **no token to create**: the Genudo connector uses OAuth, so you approve access
in your browser.

## 1. Install the skills

**Claude Desktop / claude.ai:** Settings → **Plugins** → **Add** → **Upload plugin** →
drop `genudo-plugin-no-connector.zip`.

**Claude Code:**

```
/plugin marketplace add genudo-ai/genudo_mcp
/plugin install genudo-no-connector@genudo-ai
```

## 2. Connect Genudo — pick your surface

### Claude Desktop / claude.ai

Settings → **Connectors** → *Add custom connector* → URL `https://api.genudo.ai/mcp`,
then sign in when prompted. (The `genudo.mcpb` extension still works if you prefer it.)

### Claude Code — global skills, connector per project

Inside each client's project directory:

```
claude mcp add --transport http genudo https://api.genudo.ai/mcp --scope project
```

Each directory signs in separately, so opening a different client's project reaches a
different Genudo account — no tokens to keep apart. `--scope project` writes it to that
directory's `.mcp.json` (shared with the team); `--scope local` keeps it private to you.
Check with `claude mcp list`.

*(Want the connector bundled instead? Install the main `genudo` plugin. On claude.ai /
Cowork, upload `genudo-plugin.zip`.)*

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

- **Skills run but nothing reads your account** → no connector attached. Desktop: add the
  custom connector. Code: run the `claude mcp add` above from inside the project.
- **"tool not found" / stale behaviour** → re-upload the latest zip (Replace), then start a
  new chat (hosts load a server's tool list when a chat starts).
- **401 / not connected** → your sign-in expired or was revoked. Reconnect the Genudo server
  to run the browser sign-in again; in Code, `claude mcp remove genudo` in that project then
  re-add.
- **Wrong client's data** → you're in the wrong directory, or the connector was added with
  `--scope user`. `claude mcp list` shows which is in play.

Help: help@genudo.ai
