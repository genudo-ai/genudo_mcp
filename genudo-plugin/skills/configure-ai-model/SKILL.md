---
name: configure-ai-model
description: Configure the AI model and Smart Routing model pool for a Genudo pipeline — silently resolving the GenuDo Gemini Smart Routing best-practice preset (router, simple, moderate, complex) and designing tailored per-tier instructions, or applying an explicit single-model / custom-provider override. Use when creating a pipeline, inspecting existing models, enabling or tuning Smart Routing, fixing over-triggering/stalled replies, or changing temperature.
---

# Configure AI Model & Smart Routing Preset

Set how a pipeline picks its AI model. By default on GenuDo, **every pipeline uses Smart Routing** with the Gemini best-practice preset and pipeline-tailored tier instructions unless the user explicitly asks for a different provider or a single fixed model.

## 1. Silent Two-Step Model Discovery (Never Show a Provider Prompt by Default)

Calling `get_pipeline_options` without `ai_provider_id` returns `ai_providers` and an empty `ai_models` list (`[]`). **Do NOT stop to ask the user to choose an AI provider** unless they explicitly asked for a specific third-party provider or Gemini is unavailable:

1. Call `get_pipeline_options()` to inspect `ai_providers`, `agent_types`, `languages`, `dialects`, and `channels`.
2. Locate the **Gemini** provider in `ai_providers` (match `name`/`slug` case-insensitively against `"gemini"` or `"google"`).
3. Immediately call `get_pipeline_options(ai_provider_id=<gemini_provider_id>)` to retrieve active Gemini models and their integer `id` / `name` / `model_key`.
4. Always resolve integer `ai_model_id` values dynamically by name/`model_key` from `get_pipeline_options` — **never hardcode numeric model IDs** across workspaces.

When inspecting or explaining models on an existing pipeline:
- Always call `list_model_pool(pipeline_id)` alongside `get_pipeline_details(pipeline_id)` and resolve numeric `ai_model_id`s against `get_pipeline_options(ai_provider_id=...)` so you always report exact human-readable model names (never say *"model #X — unknown name"*).

## 2. GenuDo Smart Routing Best-Practice Preset

| Slot / Tier | Primary Target Model | Fallback Chain (if absent in `get_pipeline_options`) | Role |
|---|---|---|---|
| Pipeline `ai_model_id` | **Gemini 3 Flash Preview** | `Gemini 3.8 Flash` → `Gemini 3.6 Flash` → active Gemini 3.x Flash with Actions + Thinking | Default / fallback model on pipeline |
| `router` | **Gemini 3.1 Flash-Lite** | `Gemini 3.5 Flash-Lite` → fastest active Gemini Flash-Lite | Ultra-fast, low-cost per-message tier classifier |
| `simple` | **Gemini 3.1 Flash-Lite** | `Gemini 3.5 Flash-Lite` → fastest active Gemini Flash-Lite | Low-cost handler for pure greetings only |
| `moderate` | **Gemini 3 Flash Preview** | `Gemini 3.8 Flash` → `Gemini 3.6 Flash` → active Gemini 3.x Flash with Actions + Thinking | Balanced RAG/KB Q&A, qualification, objections |
| `complex` | **Gemini 3 Flash Preview** | `Gemini 3.8 Flash` → `Gemini 3.6 Flash` → active Gemini 3.x Flash with Actions + Thinking | Same model keeps prompt-cache continuity across turns while stepping up reasoning/action focus |

## 3. Per-Tier Instructions (Canonical Invariants + Pipeline Tailoring)

Design and populate all 4 tier entries from pipeline creation:

- **`router`**:
  - Default `instructions`: `""` (empty string). Only add 1–2 concise disambiguation bullets when the pipeline has special edge cases (such as custom web-search triggers).
- **`simple`**:
  - Canonical preset: `"Choose this for only Greetings messages (like hi, hello)."`
  - Bilingual/Arabic tailoring: For Arabic or bilingual pipelines, include standalone Arabic greetings (e.g., `"Choose this for only standalone Greetings messages (like hi, hello, أهلاً, السلام عليكم) with no question or request."`).
  - **Strict exclusion**: Never route FAQs, pricing, availability, KB lookups, or replies inside an active booking/order flow to `simple`.
- **`moderate`**:
  - Canonical preset (preserve verbatim, including `DEFAULT when uncertain.`):
    `"Needs knowledge lookup, standard Q&A, informational response, or any message where no action needs to execute right now. DEFAULT when uncertain."`
  - Pipeline tailoring: Append 1 concise domain clause naming this pipeline's non-action topics (e.g., `"Includes questions about <products/packages/prices/policies>, objections, and qualification replies before final confirmation."`).
- **`complex`**:
  - Canonical preset (preserve both sentences verbatim):
    `"This specific message requires executing an action NOW — the user is providing data or confirmation that directly triggers an available action. The mere existence of available actions does NOT make a message complex."`
  - Pipeline tailoring: Append 1 concise trigger clause naming this pipeline's concrete action triggers or closing commitments when actions/stages exist (e.g., `"Route here ONLY when the customer provides or confirms the required data to fire [<action_names>] or explicitly commits to booking/order/handoff."`).
  - Whenever actions are added or updated later (`create_action` / `wire-stage-automation`), refresh `complex` instructions via `update_model_pool`.

## 4. Exact MCP Calls (Do Not Mix Creation vs Update Schemas)

- **At Pipeline Creation (`create_pipeline`)**:
  Pass `ai_model_id=<flash_preview_id>`, `is_model_routing_enabled=true`, and `is_model_routing` with **exactly 4 entries** (`router`, `simple`, `moderate`, `complex`), each shaped `{ "tier": "...", "ai_model_id": <int>, "instructions": "..." }`.
- **On an Existing Pipeline (`update_model_pool`)**:
  Use `update_model_pool(pipeline_id=<id>, models=[...])` with the exact same 4-entry array (`router`, `simple`, `moderate`, `complex`).
  - `update_model_pool` creates or updates all 4 tiers **and enables Smart Routing automatically**.
  - **Never** pass `model_pool` to `update_pipeline` (unsupported), and **never** call `update_pipeline(is_model_routing_enabled=true)` before `update_model_pool` has configured all 4 tiers.

## 5. Single Fixed Model (Explicit User Override Only)

Only when the user explicitly requests a single fixed model or custom provider:
- Set `ai_model_id` (and optionally `model_temperature`) via `create_pipeline` or `update_pipeline(pipeline_id, ai_model_id=..., is_model_routing_enabled=false)`.
- Before writing changes on an existing pipeline, summarize the tier model assignments and tailored instructions clearly, then run `update_model_pool` / `update_pipeline` and report the updated configuration.
