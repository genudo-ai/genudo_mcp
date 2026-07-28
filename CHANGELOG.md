# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.5.0] - 2026-07-28

### Changed
- **Streamable HTTP transport.** The bridge now POSTs every JSON-RPC message straight to
  `{BASE_URL}/mcp`. The old two-step SSE flow (`GET /api/user/mcp/sse` → `endpoint` event →
  POST to the returned URL) is gone; the backend retired that route and it now returns 404
  on both production and staging, so **2.4.0 and earlier can no longer reach Genudo** —
  upgrading is mandatory, not optional.
- Backend handshake is a single `initialize` POST. An `Mcp-Session-Id` returned by the
  server is echoed on later requests; the current backend is stateless and returns none.
- Replies are read as either JSON or a single SSE-framed message, whichever the server
  sends.
- `.env.example` now states the required token scope as `mcp:use` (was `mcp:access`) and
  names the endpoint the token is sent to.

### Removed
- The `eventsource` dependency, and with it the SSE reconnect-storm guard and its
  `GENUDO_MAX_RECONNECTS` setting — a request/response transport has no connection to
  storm on. `node-fetch` is now the only runtime dependency.

### Plugins (all trees → 2.0.0)

- **The connector is now the hosted server**, declared as `{"type": "http", "url":
  "https://api.genudo.ai/mcp"}` for Claude and `{"url": ..., "auth": "oauth"}` for
  ChatGPT/Codex. Users sign in through the browser — **no token to create or paste**, no
  Node, no local process, and it works in Claude web chat, which a local bridge never could.
  `userConfig.token` / `userConfig.base_url` are gone from the Claude plugin.
- **Two new skills, `instruction-guides` and `editing-playbook`**, carrying the same text the
  bridge's `get_instruction_guides` / `get_editing_playbook` tools return. The 4 skills and
  2 agents that used to call those tools now run these skills, so the plugins no longer
  depend on the stdio bridge being the connector. 20 skills → 22 (ChatGPT: 26 → 28).
- **`genudo-plugin-desktop` → `genudo-plugin-no-connector`, plugin id `genudo-desktop` →
  `genudo-no-connector`.** Its original reason to exist (Desktop's plugin upload can't collect
  a token) disappeared with OAuth; it is now simply the no-connector build, for when you
  connect Genudo yourself — e.g. a different account per project via
  `claude mcp add --transport http genudo https://api.genudo.ai/mcp --scope project`.
  **Breaking:** the old id no longer resolves. Existing users run
  `/plugin uninstall genudo-desktop@genudo-ai` then `/plugin install genudo-no-connector@genudo-ai`.
  The distributed zip is renamed to `genudo-plugin-no-connector.zip`.
- **The vendored ChatGPT connector bundle is gone** (`chatgpt/genudo-chatgpt-plugin/
  connector/index.js`, 440K of bundled Node) along with the rule to rebuild it after every
  bridge change. Regenerate with `scripts/build-chatgpt-connector.sh` if ever needed.

## [2.4.0] - 2026-07-21

### Added
- **Local pipeline mirror.** The editing playbook now has the agent write a browsable
  offline copy of each pipeline — `pipelines/<slug>/` with `_persona.md`,
  `_instructions.md`, `_actions.yaml`, `_variables.yaml`, `pipeline.yaml` and
  `stages/NN_<slug>/` — refreshed after every push. Prose fields stay markdown; config
  stays YAML with block scalars instead of escaped-newline strings. A pipeline folder is
  readable in Finder or any editor without the platform open.
- **Complete version snapshots.** `versions/vNN_<date>/` now holds the whole unit as it
  stood, not only the edited fields, so any version reads on its own.
- **Push state visible in the folder.** `CHANGES.md` opens with `**Status:** STAGED`,
  flipped to `PUSHED · <timestamp>` (or `PARTIAL`, with per-edit state) the moment the
  update calls return. Previously a version folder looked identical before and after a
  push, so "did this ship?" could only be answered by re-reading the account.
- **`manifest.json`** beside `CHANGES.md` — the same facts machine-readable
  (`schema`, `pipeline`, `state`, `pushed_at`, per-edit `target`/`file`/`state`/`response_ok`)
  for scripts, editor extensions and CI.
- **`GENUDO_WORKDIR`** — anchors every local path (mirrors, build drafts, version
  snapshots, cached guides) to one stable folder instead of wherever the agent started.
  Falls back to the current directory. Exposed as a `Working folder` option in the
  Claude Desktop extension.
- **`<field>.after.md` / `<field>.after.yaml`** specified for proposed text, so agents
  stop inventing their own after-file names.

### Changed
- Pipeline folders are named for the pipeline; identity lives in `pipeline.yaml` (`id`).
  On refresh the agent reconciles by id and renames a stale folder rather than leaving
  two folders for one pipeline.
- Plugin READMEs point at `get_editing_playbook` instead of restating the staging paths,
  which had already drifted from it.

## [2.2.1] - 2026-07-09

### Fixed
- **Claude Desktop extension (.mcpb) never started (2.0.3–2.2.0 regression).** The
  retry-storm fix added an `if (require.main === module)` guard so tests could import
  helpers — but Claude Desktop's MCPB host loads the entry file via `require()`, where
  `require.main !== module`, so `main()` never ran: the extension showed "Unable to
  connect to extension server" while the process sat silent. The guard is replaced with
  a `GENUDO_SKIP_MAIN` env opt-out (used only by tests). npx/Claude Code launches were
  never affected (direct execution).

## [2.2.0] - 2026-07-09

### Changed
- **Bearer-only authentication.** The production backend has completed its token-auth
  migration, so the transitional legacy `Api-Key` header is no longer sent — every request
  now carries only `Authorization: Bearer <token>`. Verified live against production
  (SSE handshake, tools/list = 29, read calls). Requires a backend that accepts Bearer
  tokens; all Genudo environments do as of this release.

## [2.1.0] - 2026-07-09

### Changed
- **Guidance updated for the 29-tool backend** (verified live). The `initialize`
  preamble now covers the new tool groups and no longer steers clients away from
  tools that exist:
  - New patterns: **knowledge base** (`list_knowledge_tables`,
    `create_knowledge_table`, `upsert_knowledge_points`, `search_knowledge_table`,
    `delete_knowledge_points`), **follow-ups** (`get_stage_followup`,
    `create_followup`, `update_followup`), and **action auditing** (`list_actions`,
    `update_action`).
  - The old "Not exposed (do not attempt)" rule wrongly listed action listing and
    KB management — both are now real. The rule now lists only what is genuinely
    absent: deleting pipelines/stages/actions/variables, manual messages, plan limits.
  - New rules: one follow-up per stage; `update_followup` intervals replace the whole
    schedule; knowledge rows need a stable `default_id` + every column; variable
    renames are ignored once actions reference the variable.
- Note: `delete_variable` no longer exists on the backend and was removed from all
  guidance.
- 2.0.3 (retry-storm fix) was never published separately; this release carries it.

## [2.0.3] - 2026-07-08

### Fixed
- **Retry storm from wrong/expired tokens.** A bad token made every client hammer
  the backend indefinitely: the SSE connection auto-reconnected ~once per second
  forever, and each forwarded request retried its `401` up to 4 times. Across many
  misconfigured clients this became thousands of doomed requests per hour. Now:
  - SSE auth failures (`401`/`403`) are **fatal** — the bridge logs a clear
    "check GENUDO_TOKEN" message and exits instead of reconnecting a token that can
    never work.
  - SSE reconnects for transient errors (network, `5xx`) are **capped** at
    `GENUDO_MAX_RECONNECTS` (default 5), then the bridge exits.
  - Forwarded requests **no longer retry `4xx`** (`401`/`403`/`400`/`404`/`429`) —
    those are permanent for the token/request and only added load. `5xx`, timeouts,
    and network errors still retry as before.

## [2.0.2] - 2026-07-07

### Fixed
- **Prod-breaking regression from 2.0.0/2.0.1:** those versions sent only
  `Authorization: Bearer`, but the production backend hasn't rolled out Bearer support
  yet and still expects the legacy `Api-Key` header — so 2.0.0 and 2.0.1 401'd against
  prod entirely. 2.0.2 sends both `Api-Key` and `Authorization: Bearer` on every request,
  restoring prod compatibility while staying forward-compatible with backends that have
  migrated. Drop the legacy header once prod fully retires it fleet-wide.

## [2.0.1] - 2026-07-07

### Changed
- **Breaking:** the env var is renamed `GENUDO_API_KEY` → `GENUDO_TOKEN`, since the
  credential is now a Bearer token, not an API key. Update your MCP client config
  (`claude mcp add --env GENUDO_TOKEN=...`, `.env`, `.mcpb`/plugin `user_config`) —
  the old `GENUDO_API_KEY` var is no longer read.

## [2.0.0] - 2026-07-07

### Changed
- **Breaking:** authentication now sends `Authorization: Bearer <token>` instead of
  the `Api-Key` header, matching the Genudo backend's new token-based auth (scoped,
  revocable tokens with the `mcp:access` scope, created via the Authentication guide).
  `GENUDO_API_KEY` still holds the credential — the env var name is unchanged, only
  its value (now a bearer token, not the old-style API key) and how it's sent.
- Older connector versions (< 2.0.0) send the retired `Api-Key` header and will get
  `401 Unauthorized` against the current backend — upgrade required.

## [1.1.1] - 2026-07-05

### Changed
- Repositioned the package/server descriptions: Genudo as the platform to build AI
  agents for any communication or sequence-based channel — pipeline-aware agents with
  integration capabilities and company-knowledge access, managed from one platform,
  one inbox, and one analytics dashboard. No functional change to the bridge.

## [1.1.0] - 2026-07-04

### Added
- **Guided instruction editing (client-side, zero backend changes).** The connector
  now teaches the agent *how* to write good pipeline/stage instructions, not just
  which tools exist:
  - Two local tools, answered by the bridge itself (not proxied): `get_instruction_guides`
    (authoring principles, persona/global + stage templates, token-aware QA checklist)
    and `get_editing_playbook` (the safe load → edit → diff → confirm → push workflow).
  - Three MCP Prompts (portable slash-commands): `edit_instructions`, `build_pipeline`,
    `audit_pipeline`. Advertised via the new `prompts` capability.
  - The `initialize` `instructions` preamble now points the agent at the guides before
    any instruction write, and requires a before/after diff + explicit user confirmation
    before `update_pipeline` / `update_stage`.
- The guides read current instruction text from the existing tools — `list_pipelines`
  (pipeline `persona` + `instructions`) and `list_pipeline_stages` (stage `instructions`,
  `enter_condition`, `ai_persona`) — so no `get_instructions` backend tool is needed.

### Changed
- `tools/list` is now merged: the 21 proxied backend tools plus the 2 local guide tools.
  If the backend is briefly unreachable, the local guide tools are still served.

## [1.0.2] - 2026-07-04

### Added
- Server `instructions` in the `initialize` handshake: concise, high-signal
  guidance (workflow patterns + failure-preventing rules for pipelines, stages,
  actions, and variables) that any MCP client (Claude, Codex, Cursor) injects
  into the model's context for fast time-to-value — no user prompt engineering.

## [1.0.1] - 2026-07-04

### Changed
- Answer the MCP `initialize` handshake locally so the client connects instantly,
  independent of backend cold-start latency.
- Forward requests with a per-attempt timeout and automatic retry
  (`GENUDO_REQUEST_TIMEOUT`, `GENUDO_REQUEST_RETRIES`), so an occasional slow/hung
  backend response is retried instead of failing the whole request. A background
  warm-up request is sent after connect to prime the first real call.

## [1.0.0] - 2026-07-04

### Added
- Initial public release: a stdio↔SSE bridge connecting Claude Code and other
  MCP clients to the Genudo MCP server.
- One-command install via `npx -y genudo-mcp-client`.
- MCP Registry manifest (`server.json`) for discovery via the official registry.
- Configuration examples for Claude Code, Codex, Cursor, and Windsurf.

### Security
- SSE connection now honors `GENUDO_ALLOW_INSECURE_SSL` and verifies TLS
  certificates by default (previously certificate verification was always off
  for the SSE leg).

[1.0.2]: https://github.com/genudo-ai/genudo_mcp/releases/tag/v1.0.2
[1.0.1]: https://github.com/genudo-ai/genudo_mcp/releases/tag/v1.0.1
[1.0.0]: https://github.com/genudo-ai/genudo_mcp/releases/tag/v1.0.0
