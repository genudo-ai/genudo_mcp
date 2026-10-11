---
name: run-agent-tests
description: Run a synthetic-customer test suite against a live Genudo agent with the Genudo testing engine — isolated test leads, multi-turn messages, wait-for-reply polling, action and stage tracking, automatic archive-and-pause cleanup — and summarize the results. Use when the user wants to test an agent, run the suite, run regression or P0 tests, re-test after an instruction change, or compare two runs.
---

# Run Agent Tests

Drive the engine, then explain what happened. Requires a working setup
(`setup-testing-engine`) and a suite (`generate-test-journeys`).

## 1. Confirm before any live run

A run creates real opportunities (flagged `is_test`), sends real messages to the agent, and
lets it fire real actions. State to the user: the pipeline(s), the case count, and which
webhooks may fire — then get a yes. Always do a dry run first:

```bash
python3 src/engine.py run --suite <suite.json> --pipeline <channel|all> --dry-run
```

## 2. Run

```bash
python3 src/engine.py run --suite <suite.json> --pipeline <channel|all> --run-no <N> \
  [--cases J01,J02] [--priority P0|P0,P1|all] [--category TEXT] \
  [--workers 3] [--stop-on-fail] [--keep-live] [--allow-prod]
```

- `--run-no` — increment per run; it labels leads and typed names `TEST R<N>`.
- Targeted re-test after a fix: `--cases <failed ids>`; regression: `--priority P0`.
- Keep `--workers` at 3 or less; the MCP limit is 30 requests/minute and the engine throttles
  and backs off on its own.
- `--keep-live` skips cleanup — only when the user wants to inspect the test conversations
  in the inbox; remind them to archive afterwards.
- `--allow-prod` only with explicit user approval for that run.

What the engine guarantees: each case gets its own `@example.com` test contact; it waits for
14s of agent silence (max 150s) before checking a step, because agents often answer in
several messages; and cleanup moves every test lead to `Archived` and pauses its conversation
even if the run crashes.

Exit code `1` means at least one P0 case did not pass.

## 3. Read the results

Output lands in `runs/<run-id>/`: `results.json` (every reply, check, action, stage, judge
verdict) and `report.html`. Summarize:

- Pass / fail / warn per priority, P0 first.
- Each failure: case and step, the customer message, what the agent did, which check failed
  (deterministic or judge), and the judge's reason.
- Steps marked `judge_error` or flagged only by Tier-1 checks → hand to
  `evaluate-agent-replies` before calling them real defects.

Compare with the previous run to see regressions and fixes:

```bash
python3 src/engine.py compare runs/<old>/results.json runs/<new>/results.json
```

## 4. Hand off

Real defects → `remediate-agent-defects`. Tracked work → `plan-qa-sprint`.

Run output contains full transcripts; don't paste it into public places or commit it.

## Troubleshooting

- **No reply within 150s** — pipeline inactive, model pool out of credit, or the channel is
  disconnected. Check the inbox and `get_ai_performance`.
- **`-32029` / HTTP 429** — another tool is hitting the MCP; the engine backs off, but stop
  parallel scripts.
- **"Archived stage missing"** — create it (see `setup-testing-engine`); until then test leads
  stay where the run left them.
- **401** — token expired or lacks write scopes; create a new one.
