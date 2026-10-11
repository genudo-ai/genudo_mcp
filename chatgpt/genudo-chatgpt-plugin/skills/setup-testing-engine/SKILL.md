---
name: setup-testing-engine
description: Install and verify the Genudo agent testing engine on the user's machine (macOS, Linux, or Windows) — Python, the engine repo, its virtual environment, the API token, pipeline mapping, the Archived cleanup stage, and the subscription CLI used as LLM judge. Use before the first automated test run, when run-agent-tests fails on setup, or when the user asks to set up, install, or configure agent testing.
---

# Set Up Testing Engine

Get `genudo-agent-testing-engine` ready to run, then prove it with a dry run. Nothing here
sends a message or creates a lead.

## 1. Check the machine

Run and report versions:

- Python 3.9+: `python3 --version` (Windows: `py -3 --version`)
- Git: `git --version`
- Judge CLI (at least one, optional): `claude --version` (Claude subscription) or
  `codex --version` (ChatGPT subscription). The judge uses the user's AI subscription, never
  an API key. With neither, tests still run with deterministic checks only.

Missing Python or Git → give the platform's install command (`brew install python git`;
`sudo apt-get install -y python3 python3-venv git`; `winget install Python.Python.3.12 Git.Git`)
and wait for the user rather than installing silently.

## 2. Get the engine

Clone it **inside the client's folder** (the folder Claude was opened in). In a client
folder that already connects Genudo with a token — a `.mcp.json` whose `genudo` server sends
`Authorization: Bearer …`, as `loredex workspace` creates — the engine reuses that token
automatically, so each client's runs use that client's account.

```bash
git clone https://github.com/genudo-ai/genudo-agent-testing-engine.git
cd genudo-agent-testing-engine
python3 setup_env.py        # creates .venv, installs requirements, copies .env.example to .env
```

If the folder already exists, `git pull` instead.

## 3. Configure `.env`

- `GENUDO_TOKEN` — **skip this in a client folder whose `.mcp.json` already carries a
  token**; the engine prints `[config] Using the GenuDo token from …/.mcp.json` when it
  reuses it. Only if that token is rejected on a write (401/403 on the first live run), or the
  folder connects through browser sign-in instead, set one here: a bearer token the engine uses for both the MCP endpoint and the REST calls
  that create test opportunities and send test messages. The user creates it in the Genudo
  console: **Developer → API Keys & Tokens → Create token**, with `mcp:use` plus the
  opportunity, conversation, and message write scopes. It is shown once. The token goes in
  `.env` only — never in chat, the suite, or a commit. This is separate from the plugin's
  browser sign-in.
- `GENUDO_PIPELINES` — channel-to-pipeline map, e.g. `messenger=<id>,whatsapp=<id>`. Look the
  IDs up with `list_pipelines`. **Point at a staging or duplicate pipeline first**: runs
  create real opportunities and let the agent fire its real webhooks.
- `GENUDO_ENV` — leave `dev`. `prod` refuses to run without `--allow-prod`.
- `GENUDO_JUDGE` — `claude`, `codex`, or `off`; unset auto-detects.

## 4. Verify prerequisites

1. For each mapped pipeline, `list_pipeline_stages` and confirm a stage named `Archived`
   (or the name in `GENUDO_ARCHIVED_STAGE`) exists with a neutral enter condition that no
   real customer can match. If missing, offer to create it with `create_stage` — confirm
   first. Without it, test leads stay in the live funnel after a run.
2. Check the pipeline's actions (`list_actions`): note any webhook that writes to a real order
   sheet, CRM, or messaging flow, and warn the user that test runs will trigger it (test rows
   carry `TEST R<n>` so they can be filtered and deleted).
3. Dry run — no network calls, no files:

```bash
source .venv/bin/activate          # Windows: .venv\Scripts\activate
python3 src/engine.py list --suite templates/starter-suite.json
python3 src/engine.py run --pipeline messenger --dry-run
python3 tests/test_judge.py         # engine self-check
```

If the client folder is inside a git repo, make sure `genudo-agent-testing-engine/` is not
committed there — its `runs/` hold full customer transcripts (the engine's own `.gitignore`
already excludes `runs/` and `.env`).

Report what is ready, what is missing, and the next step (`generate-test-journeys` for a real
suite, then `run-agent-tests`).
