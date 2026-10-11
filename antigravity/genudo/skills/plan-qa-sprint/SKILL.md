---
name: plan-qa-sprint
description: Turn agent test failures, chat-mining gaps, and requested agent changes into a prioritized 2-week sprint backlog in Excel — user stories, Fibonacci points, acceptance criteria tied to test cases, P0 blockers first. Use when the user wants a sprint plan, backlog, roadmap, or status sheet for improving a Genudo agent, or wants test results turned into tracked work for a client or team.
---

# Plan QA Sprint

Convert findings into tracked, testable work. Every story closes on a test, not an opinion.

## 1. Collect the inputs

- Failed steps from the latest run (`run-agent-tests` / `evaluate-agent-replies` →
  `results.json`).
- Gaps from `mine-customer-chats` reports.
- Change requests from the user or client.
- Remediations already applied and verified (`remediate-agent-defects` log) → status `Done`.

Merge duplicates: several failed steps with one root cause become one story.

## 2. Write the stories

One object per story:

| Field | Rule |
|---|---|
| `id` | `BUG-nn` for defects, `US-nn` for new behaviour |
| `priority` | `P0` blocks go-live (sales path, orders, payments, safety, high-volume intent); `P1` important; `P2` polish |
| `category` | e.g. Order journey, Objection handling, Guardrail, Integration, Knowledge |
| `story` | "As a <customer>, I want <behaviour> so that <outcome>" |
| `component` | Global instructions, Stage instruction, Enter condition, Knowledge table, Action/webhook, Platform |
| `points` | Fibonacci only: 1, 2, 3, 5, 8, 13 — split anything bigger |
| `acceptance` | Observable and testable; name the assertion |
| `linked_test` | Case ID(s) that prove it (`J04`), or `NEW` if a journey must be written first |
| `status` | To Do, In Progress, Verified, Done |

Keep client data out of the stories: no customer names, phone numbers, or account numbers.

## 3. Allocate and build the sheet

Save the stories as `stories.json` and run the bundled script from this skill's directory:

```bash
python3 build_backlog.py stories.json -o sprint_backlog.xlsx --capacity 35
```

It places every P0 in Sprint 1 (even past capacity — it flags the overflow on the Summary
tab), then fills P1 and P2 first-fit into later sprints. Needs `openpyxl`
(`pip install openpyxl`). `python3 build_backlog.py --self-check` verifies the allocator.

## 4. Review with the user

Show the Summary tab numbers, call out any over-capacity sprint, and list stories marked
`NEW` that need a journey before they can be verified (`generate-test-journeys`).
