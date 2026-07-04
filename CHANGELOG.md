# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

[1.0.1]: https://github.com/genudo-ai/genudo_mcp/releases/tag/v1.0.1
[1.0.0]: https://github.com/genudo-ai/genudo_mcp/releases/tag/v1.0.0
