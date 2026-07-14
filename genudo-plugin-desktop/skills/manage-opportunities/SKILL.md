---
name: manage-opportunities
description: Update Genudo opportunities in bulk — change status, move stage, set priority, add notes, or add and remove tags across one or many leads. Use when the user wants to move leads to won or lost, tag a segment, add notes, re-prioritize, or clean up the pipeline. Confirms the exact set before writing; stage moves stay within the same pipeline.
---

# Manage Opportunities

Bulk-update leads. This writes to the account — confirm the exact target set first.

## Workflow

1. **Select** — `list_opportunities` with filters (`pipeline_id`, `stage_id`, `status`,
   `priority`, `q`, `tag_ids`, date range) to get the precise `opportunity_ids`.
2. **Show the set** — list what will change and how (e.g. "these 14 leads → status won,
   add tag `enrolled`").
3. **Confirm** — get an explicit yes; bulk writes are hard to undo.
4. **Apply** — `update_opportunities` with `opportunity_ids` and the changes:
   `status`, `stage_id`, `name`, `notes`, `tags`, `deleted_tags`.

## Rules

- Stage moves must stay **within the same pipeline**.
- Tags can be auto-created by name; use `deleted_tags` to remove.
- Report exactly what was updated; never claim success without the tool result.
