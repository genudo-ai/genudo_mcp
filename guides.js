// =====================================================================
// Genudo MCP — embedded "tool guiding" payloads and local (non-proxied)
// handlers. This is what turns the connector from "exposes tools" into
// "teaches the agent how to use them well".
//
// Everything here is served CLIENT-SIDE by index.js:
//   - get_instruction_guides  -> INSTRUCTION_GUIDES (authoring rules + templates)
//   - get_editing_playbook    -> EDITING_PLAYBOOK  (safe load->edit->diff->confirm->push)
//   - prompts/list + prompts/get -> PROMPTS + getPromptMessages()
//
// IMPORTANT: all tool/field names below are the REAL Genudo MCP surface,
// verified live (2026-07-09, 29-tool backend). There is NO get_instructions tool; the
// current instruction text is read from existing tools:
//   - list_pipelines        -> pipeline `persona`, `instructions`
//   - list_pipeline_stages  -> per stage `id`, `name`, `nature`, `order`,
//                              `instructions`, `enter_condition`, `ai_persona`
// Writes go through the existing tools:
//   - update_pipeline(pipeline_id, { persona, instructions })
//   - update_stage(stage_id, { instructions, enter_condition, ai_persona })
// =====================================================================

// The five editable instruction fields on a Genudo agent:
//   pipeline.persona        (identity + voice)         read: list_pipelines        write: update_pipeline
//   pipeline.instructions   (global behaviour)         read: list_pipelines        write: update_pipeline
//   stage.instructions      (stage flow)               read: list_pipeline_stages  write: update_stage
//   stage.enter_condition   (stage entry condition)    read: list_pipeline_stages  write: update_stage
//   stage.ai_persona        (optional stage voice)     read: list_pipeline_stages  write: update_stage

const WORKFLOW = `# Genudo Instruction Editing — Workflow

You are editing the LIVE instructions of a Genudo AI agent. There is no
\`get_instructions\` tool — you read current text from the normal read tools and
write it back with the normal update tools. Follow this exactly. Never push to a
live agent without explicit user confirmation.

## The five editable fields
| Field | Read from | Write with |
|---|---|---|
| pipeline \`persona\` (identity + voice) | \`list_pipelines\` | \`update_pipeline\` |
| pipeline \`instructions\` (global behaviour) | \`list_pipelines\` | \`update_pipeline\` |
| stage \`instructions\` (stage flow) | \`list_pipeline_stages\` | \`update_stage\` |
| stage \`enter_condition\` (entry condition) | \`list_pipeline_stages\` | \`update_stage\` |
| stage \`ai_persona\` (optional per-stage voice) | \`list_pipeline_stages\` | \`update_stage\` |

## 0. Load the guides (once per session)
- If a local \`./genudo-guides/\` folder with these guides does NOT exist,
  call \`get_instruction_guides\` and write each returned guide to
  \`./genudo-guides/<slug>.md\`. If it already exists, reuse it.
- ALWAYS read the guides before editing.

## 1. Load the current instructions
- Confirm which pipeline (and which stage[s]). Use \`list_pipelines\` to get the
  \`pipeline_id\` (it also returns the pipeline \`persona\` and \`instructions\`).
- Call \`list_pipeline_stages(pipeline_id)\`. For each stage it returns \`id\`, \`name\`,
  \`nature\`, \`order\`, \`instructions\`, \`enter_condition\`, and \`ai_persona\`.

## 2. Stage the editable files (versioned + dated)
- Create \`./instructions-updates/<pipeline-name-slug>_<YYYY-MM-DD>/v<N>/\` (next
  unused version for that pipeline+date).
- Write ONE markdown file per field you will touch, with the CURRENT value verbatim
  first (this is the "before"). Stages have no slug — slugify the stage \`name\` and
  prefix with the stage \`id\` so files stay unique:
  - \`persona.md\`                              (pipeline persona)
  - \`instructions.md\`                         (pipeline global instructions)
  - \`stage-<id>-<name-slug>__instructions.md\`
  - \`stage-<id>-<name-slug>__enter_condition.md\`
  - \`stage-<id>-<name-slug>__ai_persona.md\`   (only if editing the stage's voice)
- No local filesystem (Claude Desktop / web)? Skip the files, keep the before/after
  inline in the chat — you still owe the user a diff and a confirmation before push.

## 3. Edit line-by-line
- Change ONLY the lines that must change (exact-string edits scoped to those lines).
  Don't rewrite whole files unless the user asked for a full rebuild/migration.
- Follow the rules + templates in \`./genudo-guides/\` (authoring principles,
  persona/global structure, the stage 6-section structure, the QA checklist).

## 4. Validate (before -> after + impact)
- Produce, per edited field: a unified diff (before vs after) and an "Expected
  impact" note in plain business language — what the agent will now do/say
  differently, and any risk. Write it to \`CHANGES.md\` in the version folder (or
  inline if there is no filesystem).

## 5. Confirm
- Show the diff summary + expected impact and ASK: "Push these updates to the live
  agent?" Do NOT push without an explicit yes.

## 6. Push (only after confirmation)
- Pipeline persona / global instructions — pass ONLY the fields you changed:
  \`update_pipeline(pipeline_id, { persona, instructions })\`
- Each edited stage — pass ONLY the fields you changed:
  \`update_stage(stage_id, { instructions, enter_condition, ai_persona })\`
- These fields store markdown verbatim, so headings (##) and line breaks are kept.
- Report exactly what was pushed; leave the version folder as the record.`;

const AUTHORING = `# Genudo Instruction Authoring — Principles

Build compact, runtime-ready operating instructions — not giant prompt essays. Every
token here is paid on every live message, so stay lean.

Separation of concerns (maps to the real fields):
- pipeline \`persona\`      = identity + voice ONLY. No stage steps, tools, pricing, policies.
- pipeline \`instructions\` = GLOBAL behaviour only (objective, scope, style, language,
                            memory, approved facts, knowledge usage, data collection,
                            action/tool safety, transitions, escalation, sensitive-data,
                            stage map). This is the pipeline's global instruction field.
- stage \`instructions\`    = that stage's flow only. Don't repeat global rules per stage.
- stage \`enter_condition\` = observable "enter when ..." signals for that stage; its OWN field.
- stage \`ai_persona\`      = optional. Only set it when a stage needs a different voice
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
recommend the safer option.`;

const PERSONA_GLOBAL = `# Template — Pipeline Persona & Global Instructions (structure)

These two fields live on the pipeline: \`persona\` and \`instructions\`. Read them from
\`list_pipelines\`; write them with \`update_pipeline(pipeline_id, { persona, instructions })\`.

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
behaviour; no invented facts; no long catalog/FAQ embedded; custom sections short.`;

const STAGE_TEMPLATE = `# Template — Stage Instructions (structure)

Each stage is one OBSERVABLE customer-journey state. Read stages from
\`list_pipeline_stages\`; write with \`update_stage(stage_id, { instructions, enter_condition, ai_persona })\`.
Don't repeat persona / generic language / generic KB / generic action-safety / generic
escalation here. Token budget: normal stage 300–900 tokens; complex (gates/tools)
900–1,800; hard max 2,500–3,000 (over that, it's probably more than one stage).

Three fields per stage:
- \`instructions\`    -> the 6 sections below (the stage body).
- \`enter_condition\` -> the Entry Condition as its OWN field; 1–2 crisp "enter when ..."
                       lines using observable signals (mirror section 2).
- \`ai_persona\`      -> OPTIONAL per-stage voice override; leave empty unless this stage
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

Stage \`nature\` is one of: neutral (in-progress), won (terminal success), lost (terminal
failure). Set it correctly when creating; a won stage must not be exited without the
success proof.`;

const QA = `# Quality Checklist (token-aware) — before you push

- Persona is short and contains NO stage/tool logic.
- Pipeline \`instructions\` contain only GLOBAL behaviour; stage-specific behaviour lives
  in the stage's \`instructions\`.
- \`enter_condition\` is observable ("enter when the customer asks for a price"), not vague
  ("enter when interested").
- Stage \`ai_persona\` is empty unless the stage genuinely needs a different voice.
- Important old rules are preserved or intentionally dropped (not lost by accident).
- Duplicates removed; conflicts surfaced and resolved to the safer option.
- No unstable/unapproved facts invented; unknowns handled, not guessed.
- Tools/actions are safe around success/failure (no false "done").
- Within token budget (persona + pipeline instructions ≲2,000; each stage ≲2,500–3,000).
- Reads in business language; no internal runtime jargon leaked to the customer.`;

const INSTRUCTION_GUIDES = [
  { slug: '00_workflow', title: 'Instruction Editing Workflow', content: WORKFLOW },
  { slug: '01_authoring_principles', title: 'Authoring Principles', content: AUTHORING },
  { slug: '02_persona_global_template', title: 'Persona & Global Instructions Template', content: PERSONA_GLOBAL },
  { slug: '03_stage_template', title: 'Stage Instructions Template', content: STAGE_TEMPLATE },
  { slug: '04_quality_checklist', title: 'Quality Checklist (token-aware)', content: QA },
];

// get_editing_playbook returns the workflow doc on its own (quick reference).
const EDITING_PLAYBOOK = WORKFLOW;

// ---------------------------------------------------------------------
// Local tool definitions (merged into the proxied tools/list result).
// ---------------------------------------------------------------------
const LOCAL_TOOLS = [
  {
    name: 'get_instruction_guides',
    description:
      'Return the Genudo instruction-authoring guides (workflow, authoring principles, ' +
      'persona/global + stage templates, token-aware QA checklist). Call this BEFORE editing ' +
      'any pipeline persona/instructions or stage instructions/enter_condition/ai_persona. ' +
      'Static, client-side — no account data.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    name: 'get_editing_playbook',
    description:
      'Return the step-by-step safe editing workflow for live Genudo agent instructions ' +
      '(load current text with list_pipelines/list_pipeline_stages -> stage versioned files -> ' +
      'line-edit -> diff + expected impact -> confirm -> push with update_pipeline/update_stage). ' +
      'Static, client-side — no account data.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
  },
];

const LOCAL_TOOL_NAMES = new Set(LOCAL_TOOLS.map((t) => t.name));

function handleLocalToolCall(name) {
  if (name === 'get_instruction_guides') {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              note:
                'Write each guide to ./genudo-guides/<slug>.md (once per session) and read ' +
                'them before editing. Real fields: pipeline persona+instructions (via ' +
                'list_pipelines/update_pipeline); stage instructions+enter_condition+ai_persona ' +
                '(via list_pipeline_stages/update_stage).',
              guides: INSTRUCTION_GUIDES,
            },
            null,
            2
          ),
        },
      ],
    };
  }
  if (name === 'get_editing_playbook') {
    return { content: [{ type: 'text', text: EDITING_PLAYBOOK }] };
  }
  return null;
}

// ---------------------------------------------------------------------
// MCP Prompts (portable slash-commands). Handled locally.
// ---------------------------------------------------------------------
const PROMPTS = [
  {
    name: 'edit_instructions',
    description:
      "Safely edit a live Genudo agent's persona, global instructions, or a stage's " +
      'instructions / entry condition — load current text, diff, confirm, then push.',
    arguments: [
      { name: 'pipeline', description: 'Pipeline name or id (optional; will list if omitted)', required: false },
    ],
  },
  {
    name: 'build_pipeline',
    description: 'Create a new Genudo pipeline end to end (options -> pipeline -> stages -> variables -> actions).',
    arguments: [
      { name: 'business', description: 'One or two sentences describing the business and goal (optional)', required: false },
    ],
  },
  {
    name: 'audit_pipeline',
    description: 'Read-only audit of a Genudo pipeline: structure, funnel health, instruction quality, and cost.',
    arguments: [
      { name: 'pipeline', description: 'Pipeline name or id (optional; will list if omitted)', required: false },
    ],
  },
];

const PROMPT_NAMES = new Set(PROMPTS.map((p) => p.name));

function userMessage(text) {
  return { role: 'user', content: { type: 'text', text } };
}

function getPromptMessages(name, args) {
  const a = args || {};
  if (name === 'edit_instructions') {
    const target = a.pipeline ? `Target pipeline: ${a.pipeline}.` : 'Ask me which pipeline (and stage) to edit.';
    return {
      description: 'Safe live-instruction edit for a Genudo agent',
      messages: [
        userMessage(
          `Edit a live Genudo agent's instructions. ${target}\n\n` +
            '1. Call get_instruction_guides and get_editing_playbook, then read them.\n' +
            '2. Load current text: list_pipelines gives the pipeline persona + instructions; ' +
            'list_pipeline_stages(pipeline_id) gives each stage id, name, instructions, ' +
            'enter_condition, ai_persona.\n' +
            '3. Stage versioned "before" files (or keep before/after inline if there is no filesystem).\n' +
            '4. Change only the lines that must change, following the guides.\n' +
            '5. Show me a before/after diff plus the expected business impact.\n' +
            '6. Only after I explicitly say yes, push with update_pipeline(pipeline_id, {persona, instructions}) ' +
            'and/or update_stage(stage_id, {instructions, enter_condition, ai_persona}), changed fields only.\n' +
            'Never push without my confirmation.'
        ),
      ],
    };
  }
  if (name === 'build_pipeline') {
    const biz = a.business ? `Business context: ${a.business}.` : 'First ask me for a 1–2 sentence business description.';
    return {
      description: 'Create a new Genudo pipeline end to end',
      messages: [
        userMessage(
          `Build a new Genudo pipeline. ${biz}\n\n` +
            '1. Call get_instruction_guides for the authoring rules + templates.\n' +
            '2. Call start_pipeline_journey, then get_pipeline_options for valid ' +
            'agent_type_id / ai_model_id / language_id / dialect_id / channel_id.\n' +
            '3. Draft the persona + global instructions with me (offer to write them).\n' +
            '4. create_pipeline (if is_model_routing_enabled=true, model_pool needs exactly 4 tiers: ' +
            'router, simple, moderate, complex).\n' +
            '5. create_stage for each funnel stage (nature: neutral | won | lost; set order).\n' +
            '6. create_variable for runtime fields (use type from_system for values like ' +
            'opportunity.contact_email — actions cannot use raw {{opportunity.*}} placeholders).\n' +
            '7. create_action for automations, referencing variables by {{name}}.\n' +
            'Confirm with me before each write.'
        ),
      ],
    };
  }
  if (name === 'audit_pipeline') {
    const target = a.pipeline ? `Target pipeline: ${a.pipeline}.` : 'Ask me which pipeline, or audit them all.';
    return {
      description: 'Read-only audit of a Genudo pipeline',
      messages: [
        userMessage(
          `Audit a Genudo pipeline. Read-only — do not write anything. ${target}\n\n` +
            '1. list_pipelines (structure + persona + instructions).\n' +
            '2. list_pipeline_stages (stage flow, enter_condition, instructions).\n' +
            '3. list_variables.\n' +
            '4. list_opportunities + list_contacts + list_messages for live activity.\n' +
            '5. get_account_summary + get_ai_performance for cost and performance.\n' +
            'Then call get_instruction_guides and grade the persona/instructions/stages against the ' +
            'checklist. Report: structure, funnel health, instruction-quality issues, and the top ' +
            'fixes ranked by impact. Do not change anything.'
        ),
      ],
    };
  }
  return null;
}

module.exports = {
  INSTRUCTION_GUIDES,
  EDITING_PLAYBOOK,
  LOCAL_TOOLS,
  LOCAL_TOOL_NAMES,
  handleLocalToolCall,
  PROMPTS,
  PROMPT_NAMES,
  getPromptMessages,
};
