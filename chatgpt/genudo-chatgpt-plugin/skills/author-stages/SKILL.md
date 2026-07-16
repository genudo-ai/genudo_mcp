---
name: author-stages
description: Design the stages of a Genudo pipeline — for each stage its short name, nature (neutral/won/lost), entry condition (when to enter), the in-stage conversation flow instructions, the data to collect, and any opening message. Use after the persona and global instructions are drafted, or when the user asks to design, lay out, or add the pipeline's stages or funnel steps. Stages the work as local files for review before any push.
---

# Author Stages

Design each stage as one observable step in the customer journey. Don't repeat global rules
(persona, generic style, generic safety) inside a stage — those live in the pipeline brain.

## Before writing

Call `get_instruction_guides` and follow the stage template (the 6-section structure + the
token budget). Read the spec + the drafted persona/instructions from `./genudo-build/<pipeline-slug>/`.

## Per stage, write three fields

- **`enter_condition`** — observable "enter when…" signals (1–2 lines). Its own field.
- **`instructions`** — the in-stage flow: 3–6 compact steps, each "what to do + done when…".
  If an action/tool belongs to this stage, describe **how it relates to the flow** — e.g.
  "collect name, phone, and course; once all three are present, fire the registration action;
  on success, tell the customer someone will reach out." Cover required data and exit.
- **`ai_persona`** *(optional)* — only if this stage must sound different from the pipeline persona.

Set **`nature`** (neutral | won | lost), **`order`**, and a short **`name`** (1–2 words). Decide
the **opening message** (see `configure-stage-opening-message`) if the stage should reach out on entry.

## Output

Stage per-stage files under `./genudo-build/<pipeline-slug>/stages/<order>-<name>/`
(`enter_condition.md`, `instructions.md`, optional `ai_persona.md`). Review the full set
against the QA checklist, get approval, then hand off to `provision-pipeline`. No account writes here.
