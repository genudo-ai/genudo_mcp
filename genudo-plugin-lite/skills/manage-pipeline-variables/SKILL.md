---
name: manage-pipeline-variables
description: Create and manage the variables a Genudo pipeline uses in its actions and webhooks — system variables (opportunity/contact fields), AI-extracted variables (profiled from the conversation), action-output variables (for chaining), and fixed constants. Use when setting up an action that needs data, or when the user asks to add, edit, or remove a pipeline variable. Discovers existing variables first and creates any missing ones before an action references them.
---

# Manage Pipeline Variables

Variables are how actions get runtime data. Actions cannot use raw system placeholders like
`{{opportunity.contact_email}}` directly — route every runtime value through a named variable.

## Variable types

| `type` | Source | Example |
|---|---|---|
| `from_system` | opportunity/contact fields | value `opportunity.contact_email`, `opportunity.contact_phone` |
| `from_ai` | extracted from the conversation | a profiled interest, budget, or intent |
| `from_action` | a previous action's output | chain action B on action A's response |
| `fixed` | a constant you set | an API token tag, a source label |

`data_type` is `string` | `integer` | `boolean` | `float`; set `is_required` per field.

## Workflow

1. **Discover** — `list_variables` for the pipeline; reuse existing rather than duplicating.
2. **Create missing** — `create_variable` for each needed value, **before** any action
   references it. For `from_system` give the dotted source; for `from_ai` describe what to
   extract; for `from_action` point at the source action's output.
3. **Edit / remove** — `update_variable`, `delete_variable`.

## Cautions

- Renaming a variable that an action already references may be ignored.
- `delete_variable` fails if the variable is still referenced by an action — remove the
  reference first.
- Confirm creates/deletes with the user.
