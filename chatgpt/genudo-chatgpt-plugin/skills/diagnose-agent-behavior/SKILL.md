---
name: diagnose-agent-behavior
description: Diagnose why a Genudo AI agent is misbehaving and locate the exact fix. Use when the user reports the agent said something wrong, isn't qualifying or closing properly, skips a step, repeats itself, drifts off-script, or fires an action at the wrong time. Maps the symptom to the responsible layer — persona, global instructions, a stage's entry condition or flow, or an action's instructions — and hands off the fix. Reads and proposes; changes go through the edit skills.
---

# Diagnose Agent Behavior

Find the root cause of a behavioural problem and point to the one place that fixes it.

## Steps

1. **Clarify the symptom** — what did the agent do, in which situation, and what was expected?
   If there's a real conversation, use `analyze-conversation` first for evidence.
2. **Load the agent** — `list_pipelines` (persona + global instructions) and
   `list_pipeline_stages` (each stage's `enter_condition` + `instructions`). If an action is
   involved, `list_variables` and review the action's `instructions`.
3. **Localize** — map the symptom to exactly one responsible layer:
   - wrong identity/tone → **persona**
   - a rule that should hold everywhere but doesn't → **global instructions**
   - entered/skipped a stage at the wrong time → that stage's **enter_condition**
   - wrong steps or order inside a stage → that stage's **instructions**
   - action fired at the wrong moment or with wrong data → the **action** (instructions/variables)
4. **Propose the fix** — name the field, quote the offending text, and give the corrected intent.

## Output

Write `diagnosis.md`: symptom → evidence → responsible field → proposed change → which skill
applies it (`edit-pipeline-instructions`, `build-action-webhook`, or `manage-pipeline-variables`).
This skill does not write to the account; hand off through the edit skills' confirmation gates.
