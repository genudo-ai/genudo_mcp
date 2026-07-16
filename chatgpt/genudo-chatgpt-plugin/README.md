# Genudo Plugin for ChatGPT & Codex

The Genudo workforce for OpenAI surfaces: the Genudo MCP connector (29 tools) plus
26 skills — the 20 task playbooks from the Claude plugin and 6 role playbooks
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
3. In a chat, say **"Connect Genudo"**. A secure page opens in your browser —
   paste your Genudo token there (Genudo account → API Keys & Tokens → Create token
   with the `mcp:use` scope; shown only once) and click Save. The token is stored
   locally (`~/.config/genudo/token`), never in the chat.
4. Try: "Use Genudo to list my pipelines."

Codex CLI instead: `codex plugin marketplace add genudo-ai/chatgpt-plugin`.

**Manual server (advanced, editable config):** instead of (or besides) the plugin's
bundled connector, add a standalone server you can edit in Settings → MCPs →
"+ Add server": Command `npx`, Arguments `-y` and `genudo-mcp-client@2.3.0`, and
optionally env `GENUDO_TOKEN` = your token (skip it and the "Connect Genudo" flow
takes over). Plugin-bundled servers appear under "From plugins" and are not
editable — that's the app's design, not a Genudo limitation. Don't run both
copies enabled at once (duplicate tools).

The connector runs `npx -y genudo-mcp-client` (Node 18+ required) and talks to
`https://api.genudo.ai`. A `GENUDO_TOKEN` env var still takes precedence over the
saved token; `GENUDO_BASE_URL` points at a self-hosted instance.

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
