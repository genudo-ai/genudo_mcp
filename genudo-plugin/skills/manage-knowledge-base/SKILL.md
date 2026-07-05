---
name: manage-knowledge-base
description: Manage a Genudo pipeline's knowledge base — its sources (each with a name and a when-to-use description) and their rows, which the agent uses to answer grounded questions. Use when the agent gives wrong or outdated facts, or the user wants to add a source, fix a row, or change when a source is used. Knowledge-base tools are not yet in the connector; this skill activates automatically when they ship and can advise in the meantime.
---

# Manage Knowledge Base

Curate the grounded facts an agent answers from. A knowledge base is a set of **sources**;
each source has a **name**, a **when-to-use** description, and **rows** (like a spreadsheet).

> **Tool availability:** knowledge-base tools are **not yet in the connector**. This skill is a
> ready playbook — when the backend ships KB tools (e.g. list/search sources, read/edit rows,
> edit source name + when-to-use), they surface in the connector automatically and this skill
> works without any change. Until then, advise the user and flag the gap.

## Playbook (activates when tools exist)

1. **List sources** — review each source's name + when-to-use to find the right one.
2. **Locate the fact** — search rows within that source.
3. **Fix** — edit the offending row(s), or edit the source's name / when-to-use so the agent
   retrieves it at the right moments.
4. Confirm before writing; a wrong fact in the KB propagates to every conversation.

## Meanwhile (no tools yet)

If the agent is giving wrong facts and the KB can't be edited through the connector, either
(a) correct the fact in the pipeline's global `instructions` as an approved fact (via
`edit-pipeline-instructions`) if it's stable, or (b) tell the user to fix the source in the
Genudo dashboard, and note it for the backend tool request.
