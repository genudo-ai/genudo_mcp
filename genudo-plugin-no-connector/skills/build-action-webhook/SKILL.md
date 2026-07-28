---
name: build-action-webhook
description: Build or update an outbound HTTP action (webhook) on a Genudo pipeline or stage — to Zapier, Make, n8n, a CRM, Google Sheets, or any API. Use when the user wants the agent to register a lead, send data to an external tool, call an API, or trigger an automation. Configures method, URL, headers, payload fields mapped to variables, when-to-call instructions, and a response example for action-to-action chaining.
---

# Build Action Webhook

Create the HTTP action that lets an agent push data out or call an API.

## Before creating

Ensure every value the payload/URL/headers need already exists as a variable
(`manage-pipeline-variables`). Never inline raw `{{opportunity.*}}` — reference variables by
their name.

## Fields

- **`method`**, **`url`** — the endpoint (e.g. a Zapier/Make/n8n catch hook).
- **`headers`** — auth and content-type; values may reference variables.
- **`payload`** — each entry is a field name + type + the variable that fills it.
- **`fixed_trigger`** — `stage_started` | `on_any_message` | `on_user_message` | `custom`.
- **`stage_id`** — attach to a stage; **omit for a pipeline-wide action.**
- **`instructions`** — WHEN the agent should call this action, plus any special handling.
- **`response_example`** — a sample response; set this when a later action chains on this
  one's output (via a `from_action` variable).
- Optional: `max_fires`, `retries`, `order`.

## Workflow

1. `list_actions` for the pipeline — avoid duplicating an existing action, and find the
   `action_id` when the user means to change one.
2. `list_variables`; create any missing (delegate to `manage-pipeline-variables`).
3. Confirm the full action spec with the user.
4. `create_action` (or `update_action` to change one). Report the action ID.

## Cautions

- `fixed_trigger` is set at creation; on update it can only change to `on_user_message` or
  `custom`. Pick the trigger correctly the first time.
- The agent must not tell the customer the action succeeded unless the response confirms it.
