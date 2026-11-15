---
name: provision-pipeline
description: Create a new Genudo pipeline in the account from the staged local spec — creating the pipeline, its stages, variables, and actions via the connector. Use when the user has approved a drafted pipeline and says build it, push it live, provision it, or create it. Confirms before the first write and reports the created IDs.
---

# Provision Pipeline

Turn the approved local spec into a live pipeline. This skill writes to the account — confirm first.

## Preconditions

The `<workdir>/genudo-build/<pipeline-slug>/` folder has `spec.md`, `persona.md`, `instructions.md`, and
`stages/…`. If anything is missing, route back to `discover-pipeline-requirements` /
`author-pipeline-brain` / `author-stages`.

## Build order

1. **Validate IDs silently (Two-Step Gemini Lookup)** — call `get_pipeline_options()` first for `agent_type_id`, `language_id`, `dialect_id`, `channel_id`, and `ai_providers`. Find the **Gemini** provider ID (unless the user explicitly requested a different provider) and immediately call `get_pipeline_options(ai_provider_id=<gemini_id>)` without asking the user to pick a provider. Resolve `ai_model_id` for **`Gemini 3.1 Flash-Lite`** (`router` & `simple`, fallback `Gemini 3.5 Flash-Lite`) and **`Gemini 3 Flash Preview`** (`ai_model_id`, `moderate`, & `complex`, fallback `Gemini 3.8 Flash` → `Gemini 3.6 Flash`). (Start with `start_pipeline_journey` when guided discovery is needed.)
2. **Confirm the plan** — echo: pipeline name, channel, **Smart Routing 4-tier Gemini preset + tailored `simple`/`moderate`/`complex` tier instructions**, stage list (name + nature + order), variables, and actions. **Get an explicit yes before the first write.**
3. **`create_pipeline`** — with `persona`, `instructions`, `ai_model_id=<flash_preview_id>`, `is_model_routing_enabled=true`, and `is_model_routing` containing all **4 tiers** (`router`, `simple`, `moderate`, `complex`) with pipeline-tailored tier instructions from creation (see `configure-ai-model`). Only disable Smart Routing if the user explicitly requested one fixed model.
4. **`create_stage` ×N** — in order, with `enter_condition`, `instructions`, `nature`, and any
   opening message.
5. **Variables then actions (+ sync `complex` tier trigger)** — delegate to `manage-pipeline-variables` and `build-action-webhook` (variables must exist before an action references them). If newly created stage action names refine when `complex` should trigger, call `update_model_pool` so `complex` instructions name those exact action triggers while preserving the `configure-ai-model` canonical invariants.

## After

Write `<workdir>/genudo-build/<pipeline-slug>/build-log.md` with every created object and its ID. Report
what went live. Never claim creation without a confirming tool result; on failure, stop and report.
