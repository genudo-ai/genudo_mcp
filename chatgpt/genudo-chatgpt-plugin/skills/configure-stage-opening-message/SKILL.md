---
name: configure-stage-opening-message
description: Set up a stage's opening or outreach message in Genudo — sent automatically when an opportunity enters the stage, either AI-generated or a fixed static message, to the contact's phone. Use when the user wants automatic outreach, a welcome message on stage entry, or a proactive first message to new leads entering a stage.
---

# Configure Stage Opening Message

Make a stage reach out on its own when an opportunity enters it.

## Fields (on the stage, via `update_stage` or `create_stage`)

- **`is_opening_message`** — enable/disable the automatic message.
- **`opening_message_type`** — `ai` (generated per lead) or `static` (fixed text).
- **`static_opening_message`** — the exact text, when the type is static.

## Workflow

1. `list_pipeline_stages` to find the target stage and its current opening settings.
2. Decide: AI-generated (personalized, needs good stage instructions to guide tone) or static
   (predictable, same for everyone). For AI, the stage `instructions` shape the message.
3. Confirm — this sends real messages to real phone numbers on stage entry.
4. `update_stage` with the opening fields.

## Cautions

- Outreach fires per opportunity entering the stage — verify the trigger and volume intent.
- Keep static messages channel-appropriate (short for WhatsApp) and on-brand.
