---
name: editing-playbook
description: The step-by-step safe workflow for editing a live Genudo agent's instructions: load the current text, write the local pipeline mirror, stage the edit, show a before/after diff, get explicit confirmation, push, then record the outcome. Use before any update_pipeline or update_stage call that changes persona, instructions, enter_condition or ai_persona — and whenever the edit-pipeline-instructions, author-stages, author-pipeline-brain or migrate-map-to-new skills ask for the playbook.
---

# Genudo Instruction Editing — Workflow

You are editing the LIVE instructions of a Genudo AI agent. There is no
`get_instructions` tool — you read current text from the normal read tools and
write it back with the normal update tools. Follow this exactly. Never push to a
live agent without explicit user confirmation.

## The five editable fields
| Field | Read from | Write with |
|---|---|---|
| pipeline `persona` (identity + voice) | `list_pipelines` | `update_pipeline` |
| pipeline `instructions` (global behaviour) | `list_pipelines` | `update_pipeline` |
| stage `instructions` (stage flow) | `list_pipeline_stages` | `update_stage` |
| stage `enter_condition` (entry condition) | `list_pipeline_stages` | `update_stage` |
| stage `ai_persona` (optional per-stage voice) | `list_pipeline_stages` | `update_stage` |

## Where files go

Staging root is `${ROOT}` — `$GENUDO_WORKDIR` when set, else the current directory.
Every path below is relative to it.

No local filesystem (Claude Desktop / plain web chat)? Skip every file, keep the
before/after inline in the chat — you still owe the user a diff and a confirmation
before push. Everything else in this workflow still applies.

## 0. Load the guides (once per session)
- If `${ROOT}/genudo-guides/` with these guides does NOT exist, call
  `get_instruction_guides` and write each returned guide to
  `${ROOT}/genudo-guides/<slug>.md`. If it already exists, reuse it.
- ALWAYS read the guides before editing.

## 1. Load the current instructions
- Confirm which pipeline (and which stage[s]). Use `list_pipelines` to get the
  `pipeline_id` (it also returns the pipeline `persona` and `instructions`).
- Call `list_pipeline_stages(pipeline_id)`. For each stage it returns `id`, `name`,
  `nature`, `order`, `instructions`, `enter_condition`, and `ai_persona`.

## 2. Write the local mirror
The mirror is a browsable, offline copy of what the pipeline IS — someone opening the
folder in Finder or an editor should understand the agent without the platform open.
Write or refresh it from the data step 1 already returned, plus
`list_actions(pipeline_id)` and `list_variables(pipeline_id)`:

```
${ROOT}/pipelines/
  <pipeline-name-slug>/          # named for the pipeline; identity lives INSIDE
    _persona.md                  # the unit's own fields, "_" prefixed
    _instructions.md
    _actions.yaml
    _variables.yaml
    pipeline.yaml                # id, model, temperature, language, rag, channel…
    stages/
      00_new-lead/               # NN = stage "order", zero-padded, so it sorts right
        _instructions.md
        stage.yaml               # id, name, nature, order, enter_condition, ai_persona
      01_product-consultation/
        _instructions.md
        stage.yaml
    versions/                    # snapshots — see step 3
```

Rules that make the folder readable — follow them exactly:
- **Prose stays prose.** `persona`, `instructions` and `ai_persona` are markdown
  fields: write them to `.md` files verbatim. Never as JSON strings with escaped
  newlines.
- **Config stays structured.** Everything non-prose goes to YAML. Multi-line values
  such as `enter_condition` use a block scalar:
  `enter_condition: |-` then the lines indented — never `"line one\\nline two"`.
- **The `_` prefix marks the unit's OWN fields.** `_persona.md`, `_instructions.md`,
  `_actions.yaml`, `_variables.yaml` are the pipeline's content; `pipeline.yaml`,
  `stages/` and `versions/` are its structure. Same convention at stage level.
- **Identity lives in the file, not the folder name.** The folder is the pipeline name
  slug; `pipeline.yaml` carries `id:`. On every refresh, reconcile BY ID first: if a
  folder's `pipeline.yaml` holds this `pipeline_id` but the pipeline has since been
  renamed, RENAME that folder — never leave two folders for one id.
- Refresh the mirror again after a successful push, so it reflects what is live.

## 3. Stage the edit as a version snapshot
- Create the next unused `${ROOT}/pipelines/<slug>/versions/v<NN>_<YYYY-MM-DD>/`
  (`v01_2026-07-21`, `v02_…`; NN is a running counter for that pipeline, not per day).
- Copy the WHOLE unit into it as it stands right now — `_persona.md`,
  `_instructions.md`, `_actions.yaml`, `_variables.yaml`, `pipeline.yaml` and every
  `stages/NN_<slug>/`. A version folder is a complete snapshot, not a delta: it must
  read as that agent exactly as it behaved at that moment, with nothing to reconstruct.
- For each field you will touch, write the proposed new text beside its "before" file
  with `.after` inserted before the extension:
  - `_persona.md` -> `_persona.after.md`
  - `_instructions.md` -> `_instructions.after.md`
  - `stages/00_new-lead/_instructions.md` -> `stages/00_new-lead/_instructions.after.md`
  - `stages/00_new-lead/stage.yaml` -> `stages/00_new-lead/stage.after.yaml`
    (for `enter_condition` / `ai_persona`)

## 4. Edit line-by-line
- Change ONLY the lines that must change (exact-string edits scoped to those lines).
  Don't rewrite whole files unless the user asked for a full rebuild/migration.
- Follow the rules + templates in `${ROOT}/genudo-guides/` (authoring principles,
  persona/global structure, the stage 6-section structure, the QA checklist).

## 5. Validate — CHANGES.md + manifest.json
In the version folder write both. `CHANGES.md` is what a human reads; `manifest.json`
is the same facts for any script, editor extension or CI that looks at the folder.

`CHANGES.md` STARTS with a status line, so "did this ship?" is answered by opening one
file rather than by diffing against the account:

```markdown
# <Pipeline name> — instruction update v1
**Status:** STAGED

<per edited field: a unified diff (before vs after), then an "Expected impact" note in
plain business language — what the agent will now do or say differently, and any risk.>
```

`manifest.json` beside it:

```json
{
  "schema": 1,
  "pipeline": { "id": 111, "name": "Hazem tech" },
  "state": "staged",
  "pushed_at": null,
  "edits": [
    { "target": "stage.instructions", "stage_id": 756,
      "file": "stages/00_new-lead/_instructions.after.md",
      "state": "staged", "response_ok": null }
  ]
}
```

`target` is one of `pipeline.persona`, `pipeline.instructions`,
`stage.instructions`, `stage.enter_condition`, `stage.ai_persona`.

## 6. Confirm
- Show the diff summary + expected impact and ASK: "Push these updates to the live
  agent?" Do NOT push without an explicit yes.

## 7. Push (only after confirmation), then record it
- Pipeline persona / global instructions — pass ONLY the fields you changed:
  `update_pipeline(pipeline_id, { persona, instructions })`
- Each edited stage — pass ONLY the fields you changed:
  `update_stage(stage_id, { instructions, enter_condition, ai_persona })`
- These fields store markdown verbatim, so headings (##) and line breaks are kept.
- IMMEDIATELY after the calls return, record the outcome — a version folder that looks
  identical before and after a push is the bug this prevents:
  - `CHANGES.md`: `**Status:** PUSHED · <YYYY-MM-DD HH:MM> UTC`
  - `manifest.json`: `state`, `pushed_at`, and each edit's `state` + `response_ok`
  - Partial push (some calls failed)? Set per-edit state and mark the folder
    `PARTIAL` — never one folder-level flag that hides a half-applied change.
- Refresh the live mirror files (step 2) so the pipeline folder matches the account.
- Report exactly what was pushed; leave the version folder as the record.
