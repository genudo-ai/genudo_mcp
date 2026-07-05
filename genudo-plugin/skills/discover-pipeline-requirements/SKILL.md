---
name: discover-pipeline-requirements
description: Interview the user to gather everything needed to build a new Genudo pipeline (an AI sales/support agent) — business objective, channel, products/services, conversation flow, stages, per-stage data to collect, and automations. Use when the user wants to create, build, set up, or design a new pipeline, funnel, sales agent, WhatsApp/Messenger/Instagram bot, or onboarding flow and the requirements are not yet defined. Produces a local spec file and does not write to the account.
---

# Discover Pipeline Requirements

Turn a vague "I want a WhatsApp agent" into a complete, buildable spec. Ask, don't assume.
This skill only gathers and writes a local spec — it never touches the account.

## Interview (one topic at a time, conversational)

Ask in this order; skip anything the user already gave. Reflect answers back briefly.

1. **Business objective** — what is this pipeline for, and what counts as a win?
   *e.g. "Onboard WhatsApp leads, recommend a course, register interested leads to a Google Sheet."*
2. **Channel** — WhatsApp, Messenger, Instagram, or LinkedIn? (Confirm valid options with
   `get_pipeline_options`.)
3. **Products / services** — what are they selling, and the key details (names, who it's for,
   prices if stable, differentiators)? This makes the agent product-aware.
4. **Conversation flow** — walk the journey: how should it welcome, then qualify, then
   propose, then close? What happens first, what comes next?
5. **Stages** — from the flow, propose stage names (1–2 words, use-case relevant, e.g.
   `Welcome`, `Qualify`, `Recommend`, `Register`). Confirm the set and order.
6. **Required data per stage** — what must be collected, especially in the closing/registration
   stage (e.g. name, phone, course).
7. **Automations** — which stage should fire what, and what data goes to which tool
   (Zapier / Make / n8n / Google Sheets / CRM)?

Then surface **open questions, assumptions, and conflicts** — don't guess business facts.

## Output

Write the brief to `./genudo-build/<pipeline-slug>/spec.md` with sections matching the 7 topics
above, plus `open-questions.md`. Slugify the objective into a short pipeline name.
(No filesystem? Keep the spec inline in the conversation.)

Confirm the spec proposal with the user before anyone moves on to authoring. When approved,
hand off to `author-pipeline-brain`.
