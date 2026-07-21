---
name: wire-stage-automation
description: Wire an end-to-end automation into a Genudo stage — collect the required data, fire an action when it's ready, and tell the customer the outcome. Use when the user describes a rule like "when name, phone, and course are collected in the closing stage, register the lead to Google Sheets and tell them someone will reach out." Provisions the variables and the action, updates the stage flow to reference them, and confirms before writing.
---

# Wire Stage Automation

The end-to-end orchestration that connects a stage's conversation to an external system. This
composes three skills into one coherent change.

## The pattern

> In stage X, collect fields A, B, C. When all are present, fire action Y (to Zapier/Make/n8n/
> CRM/Sheets). On success, say a confirmation line; on failure, recover honestly.

## Steps

1. **Read the stage** — `list_pipeline_stages` to load the target stage's current
   `instructions`, and `list_actions` to see what automations the stage already fires.
2. **Variables** — via `manage-pipeline-variables`, ensure the fields exist (usually `from_system`
   for contact data + `from_ai` for anything profiled from the chat).
3. **Action** — via `build-action-webhook`, create the webhook with the payload mapped to those
   variables, `stage_id` = the target stage, `fixed_trigger` chosen to match the flow, and
   `instructions` describing the fire condition ("only when A, B, C are all collected").
4. **Update the stage flow** — via `edit-pipeline-instructions`, edit the stage `instructions`
   so the flow references the action explicitly: collect → fire → confirm on success →
   recover on failure. Never script a false "done."
5. **Confirm and push** — show the variable list, the action spec, and the stage-flow diff;
   get one explicit approval covering all writes.

## Output

Write `<workdir>/genudo-build/<pipeline>/automation-map.md` (or inline) recording the trigger, the
variables, the action, and the success/failure messaging.
