# Genudo Plugin for ChatGPT & Codex

The Genudo workforce for OpenAI surfaces: the Genudo MCP connector (29 tools) plus
28 skills — the 22 task playbooks from the Claude plugin and 6 role playbooks
(architect, doctor, automation-engineer, analyst, kb-librarian, migrator) converted
from the Claude agents.

**Genudo** is the platform to build AI agents for any communication or sequence-based
channel — WhatsApp, Messenger, Instagram, LinkedIn, email, and more — managed from one
platform, one inbox, and one analytics dashboard.

## Install (ChatGPT desktop / ChatGPT Work)

1. Plugins → Create ▾ → **Add marketplace** → Source: `genudo-ai/chatgpt-plugin`
   (dev testing from the monorepo instead: Source `genudo-ai/genudo_mcp` + Sparse
   paths `chatgpt`, or point Source at a local `genudo_mcp/chatgpt` folder)
2. Install **genudo** from the plugin list.
3. Sign in to Genudo when prompted — the connector is a remote server that uses
   OAuth, so a browser page opens and you approve access. **No token to create or
   paste.** In Codex CLI, start it yourself with `codex mcp login genudo`.
4. Start a **new task/chat** (the app loads a server's tools at task start) and try:
   "Use Genudo to list my pipelines."

Codex CLI instead: `codex plugin marketplace add genudo-ai/chatgpt-plugin`.

**Manual server (advanced, editable config):** instead of (or besides) the plugin's
bundled connector, add a standalone server in Settings → MCPs → "+ Add server",
Type **Streamable HTTP**, URL `https://api.genudo.ai/mcp`. Plugin-bundled servers
appear under "From plugins" and are not editable — that's the app's design. Don't
run both copies enabled at once (duplicate tools).

No Node, no npm and no local process are involved: the connector is the hosted
Genudo endpoint (`https://api.genudo.ai/mcp`), reached over Streamable HTTP with
OAuth. For a self-hosted instance, point the manual server at
`https://<your-instance>/mcp` instead.

## What's inside

- `.mcp.json` — the Genudo connector (remote Streamable HTTP server, OAuth).
- `skills/` — 28 skills, auto-invoked by task match or explicitly via `@`/`$` mention:
  discovery, pipeline authoring, provisioning, follow-ups, webhook automations,
  knowledge-base curation, conversation diagnosis, funnel analytics, migration, and
  the 6 role playbooks.

Every write to your account is diff-previewed and confirmed first — that rule is baked
into the skills and the connector's server instructions.

## Notes

- Do NOT add the repo ROOT as a ChatGPT marketplace: the app then reads the root
  `.claude-plugin/marketplace.json` and installs the Claude plugin trees (22 skills,
  Claude-oriented descriptions). The ChatGPT marketplace lives in `chatgpt/` on purpose.
- Skills under `skills/` (except the 6 role playbooks) are kept byte-identical to
  `../../genudo-plugin/skills/` — edit there and copy here. The 6 role playbooks are
  `../../genudo-plugin/agents/*.md` minus the `model:` line.
- The connector is no longer vendored as a Node bundle — since v2.0.0 the plugin declares
  the hosted Streamable HTTP server (`https://api.genudo.ai/mcp`, OAuth). Nothing to
  rebuild after a bridge change. The stdio bridge lives on as the `genudo-mcp-client` npm
  package for self-hosted or token-based setups.
- The remote/OAuth ChatGPT app (widgets, no local install) is still a separate track; this
  plugin is the marketplace distribution, mirroring the Claude Code plugin.
