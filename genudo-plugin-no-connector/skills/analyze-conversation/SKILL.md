---
name: analyze-conversation
description: Analyze a real Genudo conversation to explain the AI agent's behaviour and find the root cause of any drift. Use when the user gives a conversation link or ID, or a client's phone number, and asks what happened, why the agent responded that way, where it went wrong, or why it didn't follow the script. Pulls the transcript, evaluates it turn by turn, traces issues to the responsible instruction, stage, or action, and recommends the fix.
---

# Analyze Conversation

Reconstruct what an agent actually did in a real chat and explain why — then point to the fix.

## Resolve the transcript

- Given a **conversation ID** (from a link): fetch its messages with `list_messages`
  (filter by pipeline/contact as available; page with the cursor for long histories).
- Given a **phone number**: `list_contacts` to resolve the contact, then `list_messages`
  filtered by `contact_id`.

## Evaluate turn by turn

Walk the transcript in order and note, per turn:
- which stage the agent was likely in,
- whether it followed that stage's flow and honored global rules,
- **drift points** — where it invented facts, claimed a false action success, asked for data
  it already had, skipped/entered a stage wrongly, or broke tone.

## Root-cause

For each drift point, trace it to the responsible field:
persona · global instructions · a stage's `enter_condition` · a stage's `instructions` · an
action's `instructions`/variables. Cross-reference the live text with `list_pipelines` /
`list_pipeline_stages`.

## Output

Write `./genudo-work/conversations/<id>/analysis.md`: a turn timeline, the drift points, the
root cause per point, and the recommended fix. Hand off to `diagnose-agent-behavior` →
`edit-pipeline-instructions`. Read-only; no account writes here.
