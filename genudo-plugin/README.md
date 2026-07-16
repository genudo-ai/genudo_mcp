# Genudo Plugin for Claude

Genudo is the platform to build AI agents for any communication or sequence-based channel —
pipeline-aware agents with integration capabilities and company-knowledge access, all managed
from one platform, one inbox, and one analytics dashboard. This plugin brings the skills,
agents, and the Genudo connector to build, run, and improve them from Claude.

## What's inside

- **Connector** — the Genudo MCP server (`genudo-mcp-client`), exposing all workspace tools
  (pipelines, stages, actions, variables, opportunities, messages, analytics). The tool list
  grows automatically as the backend adds capabilities.
- **20 skills** — real playbooks for the actual work: creating a pipeline through a guided
  interview, editing a live agent safely, wiring webhook automations, analyzing conversations
  for drift, managing the funnel, and reporting.
- **6 agents** (Cowork & Code) — specialists that orchestrate the skills end to end.

## Install

**Upload (claude.ai):** Customize → Personal plugins → **+** → **Upload plugin** → drop the
zipped folder → **Upload**. Enter your Genudo token when prompted.

**Claude Desktop app:** the desktop plugin upload doesn't prompt for a token, so install two
pieces: Settings → **Plugins** → **Add** → **Upload plugin** → `genudo-plugin-desktop.zip`
(skills + agents), then Settings → **Extensions** → `genudo.mcpb` (the connector — asks for
your token).

**Claude Code:** add this repo as a marketplace, then `/plugin install genudo`.

Get your token from Genudo → **API Keys & Tokens** (sidebar, under *Developer*) →
**Create token** → check the **`mcp:use`** scope → pick an expiry → copy the token
(shown only once).

## Where each part runs

| Component | Web chat | Mobile | Desktop | Cowork | Code |
|---|---|---|---|---|---|
| Skills | ✅ | limited | ✅ | ✅ | ✅ |
| Agents | — | — | — | ✅ | ✅ |
| Connector (local) | — | — | ✅ | local | ✅ |

For web + mobile tool access, pair with the remote OAuth connector (backend roadmap).

## Working files

Build and edit skills stage their work as local markdown before any account write, so you
always get a diff to review:

- New pipelines → `./genudo-build/<pipeline>/`
- Instruction edits → `./instructions-updates/<pipeline>_<date>/vN/` (per the connector's
  editing playbook)
- Cached authoring guides → `./genudo-guides/`

No filesystem (plain web chat)? Skills keep the before/after inline and still gate on your
confirmation before writing.

## Safety

Every skill that writes to a live account shows what it will change and waits for explicit
confirmation. Agents never claim an action succeeded without a confirming tool result.

---

MIT · [genudo.ai](https://genudo.ai) · help@genudo.ai
