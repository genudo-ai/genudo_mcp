# Genudo Plugin for Claude — Desktop / per-project build

Genudo is the platform to build AI agents for any communication or sequence-based channel —
pipeline-aware agents with integration capabilities and company-knowledge access, all managed
from one platform, one inbox, and one analytics dashboard. This plugin brings the skills and
agents to build, run, and improve them from Claude.

**This build ships no connector.** Same 20 skills and 6 agents as the main `genudo` plugin,
minus the bundled MCP server — you add the connector separately. Two reasons that's what you
want:

- **Claude Desktop app** — its plugin upload can't prompt for a token, so a bundled connector
  could never authenticate there. Pair this with the `genudo.mcpb` extension, which does prompt.
- **Multiple Genudo accounts** — install this globally for the skills, then add the connector
  per project with that client's own token.

## What's inside

- **20 skills** — real playbooks for the actual work: creating a pipeline through a guided
  interview, editing a live agent safely, wiring webhook automations, analyzing conversations
  for drift, managing the funnel, and reporting.
- **6 agents** (Cowork & Code) — specialists that orchestrate the skills end to end.

No connector. Without one, the skills can plan and draft but can't read or write your account.

## Install

**Claude Desktop app — two pieces:**

1. Settings → **Plugins** → **Add** → **Upload plugin** → drop `genudo-plugin-desktop.zip`.
2. Settings → **Extensions** → install `genudo.mcpb` → paste your token when prompted.

**Claude Code — plugin global, connector per project:**

```
/plugin marketplace add genudo-ai/genudo_mcp
/plugin install genudo-desktop@genudo-ai
```

Then from inside each client's project directory:

```
claude mcp add --scope local --env GENUDO_TOKEN=CLIENT_TOKEN --transport stdio genudo -- npx -y genudo-mcp-client@2.4.0
```

`--scope local` keeps that server and token private to you and to that directory. Repeat per
client with that client's token; `claude mcp list` confirms which one is active.

*(Want one account and one global connector instead? Install the main `genudo` plugin — it
bundles the connector and prompts for your token.)*

Get your token from Genudo → **API Keys & Tokens** (sidebar, under *Developer*) →
**Create token** → check the **`mcp:use`** scope → pick an expiry → copy the token
(shown only once).

## Where each part runs

| Component | Web chat | Mobile | Desktop | Cowork | Code |
|---|---|---|---|---|---|
| Skills | ✅ | limited | ✅ | ✅ | ✅ |
| Agents | — | — | — | ✅ | ✅ |
| Connector (added separately) | — | — | ✅ | local | ✅ |

For web + mobile tool access, pair with the remote OAuth connector (backend roadmap).

## Working files

Build and edit skills stage their work as local markdown before any account write, so you
always get a diff to review — and keep a browsable local mirror of each pipeline, so you
can read a client's agent offline, in any editor, without the platform open:

```
pipelines/<pipeline>/     # live mirror: _persona.md, _instructions.md, pipeline.yaml,
                          # stages/NN_<stage>/, versions/vNN_<date>/
genudo-build/<pipeline>/  # new pipelines being drafted
genudo-guides/            # cached authoring guides
```

Everything lands under `$GENUDO_WORKDIR` when that env var is set, else the current
directory — set it to keep all client work in one stable folder.

The connector's `get_editing_playbook` is the source of truth for this layout, the version
snapshots and the `**Status:** STAGED / PUSHED` record. This README only summarizes it.

No filesystem (plain web chat)? Skills keep the before/after inline and still gate on your
confirmation before writing.

## Safety

Every skill that writes to a live account shows what it will change and waits for explicit
confirmation. Agents never claim an action succeeded without a confirming tool result.

---

MIT · [genudo.ai](https://genudo.ai) · help@genudo.ai
