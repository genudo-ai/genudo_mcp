---
name: manage-knowledge-base
description: Manage a Genudo pipeline's knowledge base — structured knowledge tables the agent searches at runtime to answer grounded questions. Use when the agent gives wrong or outdated facts, or the user wants to create a knowledge table, add or fix rows, verify what the agent retrieves, or remove stale entries.
---

# Manage Knowledge Base

Curate the grounded facts an agent answers from. A knowledge base is a set of **knowledge
tables**; each table has a **name**, a **when-to-use description**, **columns** (the schema),
and **rows** the pipeline agent retrieves via semantic search at runtime.

## Tools

| Task | Tool |
|---|---|
| See tables, their columns + attached pipelines | `list_knowledge_tables` |
| Create a table with its columns | `create_knowledge_table` |
| Insert or update rows | `upsert_knowledge_points` |
| Test what the agent would retrieve | `search_knowledge_table` |
| Remove rows | `delete_knowledge_points` |

## Workflow

1. **Discover** — `list_knowledge_tables` to find the right table (or confirm none exists).
2. **Create** — `create_knowledge_table` needs `name` and at least one column; write the
   `description` as a when-to-use so the agent picks the right table.
3. **Fill / fix** — `upsert_knowledge_points`: every row needs a stable `default_id` (matching
   `default_id` updates the row, new one inserts) **and a value for every column**. Reuse the
   same `default_id` to correct a fact in place.
4. **Verify retrieval** — `search_knowledge_table` with a question a real customer would ask;
   confirm the fixed row comes back (hybrid search is on by default; `limit` up to 20).
5. **Prune** — `delete_knowledge_points` by `default_id` values. Confirm with the user first;
   there is no undo, and there is no table-delete tool — only rows can be removed.

## Cautions

- A wrong fact in the KB propagates to every conversation — confirm every write.
- For a stable business fact the agent must always know, prefer the pipeline's global
  `instructions` (via `edit-pipeline-instructions`); use the KB for facts that vary by
  product, plan, or row.
