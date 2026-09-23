# GenuDo Agent Guidelines

## Core Principles

- **Authentication**: Ensure the `GENUDO_TOKEN` environment variable is set and valid before invoking GenuDo MCP tools.
- **Safety First**: Do not mutate or delete knowledge tables or active pipeline stages without explicit user confirmation.
- **Read-Before-Write**: Always discover existing resources first:
  - Call `list_pipelines` before creating new pipelines.
  - Call `list_pipeline_stages` before modifying or creating stages.
  - Call `list_knowledge_tables` before defining or modifying tables.
  - Call `get_stage_followup` before designing or updating stage follow-ups.
- **Data Validation**: When upserting knowledge points (`upsert_knowledge_points`), validate text payloads, ensure a stable `default_id` is provided, and supply complete values matching table column schemas.
- **Safe State Changes**: When updating live pipelines or stages (`update_pipeline`, `update_stage`), present a before-and-after comparison of instructions and stage settings before pushing changes.
- **Error Diagnostics**: On 401 or token errors, instruct the user to verify that their GenuDo token has the `mcp:use` scope enabled under **Developer > API Keys & Tokens** in the GenuDo dashboard.
