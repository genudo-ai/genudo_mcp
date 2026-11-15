---
name: genudo-connectors
description: Connect and orchestrate external SaaS apps (Gmail, Google Sheets, Calendar, Slack, HubSpot, Notion, GitHub, Shopify, etc.) via GenuDo Connector and custom Streamable HTTP MCP servers with OAuth login cards and deferred schema loading.
---

# External MCP & GenuDo Connectors

Connect third-party apps and external MCP servers across every session cleanly, securely,
and with minimal token overhead.

## Architecture & Key Rules

- All external connector tools (`GENUDO_CONNECTOR_*` meta-tools and custom `mcp_<slug>_*` tools)
  are **defer-loaded** so unused SaaS schemas never bloat the prompt cache.
- Load this capability (`genudo-connectors` / `skill_external_connectors`) whenever the user
  asks to read/send emails, sync spreadsheets/calendars/Slack/CRM tickets, or use any
  connected third-party MCP server.
- Read/search/connection-check calls execute directly; mutating external actions (sending emails,
  creating/updating SaaS records, removing connections, or running remote sandbox scripts) pause
  at the workspace-owner approval gate when `require_write_approval` is enabled.

## GenuDo Connector Meta-Tool Workflow (Low-Cost Pattern)

1. **Discover relevant actions (`GENUDO_CONNECTOR_SEARCH_TOOLS`)**:
   - Pass `queries=[{"use_case": "<normalized English intent>", "known_fields": "..."}]`
     and `session={"generate_id": true}` for new workflows (or `session={"id": "<session_id>"}`
     to continue).
   - Check which toolkit slugs and `tool_slug`s are returned AND check connection status before
     attempting execution.

2. **Connect / Authorize if Needed (`GENUDO_CONNECTOR_MANAGE_CONNECTIONS`)**:
   - Pass `toolkits=[{"name": "<slug>", "action": "add"}]` to initiate OAuth or
     `toolkits=[{"name": "<slug>", "action": "list"}]` to check active accounts (plus
     `session_id` when present).
   - Whenever `redirect_url` is returned, the engine automatically emits a `ConnectionCard` UI
     card with a **Connect & Authorize** button — instruct the user to click **Connect &
     Authorize** on the card above (or format `[Connect <App>](<redirect_url>)` without displaying
     raw middleware URLs) and click **I've Connected — Continue** once done. Never mention
     third-party connector middleware names.
   - Optionally call `GENUDO_CONNECTOR_WAIT_FOR_CONNECTIONS(toolkits=["<slug>"], session_id=...)`
     after the user confirms authentication.

3. **Fetch Minimal Argument Schemas (`GENUDO_CONNECTOR_GET_TOOL_SCHEMAS`)**:
   - Pass `tool_slugs=["<SLUG>"]` (and `session_id`) for tools returned with `schemaRef` to fetch
     exact input parameters only for the specific actions you plan to run.

4. **Execute (`GENUDO_CONNECTOR_MULTI_EXECUTE_TOOL`)**:
   - Pass `tools=[{"tool_slug": "<SLUG>", "arguments": {...}}]`,
     `sync_response_to_workbench=false` (unless a large response is expected), and `session_id`.
   - Mutating external actions automatically pause at the workspace-owner approval gate when
     `require_write_approval` is enabled.
   - Never fabricate external IDs, email recipients, or spreadsheet IDs; inspect/list first.

## Custom Remote MCP Servers (`mcp_<slug>_*`)

- Custom remote Streamable HTTP MCP servers added in Connectors Hub are prefixed
  `mcp_<slug>_<tool>`.
- Check active custom connectors via `search_tools` (e.g. searching `"mcp_"` or the domain
  keyword), prefer read tools (`get_`, `list_`, `search_`, `read_`) before write tools, and never
  expose raw credentials or HTTP headers in responses.

