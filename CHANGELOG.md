# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
