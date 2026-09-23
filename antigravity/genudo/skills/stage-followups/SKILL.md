---
name: genudo-stage-followups
description: Design, schedule, and update per-stage follow-up sequences for re-engaging silent leads in GenuDo pipelines. Trigger when configuring lead nurture intervals, follow-up messages, or stage expiration actions.
---

# GenuDo Stage Follow-up Sequences

## Overview
Guidelines for creating and modifying automated re-engagement sequences when leads go quiet within a specific pipeline stage. Follow-ups allow the agent to reach back out after specified elapsed time intervals with context-aware, value-first messaging.

## Key Tools

| Purpose | MCP Tool |
|---|---|
| Check existing stage follow-up configuration | `get_stage_followup` |
| Create a new follow-up sequence for a stage | `create_followup` |
| Update an existing follow-up sequence | `update_followup` |

---

## Architecture of a Follow-up Sequence

Each pipeline stage holds at most **one** follow-up sequence. A sequence consists of:

1. **Intervals**: The timed schedule of when each message fires after the contact becomes inactive.
   - Format: Array of objects `{ interval_value: 1–100, interval_unit: "minute" | "hour" | "day" | "week" | "month" }`.
   - Example: First message at 10 hours, second at 24 hours, third at 3 days.
2. **Drafting Instructions**: Guidance for how the AI dynamically composes the follow-up message (e.g., "Reference the plan discussed previously, ask if they had questions regarding setup").
3. **Assets**: Optional media or resources attached to messages (brochures, demo videos, scheduling links).
4. **`after_followup_stage_id`**: Optional stage to automatically move the opportunity to when all follow-up attempts are exhausted without a reply (e.g., transitioning to a "Cold Leads" or "Closed Lost" stage).

---

## Step-by-Step Workflow

### 1. Check Existing Configuration
Always run `get_stage_followup` with the target `stage_id`:
- If a sequence exists, capture the `followup_id` for use with `update_followup`.
- If no sequence exists, prepare to call `create_followup`.

### 2. Design the Sequence
Collaborate with the user to establish:
- Realistic intervals that avoid spamming (e.g., 6 hours, 24 hours, 72 hours).
- Distinct angles for each follow-up message:
  - Follow-up 1: Gentle check-in / question clarification.
  - Follow-up 2: Value add (case study, testimonial, or brief tip).
  - Follow-up 3: Soft breakup or alternative contact option.
- Expiration action: specify `after_followup_stage_id` or leave `null`.

### 3. Push to GenuDo
- **New Sequence**: Call `create_followup` with `stage_id`, `is_active`, `intervals`, `instructions`, and optional `after_followup_stage_id`.
- **Existing Sequence**: Call `update_followup` with `followup_id`.
  - **Important**: The `intervals` array *replaces* the existing schedule completely; always pass the full intended list.

---

## Safety & Best Practices

- **Explicit Approval**: Always present the follow-up schedule and drafting angle to the user in a clear table before calling `create_followup` or `update_followup`.
- **Safe Activation**: When creating draft sequences, set `is_active: false` until the user confirms readiness to go live.
