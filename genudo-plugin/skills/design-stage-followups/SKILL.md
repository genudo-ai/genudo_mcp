---
name: design-stage-followups
description: Design a per-stage follow-up sequence for a Genudo pipeline — timed follow-up messages (for example ten hours after the lead goes quiet), each with its own drafting instructions and optional assets like videos or materials. Use when the user wants to re-engage silent leads or add a nurture sequence to a stage. Designs and stages the sequence locally and sets the follow-up limit; pushing the sequence itself needs a connector follow-up tool that is not yet available.
---

# Design Stage Follow-ups

Design a re-engagement sequence for leads who go quiet inside a stage.

> **Tool availability:** the connector today exposes only the pipeline-level `followup_limit`,
> not per-stage follow-up sequence/asset tools. This skill fully **designs** the sequence into
> local files and can set the limit via `configure-pipeline-settings`. When the backend ships
> follow-up tools, they appear in the connector automatically and this skill will push directly —
> re-run it then.

## Design (per stage)

For each follow-up in the sequence, define:
- **Timing** — when it fires (e.g. 10h after the lead's last message; then 24h; then 3 days).
- **Instructions** — how to draft this specific message (angle, what to reference, the ask).
  These control the drafting, not a fixed script.
- **Assets** — optional attention hooks: a video, a case study, a material, a compelling fact.

Keep the sequence short and value-led; stop on reply or stage exit.

## Output

Write `./genudo-build/<pipeline>/followups/<stage>/sequence.md` — the ordered sequence, ready to
push the moment the follow-up tools exist. Set `followup_limit` now via
`configure-pipeline-settings` if the user wants a cap.
