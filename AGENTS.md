# Agent instructions

<!-- loredex:start -->
## Research filing (loredex)

When you produce research, analysis, findings, plans, or similar markdown in
this project, add YAML frontmatter so loredex can auto-file it into the vault:

```yaml
---
project: genudo_mcp
topic: <kebab-case-topic>
type: research | finding | analysis | snapshot | note
date: YYYY-MM-DD
source: claude-code | codex | cursor | manual
tags: []
---
```

Write such files into the vault inbox at `/Users/tawfeeq/Loredex/_inbox`, or into this
project's `docs/` — `loredex route` picks up both.

Never add `loredex: routed` yourself — the router stamps it after filing.
A pre-stamped file is skipped as already-filed and will never reach the vault.

**Repo-specific rule:** only `docs/` holds loredex notes here. `genudo-plugin/` and
`genudo-plugin-no-connector/` are SHIPPED PRODUCT FILES (skills/agents with their own
frontmatter) — never run bare `loredex route` or `loredex adopt` in this repo (the LLM
classifier will misfile them); the Stop hook's `route --strict` is the only safe mode.
<!-- loredex:end -->

## Plugin marketplaces: public vs internal

- **Public** (`genudo-ai/claude-plugin` mirror, Claude directory): ONE plugin, `genudo`.
  `.github/workflows/sync-claude-plugin.yml` filters the root manifest down to `genudo`
  with `jq`. Never add `genudo-no-connector` to it or to
  public docs (README, CONNECT.md, mirror README).
- **Internal** (team machines, loredex client workspaces): the root
  `.claude-plugin/marketplace.json` here lists both `genudo` and `genudo-no-connector`
  under the same marketplace name `genudo-ai`, so `genudo-no-connector@genudo-ai` keys keep
  working. Point the machine's `genudo-ai` marketplace at this repo:
  `claude plugin marketplace remove genudo-ai && claude plugin marketplace add genudo-ai/genudo_mcp`.
- ChatGPT/Codex marketplace (`chatgpt/`) already ships one plugin.
