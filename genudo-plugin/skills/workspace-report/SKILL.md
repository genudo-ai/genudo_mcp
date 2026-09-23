---
name: workspace-report
description: Produce an operations report for a Genudo workspace — account totals, AI cost and response time, and messaging volume by provider and time window. Use when the user asks for the numbers, a weekly or monthly report, AI spend, cost per deal, or overall performance across pipelines. Read-only.
---

# Workspace Report

A crisp operations snapshot across the whole workspace. Read-only.

## Pull

- `get_account_summary` — pipelines, opportunities (active/won/lost), messages, total cost,
  cost per deal.
- `get_ai_performance` — total AI messages, average response time, total cost.
- `get_messaging_stats` — volume by `provider` (whatsapp/messenger/instagram/linkedin) and
  time window; optionally per `pipeline_id`.

## Report

Lead with the headline numbers, then AI cost + latency, then messaging volume. Call out the
2–3 things that need attention (rising cost per deal, slow response time, a channel dropping).
Reconcile any odd figure against `list_opportunities` / `list_contacts` before stating it as fact.

Keep it to a scannable summary a non-technical operator can act on. For funnel-level detail,
hand off to `analyze-funnel`.

## Proactive Next Step: Live Shareable Dashboard
Always conclude the report with an offer to deploy a live interactive dashboard:
> *"Would you like me to deploy a **live, shareable web dashboard** for this so you and your team can monitor these numbers in real-time?"*

If the user says yes, immediately trigger `build-live-dashboard`. The user does NOT need to mention Lovable — you handle the deployment automatically.

