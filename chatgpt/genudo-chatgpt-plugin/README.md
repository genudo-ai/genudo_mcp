# Genudo Plugin for ChatGPT & Codex

The Genudo workforce for OpenAI surfaces: the Genudo MCP connector (29 tools) plus
26 skills — the 20 task playbooks from the Claude plugin and 6 role playbooks
(architect, doctor, automation-engineer, analyst, kb-librarian, migrator) converted
from the Claude agents.

**Genudo** is the platform to build AI agents for any communication or sequence-based
channel — WhatsApp, Messenger, Instagram, LinkedIn, email, and more — managed from one
platform, one inbox, and one analytics dashboard.

## Install (ChatGPT desktop / ChatGPT Work)

1. Plugins → Create ▾ → **Add marketplace**:
   - Source: `genudo-ai/genudo_mcp`, Sparse paths: `chatgpt`
   - (or a local checkout: point Source at the `genudo_mcp/chatgpt` folder)
2. Install **genudo** from the plugin list.
3. Wire the token: Settings → MCP servers → genudo (gear icon) →
   Environment variables → set **`GENUDO_TOKEN`** to your token (literal value).
   Get the token from your Genudo account: API Keys & Tokens → Create token with the
   `mcp:use` scope (shown only once — copy it at creation).
4. Save, toggle the server on, then try: "Use Genudo to list my pipelines."

Codex CLI instead: `codex plugin marketplace add genudo-ai/genudo_mcp --sparse chatgpt`.

The connector runs `npx -y genudo-mcp-client` (Node 18+ required) and talks to
`https://api.genudo.ai`. For a self-hosted instance add a `GENUDO_BASE_URL` env var
in the same MCP settings form.

## What's inside

- `.mcp.json` — the Genudo connector (stdio bridge to your Genudo account).
- `skills/` — 26 skills, auto-invoked by task match or explicitly via `@`/`$` mention:
  discovery, pipeline authoring, provisioning, follow-ups, webhook automations,
  knowledge-base curation, conversation diagnosis, funnel analytics, migration, and
  the 6 role playbooks.

Every write to your account is diff-previewed and confirmed first — that rule is baked
into the skills and the connector's server instructions.

## Notes

- Do NOT add the repo ROOT as a ChatGPT marketplace: the app then reads the root
  `.claude-plugin/marketplace.json` and installs the Claude plugin trees (20 skills,
  Claude-oriented descriptions). The ChatGPT marketplace lives in `chatgpt/` on purpose.
- Skills under `skills/` (except the 6 role playbooks) are kept byte-identical to
  `../../genudo-plugin/skills/` — edit there and copy here. The 6 role playbooks are
  `../../genudo-plugin/agents/*.md` minus the `model:` line.
- The remote/OAuth ChatGPT app (widgets, no local install) is a separate track; this
  plugin is the local-bridge distribution, mirroring the Claude Code plugin.
