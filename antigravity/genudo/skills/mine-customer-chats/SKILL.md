---
name: mine-customer-chats
description: Mine a Genudo pipeline's real customer messages to find what buyers actually ask, where the agent fails them, and which facts are missing from the knowledge base. Use when onboarding or auditing an agent, when the user asks what customers ask most, wants buyer intents or archetypes, wants knowledge-base gaps found from real chats, or wants real-world input for a test suite. Read-only; produces a local mining report that feeds generate-test-journeys.
---

# Mine Customer Chats

Turn real conversations into an empirical picture of demand: what customers ask, how often,
and where the agent's answers or knowledge run out. Read-only — nothing is written to the
account.

## 1. Scope the sample

- Confirm the pipeline (`list_pipelines`) and a window — 14–30 days is usually enough.
- Pull customer-side messages with `list_messages` filtered by `pipeline_id`, `start_date`,
  `end_date` and `role`. Fetch one unfiltered page first to learn the role values this
  account returns, then filter to the customer side. Page with `next_cursor`.
- Skip test traffic: opportunities with `is_test`, `@example.com` emails, or names ending in
  `TEST R<n>` (`list_opportunities` shows these).
- Stay under the 30 requests/minute limit; on error `-32029` or HTTP 429, wait ~25s and resume.

## 2. Clean the turns

- Keep customer text only. Merge consecutive customer messages sent within ~60s into one turn.
- Drop pure greetings, stickers, and empty messages.
- Keep dialect and transliteration as written (Egyptian/Gulf Arabic, Franco-Arabic like
  `bkam`, `3ayez`) — those spellings are exactly what tests must exercise later.

## 3. Cluster intents

Derive clusters from the data and the pipeline's business, not a fixed list. A typical
commerce set, to adapt:

| Cluster | Examples |
|---|---|
| Price & offers | price, bundles, discounts, free-shipping threshold |
| Product fit | which variant suits me, sizes, ingredients/specs |
| Usage | how to use, compatibility, results |
| Order intent | "I want to order", sends address/phone |
| Payment | cash on delivery, wallets, cards, instalments |
| Delivery | time to my city, shipping cost, tracking |
| Post-purchase | delays, changes, cancellation, returns, complaints |

Count each cluster's share of turns and of conversations, and keep 3–5 verbatim examples.

## 4. Find the gaps

For a sample of conversations per cluster, read the agent's replies around the customer turn
and flag:

- **Deflected or vague answers** ("I'll check and get back to you") to a factual question.
- **Knowledge gaps** — run `search_knowledge_table` with the customer's question; no relevant
  row means a missing fact. Note the exact question and the answer the business should give.
- **Premature action** — an order or webhook fired before the customer confirmed (cross-check
  `list_actions` for the pipeline's actions and the opportunity's stage history).
- **Missed action** — the customer clearly confirmed but nothing fired or the stage didn't move.
- **Wrong stage** — the conversation's intent changed but the opportunity stayed put
  (`list_pipeline_stages` for the expected route).

## 5. Report

Write `mining-report-<pipeline>-<date>.md` locally:

1. Sample size (conversations, customer turns, window).
2. Intent distribution table with examples.
3. Top 10 opening messages, verbatim.
4. Gaps — each with the evidence (conversation ID + quote), the failure type, and the
   suggested fix target (knowledge row, stage instruction, enter condition, global rule).
5. Candidate journeys: one line per buyer archetype worth testing, P0 for the high-volume
   and revenue paths.

Hand off: knowledge gaps → `manage-knowledge-base`; instruction defects →
`remediate-agent-defects`; candidate journeys → `generate-test-journeys`.

Never paste customer phone numbers, emails, or full names into the report; refer to
conversations by ID.
