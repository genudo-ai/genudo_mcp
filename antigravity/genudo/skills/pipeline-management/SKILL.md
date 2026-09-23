---
name: genudo-pipeline-management
description: Inspect, create, edit, and troubleshoot GenuDo automation pipelines, stages, and agent action tool bindings. Trigger whenever the user asks about GenuDo pipelines, journeys, or stage workflows.
---

# GenuDo Pipeline Management

## Overview
Guidelines and multi-step runbook for creating, modifying, and troubleshooting conversational automation pipelines, stages, and action bindings via GenuDo MCP tools.

## Key Tools

| Purpose | MCP Tool |
|---|---|
| Fetch available pipelines | `list_pipelines` |
| Inspect stages of a pipeline | `list_pipeline_stages` |
| Read valid build choices (models, channels) | `get_pipeline_options` |
| Scaffold a new pipeline | `create_pipeline` |
| Add a stage to a pipeline | `create_stage` |
| Attach actions/webhooks to a stage | `create_action` |
| Manage custom variables | `create_variable`, `list_variables`, `update_variable` |
| Update live pipeline / stages | `update_pipeline`, `update_stage`, `update_action` |
| Enroll contact into a pipeline | `start_pipeline_journey` |

---

## Step-by-Step Workflow

### 1. Discovery First
Always check what already exists before creating new objects:
1. Call `list_pipelines` to check existing pipelines and their IDs.
2. Call `list_pipeline_stages` with `pipeline_id` to inspect current stages, order, instructions, and `enter_condition` rules.
3. Call `get_pipeline_options` to retrieve allowed models, channel types (WhatsApp, Messenger, Instagram, Web), and system capabilities.

### 2. Pipeline Scaffolding
When creating a pipeline (`create_pipeline`):
- Provide a clear `name` indicating business role (e.g., "Inbound Sales Qualifying - WhatsApp").
- Define global `instructions` (business hours, company persona, tone, escalation triggers).
- Configure the default AI model and connected communication channel.

### 3. Stage Architecture
When creating stages (`create_stage`):
- **Logical Flow**: Order stages chronologically (e.g., `Greeting / Discovery` → `Qualification` → `Booking / Handoff` → `Closed Won / Lost`).
- **Enter Conditions**: Define unambiguous enter conditions so the AI transitions at the right conversation milestone.
- **Stage Instructions**: Focus on the specific objective of that stage (e.g., "Collect user budget and project timeline").
- **Opening Messages**: Specify whether the stage should send an opening message or wait for customer input.

### 4. Action & Webhook Bindings
To trigger external workflows (`create_action`):
- Specify `stage_id` and the trigger event (e.g., stage entry, stage completion, or explicit tool call).
- Define HTTP method, endpoint URL, headers, and request payload template.
- Attach required variables (e.g., `{{contact.phone}}`, `{{variables.budget}}`).

### 5. Safe Live Updates
When editing an existing pipeline or stage:
1. Read the live state via `list_pipelines` / `list_pipeline_stages`.
2. Generate a clear markdown before/after diff for the user.
3. Confirm with the user before calling `update_pipeline` or `update_stage`.
4. Verify by listing the stages again.

---

## Best Practices & Guardrails

- **Never Blind-Overwrite**: Do not call `update_pipeline` or `update_stage` without checking existing instructions first.
- **Tone & Persona**: Keep persona definitions in global pipeline instructions; keep stage instructions strictly focused on stage goals.
- **Variable Alignment**: Confirm custom variables exist (`list_variables`) before referencing them in stage instructions or action webhooks.
