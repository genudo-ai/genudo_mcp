---
name: analyze-funnel
description: Analyze a Genudo pipeline's funnel — opportunity counts and distribution across stages, statuses, priorities, and tags — to surface drop-off points and what is converting. Use when the user asks how the funnel is doing, how many leads are in each stage, which tags or segments perform, where leads are stalling, or for a pipeline health check. Read-only.
---

# Analyze Funnel

Show where leads are and where they stall. Read-only — no writes.

## Pull the data

- `list_pipelines` — pick the pipeline; note `stages_count`.
- `list_pipeline_stages` — the stage order and names (to label the funnel).
- `list_opportunities` — filter by `pipeline_id`, and slice by `stage_id`, `status`,
  `priority`, `tag_ids`, and date range. Page with `page`/`per_page` for large sets.
- `list_contacts` — audience view, tags, priorities.
- `get_account_summary` — top-line totals to reconcile against.

## Report

- Count per stage, in stage order → the funnel shape and the biggest drop-off.
- Status split (active / won / lost) and win rate.
- Tag and priority performance.
- Anomalies (a tool count that disagrees with another surface) flagged, not trusted blindly.

Deliver a concise funnel summary + the top 2–3 places to intervene. If the user wants to act
on the opportunities, hand off to `manage-opportunities`.
