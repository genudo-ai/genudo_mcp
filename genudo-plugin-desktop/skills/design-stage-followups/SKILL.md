---
name: design-stage-followups
description: Design and push a per-stage follow-up sequence for a Genudo pipeline — timed follow-up messages (for example ten hours after the lead goes quiet), each with drafting instructions and optional assets like videos or materials. Use when the user wants to re-engage silent leads, add a nurture sequence to a stage, or change an existing follow-up schedule.
---

# Design Stage Follow-ups

Design and push a re-engagement sequence for leads who go quiet inside a stage.

## Check first

`get_stage_followup` for the target stage — **each stage holds at most ONE followup**. If one
exists, you will `update_followup` (it returns the `followup_id`); if not, `create_followup`.

## Design (per stage)

- **Intervals** — the timed schedule: when each message fires after the lead goes quiet
  (e.g. 10h, then 24h, then 3 days). Short and value-led. Each entry is
  `{interval_value: 1–100, interval_unit: minute|hour|day|week|month}`; array order is the
  firing sequence.
- **Instructions** — how the AI drafts each follow-up (angle, what to reference, the ask).
  These control drafting, not a fixed script.
- **Assets** — optional attention hooks: a video, a case study, a material link.
- **After-sequence move** — optional `after_followup_stage_id`: the stage to move the
  opportunity to when all intervals are exhausted with no reply (typically a lost stage).

## Push

1. New: `create_followup` with `stage_id`, `is_active`, `intervals`, plus `instructions`,
   `assets`, `after_followup_stage_id` as designed. Start with `is_active: false` if the user
   wants to review before it goes live.
2. Existing: `update_followup` — **`intervals` REPLACES the whole schedule**; always send the
   full list, never a delta. Pass `after_followup_stage_id: null` to remove the transition.
3. Cap total follow-ups per conversation with `followup_limit` via `configure-pipeline-settings`.

## Output

Show the user the sequence (timing, drafting angle, assets, after-move) as a table and get an
explicit yes before pushing. Save the design to
`./genudo-build/<pipeline>/followups/<stage>/sequence.md` when working in a filesystem.
