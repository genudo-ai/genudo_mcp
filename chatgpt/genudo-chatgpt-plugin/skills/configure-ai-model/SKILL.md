---
name: configure-ai-model
description: Configure the AI model for a Genudo pipeline — either a single model or a routed model pool with router, simple, moderate, and complex tiers, each with its own provider, model, and instructions. Use when the user wants to change the AI model, set up or tune model routing, or optimize cost versus quality across message complexity.
---

# Configure AI Model

Set how a pipeline picks its AI model — one fixed model, or a routed pool that sends easy
messages to a cheap model and hard ones to a strong model.

## Discover valid options first

`get_pipeline_options` returns the selectable AI models (and providers, languages, dialects,
channels). Use only IDs it returns.

## Single model

Set `ai_model_id` (and optionally `model_temperature`) via `update_pipeline` (or `create_pipeline`
at build time). Leave `is_model_routing_enabled` off.

## Model pool (routing)

Set `is_model_routing_enabled = true` and provide `model_pool` with **exactly four tiers**:

| Tier | Handles |
|---|---|
| `router` | classifies each message's complexity |
| `simple` | trivial / FAQ turns |
| `moderate` | normal sales/support turns |
| `complex` | reasoning-heavy or high-stakes turns |

Each tier takes a provider, a model, and short instructions. Routing without all four tiers
is rejected.

## Confirm

Echo the chosen model(s) and cost/quality intent, then `update_pipeline`. Report what changed.
