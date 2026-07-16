---
name: author-pipeline-brain
description: Draft the pipeline persona (who the agent is and how it sounds) and the global instructions (cross-stage behaviour — product facts, grounding, style, escalation) for a new or existing Genudo pipeline, from a requirements spec. Use after gathering pipeline requirements, or when the user asks to write, rewrite, or improve the persona or the pipeline's global instructions. Stages the drafts as local files for review before any push.
---

# Author Pipeline Brain (persona + global instructions)

Produce the two pipeline-level fields that govern the whole agent. Keep them lean — every
token is paid on every message.

## Before writing

Call `get_instruction_guides` (authoring principles, the persona/global template, the
token-aware QA checklist) and follow it. Read the spec from `./genudo-build/<pipeline-slug>/spec.md`.

## persona — identity + voice ONLY

Who the agent is, who it serves, through which channel, and its tone. No stage steps, no
tool logic, no pricing. A few sentences.

## instructions — GLOBAL behaviour only (cross-stage)

Include only the relevant sections (drop empty ones): primary objective, scope, approved
product/business facts, communication style, language rules, memory rules, knowledge usage,
data-collection rules, action/tool safety, escalation, sensitive-data, and a compact stage map.
This is the place for product introductions and behavioural notes that apply in every stage.

Hard rules: never invent products/prices/policies; never let the agent claim an action
succeeded without confirmation; keep secrets (stage names, tools) hidden from the customer.

## Output

Stage `./genudo-build/<pipeline-slug>/persona.md` and `.../instructions.md` (the "before build"
versions). Show both drafts, run the QA checklist, and get approval. Then hand off to
`author-stages`. Do not push to the account here.
