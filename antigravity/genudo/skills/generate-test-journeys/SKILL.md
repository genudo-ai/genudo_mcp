---
name: generate-test-journeys
description: Author a multi-turn synthetic-customer test suite for a Genudo agent — realistic 4–12 step journeys with fact, action, and stage assertions, global guardrail rules, and the business facts the judge grades against — as JSON for the Genudo testing engine. Use when the user wants test cases, a test suite, regression tests, or QA scenarios for an agent, or wants a production incident or mining report turned into tests.
---

# Generate Test Journeys

Write journeys that behave like real customers and assert behaviour, not wording. Output is a
suite JSON the `genudo-agent-testing-engine` runs (see `run-agent-tests`); its
`templates/starter-suite.json` is the reference example.

## 1. Gather the ground truth

- **Facts**: prices, offers, shipping fees and times, payment methods, policies, links.
  Pull them from the knowledge tables (`list_knowledge_tables`, `search_knowledge_table`) and
  confirm anything ambiguous with the user. Facts become the suite's `facts` text — the judge
  grades against it, so it must be exact.
- **Flow**: `list_pipeline_stages` for stage names and enter conditions; `list_actions` for the
  action names a step can expect (e.g. the order or support webhook).
- **Demand**: the `mine-customer-chats` report — cluster shares set how many journeys each
  intent gets; verbatim openers become first messages.
- **Incidents**: every real failure the user reports becomes a journey with `source_incident`.

## 2. Design rules

1. **4–12 steps per journey.** Single-turn checks miss state bugs.
2. **One consistent persona** per journey; later turns reuse earlier details (city, size,
   payment choice) without restating them. Write in the customers' real language and dialect,
   including the misspellings mining surfaced.
3. **Assert behaviour, not wording** — numbers, required elements, the action, the stage.
   Never assert a full verbatim reply.
4. **Priorities**: P0 = main sales path, order capture, payment, safety, top-volume intents (a
   P0 failure blocks release); P1 = edge cases, modifications, support; P2 = style and rare
   phrasings.
5. **Cover the negatives**: customer gives an address only to ask shipping (no order must
   fire), objects to price (no invented discount), changes their mind, sends a blurry or
   unrelated image, asks something the business doesn't do.

## 3. Suite format

```
suite: version, agent_name, brand_terms[], facts, global_rules[], cases[]
case:  case_id (J01…), short_name, contact_name, category, priority (P0|P1|P2),
       pipelines ("messenger,instagram" or "all"), start_stage, description,
       source_incident, steps[]
step:  step_no, customer_message, image (fixture path, optional), expected_reply (human
       reference), must_contain_all / must_contain_any / must_not_contain ("||"-separated),
       regex_must, regex_forbidden, expect_action (action name | none),
       expect_payload_contains, expect_stage, expect_stage_not, judge_rubric,
       severity (critical|major|minor), language (ar|en)
rule:  rule_id, description, type, pattern, exempt_if_reply_contains, severity, category
```

Rule `type`: `regex_forbidden`, `max_emoji`, `links_allowlist`, `min_length`,
`no_duplicates`, `action_payload_forbidden`.

Keep `must_contain_*` to the essential facts and put judgement calls in `judge_rubric` — the
LLM judge overrides deterministic false alarms from dialect spelling variants.

## 4. Global rules

Start every suite with the universal core, then add brand rules from the facts:

| Universal | Type |
|---|---|
| No internal names leaked (action names, `stage_id`, `webhook`, `n8n`, tool names) | `regex_forbidden` |
| No absolute guarantees ("100%", "guaranteed") | `regex_forbidden` |
| No empty reply | `min_length` |
| No duplicate message in one answer | `no_duplicates` |
| No placeholder or invented phone in action payloads | `action_payload_forbidden` |
| Links only from the business's own domains | `links_allowlist` |
| At most N emojis per message (brand name exempt) | `max_emoji` |

Brand rules to consider: banned phrases or flattery, competitor names, expired offers, old
prices shown beside offer prices, regulated claims (medical, financial), "to be confirmed"
for fixed fees. List the brand's own product and company names in `brand_terms` (exempt from emoji and
language checks), and use `exempt_if_reply_contains` for legitimate negations ("not a
treatment").

## 5. Deliver

Save `<agent>-suite.json`, show a table of cases (ID, name, priority, steps, what it
protects), and confirm with the user before any run. Use only `@example.com` emails and
obviously fictional names in contact fields — the runner adds the `TEST R<n>` tag itself.
