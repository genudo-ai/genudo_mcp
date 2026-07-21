---
name: edit-pipeline-instructions
description: Safely edit a live Genudo agent's instructions — the pipeline persona, the pipeline global instructions, or a stage's instructions or entry condition. Use when the user wants to change, fix, tune, rewrite, or migrate what an existing agent says or does. Loads the current text, edits only what must change, shows a before/after diff with expected impact, and pushes only after explicit confirmation.
---

# Edit Pipeline Instructions

Edit a live agent's four instruction fields — pipeline `persona`, pipeline `instructions`
(global), stage `instructions` (flow), stage `enter_condition` (entry) — safely and reversibly.

## Run the shipped playbook

Call `get_editing_playbook` and follow it exactly; call `get_instruction_guides` for the
authoring rules. The playbook is the source of truth for the load → mirror → stage →
line-edit → diff → confirm → push → record workflow and the local file paths (the
`pipelines/<slug>/` mirror, its `versions/` snapshots, and the staging root). Do not
restate or diverge from it.

## The layer decision (get this right before editing)

| Symptom | Field | Read via | Write via |
|---|---|---|---|
| "who the agent is" / tone | pipeline `persona` | `list_pipelines` | `update_pipeline` |
| a rule that applies in every stage (product intro, behavioural note) | pipeline `instructions` | `list_pipelines` | `update_pipeline` |
| the flow inside one stage | stage `instructions` | `list_pipeline_stages` | `update_stage` |
| when a stage should start | stage `enter_condition` | `list_pipeline_stages` | `update_stage` |

## Non-negotiables

- Change only the lines that must change; keep everything else byte-for-byte.
- Show a before/after diff **and** the expected business impact.
- **Never** call `update_pipeline` / `update_stage` without an explicit "yes, push."
- Pass only the changed fields.
- After the push returns, record it in the version folder — `CHANGES.md` `**Status:**
  PUSHED · <timestamp>` and `manifest.json`. A folder that reads the same before and
  after a push cannot answer "did this ship?", which is the whole point of staging.
