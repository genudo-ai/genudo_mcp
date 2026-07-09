# GenuDo MCP Capability Guide

Last verified live: 2026-07-09 (staging, 29-tool backend)

This document describes what the GenuDo MCP currently exposes and how to use it safely and effectively. It is based on a live audit of the MCP connected to this account, not just a static code read.

## What This MCP Is

The GenuDo MCP is an account-scoped control and inspection layer for:

- AI pipelines
- pipeline stages
- action webhooks
- pipeline variables
- messages
- contacts
- opportunities
- knowledge tables (structured knowledge base)
- per-stage follow-up sequences
- account analytics

It supports both read and write operations. It is strong for pipeline administration and operational analysis, but it does not expose every internal object directly.

## Live-Verified Scope

The MCP exposed `29` tools during the live check.

The connected account summary returned:

```json
{
  "total_pipelines": 6,
  "total_opportunities": 11547,
  "active_opportunities": 6115,
  "pending_opportunities": 0,
  "won_opportunities": 1783,
  "lost_opportunities": 3649,
  "total_messages": 89908,
  "total_messages_cost": 2309.4946,
  "cost_per_deal": 1.2952858104318563
}
```

## Tool Catalog

### 1. Account and Analytics

#### `get_account_summary`

Returns a quick account snapshot:

- total pipelines
- total opportunities
- active, pending, won, lost opportunity counts
- total messages
- total message cost
- cost per deal

Use it for:

- top-level workspace health checks
- quick reporting
- proving that the MCP is connected to the expected account

Does not return:

- subscription tier
- pipeline creation limits
- billing plan name
- remaining pipeline slots

#### `get_messaging_stats`

Returns messaging volume stats with optional filters:

- `start_date`
- `end_date`
- `pipeline_id`
- `provider`

Supported providers in the schema:

- `whatsapp`
- `messenger`
- `instagram`
- `linkedin`

Use it for:

- provider-level message analysis
- time-window reporting
- per-pipeline messaging reviews

Note:

- In one live check, this tool returned a pipeline-not-found-style error for pipeline `17` while other pipeline tools worked for the same pipeline. Treat this tool as useful but verify odd results against other surfaces.

#### `get_ai_performance`

Returns AI-level performance metrics, including:

- total AI messages
- average response time
- total cost

Use it for:

- AI usage monitoring
- response-time reporting
- workspace-wide AI cost checks

Current behavior observed:

- workspace-wide
- not obviously pipeline-scoped

### 2. Pipeline Setup and Creation

#### `get_pipeline_options`

Returns the selectable option sets needed for pipeline creation:

- agent types
- AI models
- languages
- dialects
- connected channels

Use it before:

- creating pipelines
- choosing a channel
- enabling model routing

This is the main discovery tool for valid IDs.

#### `start_pipeline_journey`

Guided pipeline-builder entrypoint. This is the intended first call when creating a pipeline from scratch.

It is designed to guide a user through:

- pipeline settings
- stage design
- won/lost stages
- action setup

Use it for:

- onboarding flows
- assistant-led pipeline setup
- full greenfield pipeline creation

#### `create_pipeline`

Creates a new pipeline.

Required:

- `agent_type_id`
- `name`
- `ai_model_id`
- `language_id`

Key optional controls:

- `rag_mode`
- `description`
- `persona`
- `instructions`
- `channel_id`
- `model_temperature`
- `dialect_id`
- `no_of_relevant_points`
- `agent_memory_window`
- `max_conversation_cost`
- `max_conversation_messages`
- `context_message_count`
- `is_model_routing_enabled`
- `model_pool`

Important behavior:

- if `is_model_routing_enabled` is `true`, `model_pool` is required
- `model_pool` must contain exactly `4` entries
- the four required tiers are:
  - `router`
  - `simple`
  - `moderate`
  - `complex`

Practical meaning:

- you can create a very simple pipeline quickly
- you can also create an advanced routed pipeline with explicit tiered models
- persona and instructions are first-class configuration, not an afterthought

### 3. Stage Management

#### `create_stage`

Creates a new stage inside a pipeline.

Required:

- `pipeline_id`
- `name`
- `nature`
- `order`

Important optional controls:

- `description`
- `ai_persona`
- `instructions`
- `notes`
- `enter_condition`
- `parent_id`
- `is_opening_message`
- `opening_message_type`
- `static_opening_message`

Supported stage natures:

- `neutral`
- `won`
- `lost`

This means the MCP can model:

- normal in-progress funnel stages
- terminal success stages
- terminal failure stages

It also supports:

- stage-specific AI behavior
- stage-specific entry logic
- automatic opening messages
- hierarchical stages via `parent_id`

#### `list_pipeline_stages`

Lists stages for a pipeline in stage order.

Required:

- `pipeline_id`

Use it for:

- discovery
- auditing stage flow
- finding `stage_id` before updates

#### `update_stage`

Updates an existing stage.

Required:

- `stage_id`

Supports updating:

- metadata
- order
- nature
- stage instructions
- entry conditions
- opening message settings
- folded state

### 4. Action and Automation Management

#### `create_action`

Creates an outbound HTTP action for a pipeline or a specific stage.

Required:

- `pipeline_id`
- `name`
- `method`
- `url`
- `is_active`
- `fixed_trigger`

Optional:

- `stage_id`
- `description`
- `headers`
- `payload`
- `instructions`
- `max_fires`
- `retries`
- `order`
- `response_example`

Key action model:

- stage-specific action when `stage_id` is passed
- pipeline-level global action when `stage_id` is omitted

Supported trigger values at creation:

- `stage_started`
- `on_any_message`
- `on_user_message`
- `custom`

This is a webhook automation surface, so it already supports:

- CRM sync
- external API calls
- booking integrations
- notification flows
- custom automation triggers

#### `update_action`

Updates an existing action.

Required:

- `action_id`

Important limitation:

- on update, `fixed_trigger` can only be changed to `on_user_message` or `custom`
- system triggers such as `stage_started` and `on_any_message` are effectively creation-time choices

### 5. Variable Management

#### `create_variable`

Creates a pipeline variable for action usage.

Required:

- `pipeline_id`
- `name`
- `value`
- `type`
- `is_required`

Optional:

- `description`
- `data_type`

Supported variable types:

- `fixed`
- `from_system`
- `from_action`
- `from_ai`

Supported data types:

- `string`
- `integer`
- `boolean`
- `float`

This is one of the most important design choices in the MCP:

- actions do not support raw system placeholders directly
- runtime values must be routed through named pipeline variables

That means this is correct:

```json
{
  "name": "customer_email",
  "value": "opportunity.contact_email",
  "type": "from_system"
}
```

Then the action uses:

```json
{
  "payload": {
    "email": "{{customer_email}}"
  }
}
```

This is explicitly not supported as a direct action payload placeholder:

```json
{
  "payload": {
    "email": "{{opportunity.contact_email}}"
  }
}
```

#### `list_variables`

Lists pipeline variables.

Required:

- `pipeline_id`

Optional:

- `q`

Use it before:

- `create_action`
- `update_action`

#### `update_variable`

Updates an existing variable.

Required:

- `variable_id`

Important limitation:

- if an action already references the variable, renaming it may be ignored

> `delete_variable` was removed from the backend — there is no variable-delete tool anymore.
> To retire a variable, remove its references and deactivate the actions that used it.

### 6. Pipeline Updates

#### `update_pipeline`

Updates an existing pipeline.

Required:

- `pipeline_id`

Supports updating:

- name
- description
- persona
- instructions
- status
- archived state
- RAG settings
- AI model
- language
- dialect
- temperature
- memory window
- context count
- cost/message limits
- model routing enablement

Important limitation:

- `agent_type` cannot be changed after pipeline creation

### 7. Contacts, Opportunities, and Message Discovery

#### `list_pipelines`

Lists the authenticated user's pipelines.

Returned shape includes:

- id
- name
- description
- status
- archived flag
- stages count

Use it for:

- account verification
- pipeline inventory
- lookup before reads or writes

#### `list_messages`

Lists messages across pipelines, with cursor pagination.

Filters:

- `pipeline_id`
- `contact_id`
- `role`
- `start_date`
- `end_date`
- `cursor`
- `limit`

Use it for:

- chat auditing
- contact-level message lookup
- time-window sampling
- message export workflows

Important behavior:

- designed for chunked traversal
- large histories should be paged using `next_cursor`

#### `list_contacts`

Lists contacts derived from opportunities.

Filters:

- `pipeline_id`
- `status`
- `priority`
- `q`
- `tag_ids`
- `start_date`
- `end_date`
- `page`
- `per_page`

Returned shape conceptually includes:

- canonical contact data
- user contact overrides
- opportunities count

Use it for:

- contact discovery
- pipeline audience inspection
- priority and tag-based analysis

#### `list_opportunities`

Lists opportunities with contact, stage, and tags context.

Filters:

- `pipeline_id`
- `stage_id`
- `status`
- `priority`
- `q`
- `tag_ids`
- `start_date`
- `end_date`
- `page`
- `per_page`

Use it for:

- funnel inspection
- stage distribution analysis
- active pipeline review
- pipeline workload analysis

#### `update_opportunities`

Updates one or more opportunities.

Required:

- `opportunity_ids`

Supported updates:

- `status`
- `stage_id`
- `name`
- `notes`
- `tags`
- `deleted_tags`

Important behavior:

- bulk updates are supported
- stage moves are only allowed inside the same pipeline
- tags can be auto-created by name

### 8. Knowledge Base (Structured Knowledge Tables)

The pipeline agent retrieves from these tables at runtime to answer grounded questions.

#### `list_knowledge_tables`

Lists knowledge tables with column counts and attached pipelines. No required params. Call
before any other KB tool to confirm `knowledge_table_id` and column names.

#### `create_knowledge_table`

Required: `name` (unique), `columns` (at least one — the schema).
Optional: `description` — write it as a when-to-use so the agent picks the right table.

#### `upsert_knowledge_points`

Required: `knowledge_table_id`, `points` (rows).

Rules:

- every row must include `default_id` — a stable identifier you choose; matching `default_id`
  updates the row, a new one inserts
- every row must carry a value for every column defined on the table

#### `search_knowledge_table`

Required: `knowledge_table_id`, `query` (natural language).
Optional: `limit` (default 5, max 20), `use_hybrid` (default true — vector + keyword; false for
pure vector).

Use it to verify what the agent would retrieve after fixing a row.

#### `delete_knowledge_points`

Required: `knowledge_table_id`, `ids` (array of `default_id` values).

There is no table-delete tool — only rows can be removed. No undo.

### 9. Per-Stage Follow-ups

Timed re-engagement messages for opportunities that go quiet in a stage.

#### `get_stage_followup`

Required: `stage_id`. Returns the followup config including its interval schedule and the
`followup_id` needed by `update_followup`. Call it FIRST — each stage holds at most ONE followup.

#### `create_followup`

Required: `stage_id`, `is_active`, `intervals` (the timed schedule).
Optional: `instructions` (how the AI drafts each message), `after_followup_stage_id` (stage to
move to when all intervals are exhausted without a reply — typically a lost stage), `assets`
(media/links to attach).

#### `update_followup`

Required: `followup_id` (from `get_stage_followup`). Only provided fields change.

Critical rule:

- `intervals` REPLACES the entire schedule — always send the full list, never a delta
- pass `after_followup_stage_id: null` to remove the transition

### 10. Action Discovery

#### `list_actions`

Required: `pipeline_id`. Optional: `stage_id` (filter to one stage; omit for all actions
including pipeline-level ones). Returns id, name, trigger, method, url, is_active, order,
stage_id, max_fires, retries per action.

## What This MCP Can Already Do Well

### Full Pipeline Administration

It already supports the main lifecycle:

1. discover valid creation options
2. create a pipeline
3. create stages
4. create variables
5. create actions
6. inspect messages, contacts, and opportunities
7. update pipeline and stage behavior later

### Advanced AI Pipeline Configuration

It supports more than a basic chatbot setup. The live schema shows support for:

- persona
- global instructions
- stage-specific AI instructions
- stage-specific persona overrides
- stage entry conditions
- conversation cost controls
- memory window controls
- context window controls
- RAG mode
- multi-language selection
- dialect selection
- model routing with tiered model pools

### Automation and Integrations

The action + variable system is strong enough for:

- CRM sync
- webhook-based workflows
- lead enrichment
- booking requests
- external notifications
- post-stage side effects
- AI-assisted extraction into variables

### Operational Reporting

It already supports useful operations reporting for:

- total account volume
- AI cost and response metrics
- pipeline inventory
- message history
- contact inventory
- opportunity inventory
- funnel-stage distribution

## What This MCP Does Not Clearly Expose

Based on the live tool inventory, the MCP does not currently expose dedicated tools for:

- deleting actions directly
- deleting stages directly
- deleting pipelines directly
- deleting variables directly (`delete_variable` was removed)
- deleting whole knowledge tables (only rows, via `delete_knowledge_points`)
- sending a manual message directly
- reading subscription tier or plan limits directly
- reading remaining pipeline capacity directly

This is important for documentation because some capabilities are inferred from related objects, while others are truly absent from the exposed surface.

## Important Behavioral Rules and Constraints

### 1. Use `start_pipeline_journey` First for Greenfield Setup

The MCP's own guidance says this should be the first call when building a pipeline from scratch.

Recommended flow:

1. `start_pipeline_journey`
2. `get_pipeline_options`
3. `create_pipeline`
4. `create_stage`
5. `create_variable`
6. `create_action`

### 2. Variables Are Mandatory for Runtime Action Data

Do not inject dotted system placeholders directly into action payloads, URLs, or headers.

Wrong:

```json
{
  "payload": {
    "phone": "{{opportunity.contact_phone}}"
  }
}
```

Correct:

1. create variable from system field
2. reference the variable by its safe name

### 3. Some IDs Must Be Discovered First

Usually fetch IDs from:

- `list_pipelines`
- `list_pipeline_stages`
- `list_actions`
- `list_variables`
- `list_knowledge_tables`
- `get_stage_followup`
- `get_pipeline_options`

### 4. Actions Are Fully Discoverable

`list_actions` (pipeline_id required, stage_id optional) returns every action including
pipeline-level ones — audit before creating to avoid duplicates, and to find `action_id`
for `update_action`.

### 5. Analytics Need Sanity Checks

For high-confidence reporting:

- use account summary for top-line counts
- use `list_opportunities` and `list_contacts` for scoped reconciliation
- treat isolated tool anomalies as possible MCP inconsistencies

## Suggested Standard Usage Patterns

### Pattern A: Audit an Existing Pipeline

1. `list_pipelines`
2. `list_pipeline_stages`
3. `list_variables`
4. `list_opportunities`
5. `list_contacts`
6. `list_messages`

Use this when you need:

- structural discovery
- funnel understanding
- evidence of live activity

### Pattern B: Create a New Pipeline From Scratch

1. `start_pipeline_journey`
2. `get_pipeline_options`
3. choose agent type, model, language, channel
4. write or generate persona and instructions
5. `create_pipeline`
6. `create_stage` for all funnel stages
7. `create_variable` for runtime fields
8. `create_action` for automations

### Pattern C: Add an Integration to an Existing Pipeline

1. `list_pipelines`
2. `list_pipeline_stages`
3. `list_variables`
4. `create_variable` for missing runtime fields
5. `create_action`
6. `update_action` if tuning is needed later

### Pattern D: Review Live Commercial Activity

1. `get_account_summary`
2. `get_ai_performance`
3. `list_opportunities`
4. `list_contacts`
5. `list_messages`
6. `get_messaging_stats`

## Recommended README Positioning

If this document is adapted for a public README or NPM page, position the MCP as:

- a GenuDo workspace operations and pipeline-admin MCP
- capable of full pipeline creation and maintenance
- capable of webhook automation through actions and variables
- capable of business reporting across pipelines, contacts, opportunities, and messages
- opinionated about safe pipeline creation and variable-driven integrations

## Short Capability Summary

The GenuDo MCP already offers end-to-end pipeline setup, stage design, AI behavior configuration, variable-driven webhook actions, workspace analytics, and operational discovery across messages, contacts, and opportunities. Its strongest surfaces are pipeline administration and automation orchestration. It now also covers knowledge-table management (create/upsert/search/delete rows) and per-stage follow-up sequences. Its main current gaps are deletion surfaces for pipelines/stages/actions/variables and subscription-limit visibility.
