---
name: remediate-agent-defects
description: Turn failed test steps or mined conversation defects into the smallest fix that removes them — a knowledge row, a stage instruction, an enter condition, or a global rule — then prove it with a targeted re-run and a P0 regression. Use after run-agent-tests or evaluate-agent-replies reports failures, or after mine-customer-chats finds defects, and the user wants them fixed without breaking other journeys.
---

# Remediate Agent Defects

Fix the root cause with the narrowest edit, then re-test. Broad prompt rewrites trade one
fixed journey for two broken ones.

## 1. Attribute each defect

Classify every failure before touching anything:

| Symptom | Root cause | Fix target | Tool |
|---|---|---|---|
| Wrong or missing fact (price, policy, spec) | Knowledge gap or conflict | Knowledge row | `upsert_knowledge_points` |
| Action fired too early or not at all | Stage instruction lacks an explicit trigger | Stage instructions | `update_stage` |
| Opportunity stuck in or jumped to the wrong stage | Vague or overlapping enter condition | Enter condition | `update_stage` |
| Tone, leak, invented discount, banned phrase | Missing hard rule | Pipeline global instructions | `update_pipeline` |
| Wrong payload field, bad phone, malformed webhook | Variable or action config | Action / variable | `build-action-webhook`, `manage-pipeline-variables` |

Group failures that share a cause — five failed steps are often one missing sentence.

## 2. Draft the surgical change

Rules of thumb:

- **Facts live in knowledge tables**, not instructions — prices and policies change, and a
  knowledge row updates without retesting the whole prompt.
- **Workflow lives in stage instructions** — when to ask, when to summarize, when to fire.
- **Global instructions hold persona and hard limits only.**
- **Prefer explicit negatives with a replacement**: "NEVER fire the order action before the
  customer confirms the summary; instead present items + shipping + total and ask for
  confirmation."
- Never encode one test customer's name, city, or phone into an instruction.

Typical patterns:

- *Premature order* → require an explicit confirmation turn before the order action fires.
- *Invented discount* → hard rule: never invent discounts or bundles; restate the active
  offers from the knowledge table instead.
- *Missed stage move* → rewrite the enter condition around the customer's observable intent
  ("has already ordered and asks about delay, courier, return, or change").
- *Unverified assumption* → add the missing fact as a knowledge row with the business's
  approved answer.

## 3. Apply safely

Instruction, persona, and enter-condition changes go through the `editing-playbook`: load
the current text, show a before/after diff with the defect it fixes, get explicit
confirmation, then push. Knowledge rows go through `manage-knowledge-base`. If the suite's
Facts tab states something the fix changes (a new price), update the suite too.

## 4. Verify

1. Re-run only the failed cases (`run-agent-tests`, `--cases <ids>`).
2. Re-run all P0 cases to catch regressions.
3. The fix is done only when the failed cases pass and P0 is still green. If a P0 case
   breaks, revert the edit (the playbook keeps the previous text) and rethink the cause.

Log each remediation — defect, cause, edit, re-run result — so `plan-qa-sprint` can track it.
