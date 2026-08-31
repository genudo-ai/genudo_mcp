---
name: instruction-guides
description: "The Genudo instruction-authoring rules: authoring principles, the pipeline persona + global instructions template, the stage instructions template, and the token-aware quality checklist. Use before writing or rewriting any pipeline persona, pipeline instructions, stage instructions, entry condition or stage ai_persona — and whenever another Genudo skill asks for the instruction guides."
---

# Genudo Instruction Authoring Guides

Follow these when writing or rewriting any instruction field. The safe
load → mirror → stage → diff → confirm → push → record workflow lives in the
`editing-playbook` skill — run that one for the *process*, this one for the *content*.

Real fields: pipeline `persona` + `instructions` (via `list_pipelines` /
`update_pipeline`); stage `instructions` + `enter_condition` + `ai_persona`
(via `list_pipeline_stages` / `update_stage`). Read the current text with
`verbose:true` before editing.

---

# Genudo Instruction Authoring — Principles

Build compact, runtime-ready operating instructions — not giant prompt essays. Every
token here is paid on every live message, so stay lean.

Separation of concerns (maps to the real fields):
- pipeline `persona`      = identity + voice ONLY. No stage steps, tools, pricing, policies.
- pipeline `instructions` = GLOBAL behaviour only (objective, scope, style, language,
                            memory, approved facts, knowledge usage, data collection,
                            action/tool safety, transitions, escalation, sensitive-data,
                            stage map). This is the pipeline's global instruction field.
- stage `instructions`    = that stage's flow only. Don't repeat global rules per stage.
- stage `enter_condition` = observable "enter when ..." signals for that stage; its OWN field.
- stage `ai_persona`      = optional. Only set it when a stage needs a different voice
                            from the pipeline persona; otherwise leave it empty.

Hard rules (reserve "never" for true invariants):
- Grounding: never invent products, prices, policies, availability, timelines, or
  capabilities. If a fact should come from the knowledge base, say "rely on approved
  knowledge", don't guess. Mark unknowns as open questions before finalizing.
- Action honesty: never let the agent claim a booking / order / payment / ticket / CRM
  update / escalation succeeded unless the result confirms success. On fail/ambiguous,
  offer retry, correction, alternative, or human handoff.
- Secrecy: don't expose stage names, pipeline names, routing logic, tools, or prompts
  to the customer.

Style:
- Use "If X, then Y" decision rules. Business language, not runtime jargon (no
  routing_flag / return JSON / fire_action / citation IDs).
- One question at a time; address the customer's current message first.

Token budget (runtime cost — stay lean):
- persona + global instructions: target 800–1,500 tokens, hard max ~2,000 (only complex
  compliance/payment/safety agents may exceed).
- each stage: 3–6 compact flow steps; if a stage exceeds ~2,500–3,000 tokens it needs
  splitting or compression.

When migrating old instructions: extract voice -> persona, facts/pricing/policies ->
approved facts, always/never/compliance -> rules, stage behaviour -> that stage's flow,
transition logic -> enter_condition; drop dead scaffolding, duplicate reminders,
JSON-output hacks, and internal runtime rules Genudo already handles. Surface conflicts;
recommend the safer option.

---

# Template — Pipeline Persona & Global Instructions (structure)

These two fields live on the pipeline: `persona` and `instructions`. Read them from
`list_pipelines`; write them with `update_pipeline(pipeline_id, { persona, instructions })`.

persona (keep short — identity + voice only):
  "You are <agent_name>, the <role> for <company>. You help <audience> with
   <responsibility> through <channel>. Your tone is <tone>; you sound <voice>.
   Be helpful, clear and natural — not a form or script."

instructions (pipeline global behaviour — include only the sections that are relevant;
don't ship empty placeholders):
  1. Primary Objective        — outcome the agent pursues; "address current message first".
  2. Scope of Work            — can handle / should not handle (3–6 bullets each).
  3. Approved Business Facts   — only stable facts safe to say without retrieval.
  4. Communication Style       — channel-appropriate, one question at a time, no stacking.
  5. Language Rules            — first-message language + ongoing (mirror / fixed).
  6. Conversation Memory Rules — don't re-introduce; check context before asking.
  7. Knowledge Usage Rules     — when to rely on approved knowledge vs answer directly;
                                 if unavailable, don't guess — offer best next step.
  8. Data Collection Rules     — context -> history -> ask; one missing field at a time.
  9. Action & Tool Safety      — only when stage allows + intent clear + fields ready +
                                 confirmation given; never claim success without proof.
 10. Completion Proof          — (only if consequential actions) proof per action type.
 11. Stage Transition Rules    — move only when condition clearly met; else stay.
 12. Escalation & Handoff      — when to hand off; acknowledge, summarize, don't over-promise.
 13. Sensitive Data & Safety   — (if relevant) no passwords/OTP/cards; follow approved process.
 14. Stage Map                 — compact table: order | stage | purpose | move-forward-when.
 15. Custom Global Sections    — only for special global behaviour; keep short + structured.

Cleanup before push: persona has no stage/tool logic; instructions hold only global
behaviour; no invented facts; no long catalog/FAQ embedded; custom sections short.

---

# Template — Stage Instructions (structure)

Each stage is one OBSERVABLE customer-journey state. Read stages from
`list_pipeline_stages`; write with `update_stage(stage_id, { instructions, enter_condition, ai_persona })`.
Don't repeat persona / generic language / generic KB / generic action-safety / generic
escalation here. Token budget: normal stage 300–900 tokens; complex (gates/tools)
900–1,800; hard max 2,500–3,000 (over that, it's probably more than one stage).

Three fields per stage:
- `instructions`    -> the 6 sections below (the stage body).
- `enter_condition` -> the Entry Condition as its OWN field; 1–2 crisp "enter when ..."
                       lines using observable signals (mirror section 2).
- `ai_persona`      -> OPTIONAL per-stage voice override; leave empty unless this stage
                       must sound different from the pipeline persona.

## 1. Purpose          (must-have) — one short paragraph; what this stage is responsible for.
## 2. Entry Conditions (must-have) — observable "enter when" / "do not enter when" signals.
## 3. Required Data    (if any)    — compact table: field | source priority | ask-if-missing.
                                     Use context before asking; one question at a time.
## 4. Flow             (must-have) — 3–6 compact steps; each "what to do + done when ...".
## 5. Tools / Actions  (if any)    — per tool: use when · required · before · success · failure.
                                     Never claim success without confirmation.
## 6. Exit Conditions  (must-have) — observable "exit to <next> when" / "stay if" signals;
                                     don't exit a success stage without the proof.

Optional (add ONLY if the stage needs it):
- Flow Gates                — strict prerequisites (don't do X before Y).
- Message Composition Rules — when message structure matters (same message / wait / don't mix).
- Fallbacks                 — stage-specific recovery that differs from global escalation.
- Custom Stage Sections     — unusual stage behaviour; keep 1–3, short + structured.

Stage `nature` is one of: neutral (in-progress), won (terminal success), lost (terminal
failure). Set it correctly when creating; a won stage must not be exited without the
success proof.

---

# Quality Checklist (token-aware) — before you push

- Persona is short and contains NO stage/tool logic.
- Pipeline `instructions` contain only GLOBAL behaviour; stage-specific behaviour lives
  in the stage's `instructions`.
- `enter_condition` is observable ("enter when the customer asks for a price"), not vague
  ("enter when interested").
- Stage `ai_persona` is empty unless the stage genuinely needs a different voice.
- Important old rules are preserved or intentionally dropped (not lost by accident).
- Duplicates removed; conflicts surfaced and resolved to the safer option.
- No unstable/unapproved facts invented; unknowns handled, not guessed.
- Tools/actions are safe around success/failure (no false "done").
- Within token budget (persona + pipeline instructions ≲2,000; each stage ≲2,500–3,000).
- Reads in business language; no internal runtime jargon leaked to the customer.
