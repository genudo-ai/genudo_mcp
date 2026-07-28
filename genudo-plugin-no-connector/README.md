# Genudo Plugin for Claude — no-connector build

Genudo is the platform to build AI agents for any communication or sequence-based channel —
pipeline-aware agents with integration capabilities and company-knowledge access, all managed
from one platform, one inbox, and one analytics dashboard. This plugin brings the skills and
agents to build, run, and improve them from Claude.

**This build ships no connector.** Same 22 skills and 6 agents as the main `genudo` plugin,
minus the bundled MCP server — you connect Genudo yourself. That's what you want when:

- **You manage several Genudo accounts** — install this globally for the skills, then point
  each project at the account it belongs to.
- **You already connect Genudo another way** — a custom connector in Claude's settings, a
  server in your project's `.mcp.json`, or the `genudo.mcpb` extension.

## What's inside

- **22 skills** — real playbooks for the actual work: creating a pipeline through a guided
  interview, editing a live agent safely, wiring webhook automations, analyzing conversations
  for drift, managing the funnel, and reporting.
- **6 agents** (Cowork & Code) — specialists that orchestrate the skills end to end.

No connector. Without one, the skills can plan and draft but can't read or write your account.

## Install

**Claude Desktop / claude.ai:** Settings → **Plugins** → **Add** → **Upload plugin** → drop
`genudo-plugin-no-connector.zip`. Then connect Genudo once: Settings → **Connectors** → *Add
custom connector* → `https://api.genudo.ai/mcp` (or install the `genudo.mcpb` extension).

**Claude Code — plugin global, connector per project:**

```
/plugin marketplace add genudo-ai/genudo_mcp
/plugin install genudo-no-connector@genudo-ai
```

Then from inside each client's project directory:

```
claude mcp add --transport http genudo https://api.genudo.ai/mcp --scope project
```

`--scope project` writes the server into that directory's `.mcp.json`, so it travels with the
project; use `--scope local` to keep it private to you. Each directory signs in to its own
Genudo account through the browser — no tokens to juggle. `claude mcp list` confirms which
one is active.

*(Want the connector bundled instead? Install the main `genudo` plugin.)*

There is **no token to create** — the connector uses OAuth. For a self-hosted Genudo, use
`https://<your-instance>/mcp`.

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

The `editing-playbook` skill is the source of truth for this layout, the version
snapshots and the `**Status:** STAGED / PUSHED` record. This README only summarizes it.

No filesystem (plain web chat)? Skills keep the before/after inline and still gate on your
confirmation before writing.

## Safety

Every skill that writes to a live account shows what it will change and waits for explicit
confirmation. Agents never claim an action succeeded without a confirming tool result.

---

MIT · [genudo.ai](https://genudo.ai) · help@genudo.ai
