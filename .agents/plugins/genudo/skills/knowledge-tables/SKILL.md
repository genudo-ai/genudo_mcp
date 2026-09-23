---
name: genudo-knowledge-tables
description: Manage, search, upsert, and curate GenuDo knowledge tables and vector grounding points. Trigger when managing company knowledge bases, updating facts, performing semantic vector searches, or modifying knowledge points.
---

# GenuDo Knowledge Tables Management

## Overview
Knowledge tables provide structured, vector-indexed factual grounding for GenuDo AI agents. Each table contains a defined column schema and row records retrieved via semantic hybrid search at runtime when leads ask factual or product questions.

## Key Tools

| Task | MCP Tool |
|---|---|
| View tables, columns, and attached pipelines | `list_knowledge_tables` |
| Create a new knowledge table schema | `create_knowledge_table` |
| Insert or update knowledge rows (vector points) | `upsert_knowledge_points` |
| Test runtime semantic retrieval | `search_knowledge_table` |
| Delete rows by stable ID | `delete_knowledge_points` |

---

## Step-by-Step Workflow

### 1. Discovery & Schema Inspection
Call `list_knowledge_tables` to inspect:
- Existing table names, descriptions, and IDs.
- Column schemas (e.g., `product_name`, `pricing`, `features`, `eligibility`).
- Which pipelines are linked to each table.

### 2. Table Creation
When creating a new table (`create_knowledge_table`):
- **`name`**: Descriptive identifier (e.g., `summer_camp_pricing_2026`).
- **`description`**: Clear "when-to-use" prompt guiding the AI router on when to query this table.
- **`columns`**: Array of column names that define the row schema.

### 3. Upserting Knowledge Points
Call `upsert_knowledge_points` to populate or update data:
- **`table_id`**: Target knowledge table ID.
- **`points`**: Array of data rows.
- **Stable ID (`default_id`)**: Always assign a deterministic, stable ID (e.g., `prod-pro-annual`, `faq-refund-policy`). If a point with the same `default_id` exists, it updates in-place; otherwise, it inserts a new row.
- **Complete Columns**: Supply values for all defined schema columns to avoid incomplete facts.

### 4. Verifying Retrieval
Always test retrieval before declaring the knowledge base ready:
- Call `search_knowledge_table` with `table_id`, `query`, and optional `limit`.
- Use realistic customer phrasing (e.g., "how much does the family plan cost?").
- Verify that the expected row is returned in the top matches with high relevance.

### 5. Deleting Outdated Points
- Call `delete_knowledge_points` with the target `default_id` list.
- **Caution**: Deletions are irreversible. Always show the candidate rows to the user and obtain confirmation before executing.

---

## Best Practices

- **Knowledge Table vs. Global Instructions**:
  - Use **Global Instructions** for overarching business rules, communication style, and fixed operational boundaries.
  - Use **Knowledge Tables** for variable catalogs, FAQs, pricing tiers, and domain knowledge that updates frequently or exceeds prompt limits.
- **Stable IDs**: Never generate random IDs for points if you need to update them later; use slugified semantic keys.
