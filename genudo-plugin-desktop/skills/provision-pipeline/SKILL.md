---
name: provision-pipeline
description: Create a new Genudo pipeline in the account from the staged local spec — creating the pipeline, its stages, variables, and actions via the connector. Use when the user has approved a drafted pipeline and says build it, push it live, provision it, or create it. Confirms before the first write and reports the created IDs.
---

# Provision Pipeline

Turn the approved local spec into a live pipeline. This skill writes to the account — confirm first.

## Preconditions

The `./genudo-build/<pipeline-slug>/` folder has `spec.md`, `persona.md`, `instructions.md`, and
`stages/…`. If anything is missing, route back to `discover-pipeline-requirements` /
`author-pipeline-brain` / `author-stages`.

## Build order

1. **Validate IDs** — `get_pipeline_options` for `agent_type_id`, `ai_model_id`, `language_id`,
   `dialect_id`, `channel_id`. (Start with `start_pipeline_journey` for the guided path.)
2. **Confirm the plan** — echo: pipeline name, channel, model, stage list (name + nature + order),
   variables, and actions. **Get an explicit yes before the first write.**
3. **`create_pipeline`** — with `persona` and `instructions` from the local files. If model
   routing is wanted, set `is_model_routing_enabled` + a 4-tier `model_pool` (see `configure-ai-model`).
4. **`create_stage` ×N** — in order, with `enter_condition`, `instructions`, `nature`, and any
   opening message.
5. **Variables then actions** — delegate to `manage-pipeline-variables` and `build-action-webhook`
   (variables must exist before an action references them).

## After

Write `./genudo-build/<pipeline-slug>/build-log.md` with every created object and its ID. Report
what went live. Never claim creation without a confirming tool result; on failure, stop and report.
