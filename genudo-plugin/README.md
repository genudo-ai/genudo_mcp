# Genudo Plugin for Claude

Genudo is the platform to build AI agents for any communication or sequence-based channel —
pipeline-aware agents with integration capabilities and company-knowledge access, all managed
from one platform, one inbox, and one analytics dashboard. This plugin brings the skills,
agents, and the Genudo connector to build, run, and improve them from Claude.

## What's inside

- **Connector** — the Genudo MCP server at `https://api.genudo.ai/mcp`, exposing all
  workspace tools (pipelines, stages, actions, variables, opportunities, messages,
  analytics). It is a **remote** server: nothing runs locally, and you sign in through
  your browser instead of pasting a token. The tool list grows automatically as the
  backend adds capabilities.
- **22 skills** — real playbooks for the actual work: creating a pipeline through a guided
  interview, editing a live agent safely, wiring webhook automations, analyzing conversations
  for drift, managing the funnel, and reporting.
- **6 agents** (Cowork & Code) — specialists that orchestrate the skills end to end.

## Install

**Upload (claude.ai):** Customize → Personal plugins → **+** → **Upload plugin** → drop the
zipped folder → **Upload**. Approve the Genudo sign-in when prompted.

**Claude Desktop app:** Settings → **Plugins** → **Add** → **Upload plugin** →
`genudo-plugin.zip`. The connector comes with it — no separate extension, no token.

**Claude Code:** add this repo as a marketplace, then `/plugin install genudo`.

There is **no token to create**. The connector authenticates with OAuth: Claude opens
your browser, you approve access to your Genudo account, and that's it. To connect
Genudo without this plugin, add the URL directly — Settings → **Connectors** → *Add
custom connector* → `https://api.genudo.ai/mcp`, or in Claude Code:

```bash
claude mcp add --transport http genudo https://api.genudo.ai/mcp
```

## Where each part runs

| Component | Web chat | Mobile | Desktop | Cowork | Code |
|---|---|---|---|---|---|
| Skills | ✅ | limited | ✅ | ✅ | ✅ |
| Agents | — | — | — | ✅ | ✅ |
| Connector (remote) | ✅ | limited | ✅ | ✅ | ✅ |

Because the connector is remote, web chat now gets tool access too — that used to
require a locally running bridge. Adding custom connectors is a paid-plan feature on
claude.ai.

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

The `editing-playbook` skill is the source of truth for this layout, the version
snapshots and the `**Status:** STAGED / PUSHED` record. This README only summarizes it.

No filesystem (plain web chat)? Skills keep the before/after inline and still gate on your
confirmation before writing.

## Safety

Every skill that writes to a live account shows what it will change and waits for explicit
confirmation. Agents never claim an action succeeded without a confirming tool result.

---

MIT · [genudo.ai](https://genudo.ai) · help@genudo.ai
