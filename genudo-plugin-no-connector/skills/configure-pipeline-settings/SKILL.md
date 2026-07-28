---
name: configure-pipeline-settings
description: Configure a Genudo pipeline's operational settings — name, description, max cost per conversation, max messages per conversation, follow-up limit, knowledge-base chunk count, memory window, context size, temperature, and RAG mode. Use when the user wants to cap spend, limit messages, rename a pipeline, change how much history the agent remembers, or tune retrieval behaviour.
---

# Configure Pipeline Settings

Tune a pipeline's guardrails and runtime behaviour. All of these are fields on the pipeline,
updated with `update_pipeline`.

## Settings

| Setting | Field | What it controls |
|---|---|---|
| Name / description | `name`, `description` | Labels |
| Max cost per conversation | `max_conversation_cost` | Hard spend cap per chat |
| Max messages per conversation | `max_conversation_messages` | Turn cap per chat |
| Follow-up limit | `followup_limit` | How many follow-ups may fire |
| KB chunks retrieved | `no_of_relevant_points` | Knowledge passages per answer |
| Memory window | `agent_memory_window` | How much history the agent holds |
| Context messages | `context_message_count` | Recent turns fed to the model |
| Temperature | `model_temperature` | Creativity vs consistency |
| RAG mode | `rag_mode` | Retrieval behaviour |

## Workflow

1. `list_pipelines` to load current values (so you show before → after).
2. Confirm the specific changes with the user.
3. `update_pipeline` with only the changed fields.

Note: `agent_type` is fixed after creation and cannot be changed here.
