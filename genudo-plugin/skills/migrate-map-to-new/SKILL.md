---
name: migrate-map-to-new
description: Translate a captured legacy pipeline spec into the current Genudo authoring approach — new persona, global instructions, and stage set written against today's templates — plus a mapping report of what moved where, what was dropped, and what needs a decision. Use after migrate-intake-legacy, or when the user already has old pipeline text captured and wants it converted. Produces local files only; applying goes through provision-pipeline or the edit skills.
---

# Migrate: Map Legacy to New Approach

Re-author the legacy spec against the current templates. The current approach IS the spec:
`get_instruction_guides` (templates + rules) plus the `author-pipeline-brain` and
`author-stages` rubrics. Never paste legacy text into new fields unchanged.

## Steps

1. Call `get_instruction_guides`; load `./genudo-migrate/<pipeline-slug>/legacy-spec.md`.
2. **Persona + global instructions** — re-author per `author-pipeline-brain`: identity and
   voice into the persona; cross-stage behaviour, grounding, style, and escalation into the
   global instructions. Old stage-level text that is really global (repeated safety lines,
   generic tone rules) moves UP into the global layer — and is deleted from every stage.
3. **Stages** — re-author per `author-stages`. Map old stages onto a clean journey: split
   stages that mixed two jobs, merge duplicates, and express entry as observable
   `enter_condition` signals. Per stage: 3–6 compact flow steps, required data, exit, nature,
   order, short name. Old "when to move" prose becomes the NEXT stage's `enter_condition`.
4. **Automations & follow-ups** — carry actions, variables, and follow-up schedules over into
   the new stage layout; where a stage split or merged, decide which new stage owns each.
5. **Business facts** — every fact from the legacy spec's facts list must appear in the new
   spec (global instructions, a stage flow, or a knowledge table via `manage-knowledge-base`).
   Tick them off one by one.

## Output

- `./genudo-migrate/<pipeline-slug>/new-spec.md` — the full new-approach pipeline, in the same
  shape `provision-pipeline` consumes.
- `./genudo-migrate/<pipeline-slug>/mapping.md` — a table: legacy item → destination
  (kept / moved to X / merged into Y / **dropped — why**) plus open questions for the user.

Review both with the user; every drop needs an explicit yes. Then apply: `provision-pipeline`
(new pipeline, default) or `edit-pipeline-instructions` + `update_stage` (in place, only when
the user names the target). No account writes here.
