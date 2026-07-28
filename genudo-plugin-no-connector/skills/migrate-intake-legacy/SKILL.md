---
name: migrate-intake-legacy
description: Capture a legacy Genudo pipeline — old persona, old global instructions, old per-stage instructions, and old stage structure — into a structured legacy spec, as the first step of migrating it to the current authoring approach. Use when the user pastes or points to old-format pipeline instructions, or names an existing pipeline in the account to migrate. Read-only; the spec feeds migrate-map-to-new.
---

# Migrate: Intake Legacy Pipeline

Capture everything the old pipeline knows before any rewriting. This step is read-only —
completeness beats tidiness; do not fix or re-style anything yet.

## Sources (combine as available)

- **Pasted text / files** — old persona, global instructions, stage docs in any format.
- **Live account** — when the pipeline exists on the platform: `list_pipelines` (persona +
  instructions + settings), `list_pipeline_stages` (per stage: name, nature, order,
  enter_condition, instructions, ai_persona), `list_actions`, `list_variables`, and
  `get_stage_followup` per stage.

## Capture (the legacy spec)

Write `./genudo-migrate/<pipeline-slug>/legacy-spec.md` with one section per item:

- **Identity** — pipeline name, channel, language, agent type, AI model if known.
- **Persona** — old persona text, verbatim.
- **Global instructions** — verbatim.
- **Stages** — per stage: name, nature, order, entry condition (or how entry was expressed in
  the old approach), in-stage instructions verbatim, data collected, opening message.
- **Automations** — actions with triggers, URLs, payload fields; variables with types.
- **Follow-ups** — per-stage schedules and drafting notes.
- **Embedded business facts** — pull out products, prices, policies, links, and named people
  found anywhere in the old text into their own list; these must survive migration verbatim.

## Gaps

Mark anything missing or illegible as `UNKNOWN — ask` rather than guessing. Finish by listing
the open questions, then hand off to `migrate-map-to-new`. No account writes here.
