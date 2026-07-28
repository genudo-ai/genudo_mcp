# Connect Genudo to Claude — Every Option, Weighted

**Genudo is the platform to build AI agents for any communication or sequence-based channel** —
WhatsApp, Messenger, Instagram, LinkedIn, email, and more. Pipeline-aware agents with
integration capabilities and company-knowledge access, managed from one platform, one inbox,
and one analytics dashboard.

This guide shows **every way to connect Claude (and other AI clients) to your Genudo account**,
what each one gives you, and which to choose.

---

## TL;DR — pick your path

| Option | What you get | Value | Best for |
|---|---|:--:|---|
| **① Plugin** (all-in-one) | Tools **+ know-how + agents** | ★★★★★ | Almost everyone. The full experience. |
| **② Remote connector** (URL + OAuth) | The 29 tools, no token, every surface | ★★★★☆ | Tools only, zero setup — including claude.ai web. |
| **③ stdio bridge** (`genudo-mcp-client`) | Tools **+ guidance preamble + prompts + slimming** | ★★★☆☆ | Self-hosted, token-based, or offline-pinned setups. |
| **④ Desktop extension** (`.mcpb`) | The stdio bridge, one-click on Claude Desktop | ★★☆☆☆ | Desktop users who prefer a token to a browser login. |
| **⑤ Other MCP clients** (Codex, Cursor, Windsurf) | Either connector via config | ★★☆☆☆ | Teams not on Claude. |

**Short version: install the Plugin.** It contains the connector *plus* the operating expertise
and the autonomous agents. Everything below explains why.

---

## What "value" means — the building blocks

Genudo's Claude integration is layered. Each layer adds capability on top of the last:

| Layer | Role | Analogy |
|---|---|---|
| **Connector** (MCP tools) | The 29 actions — read pipelines, create stages, run webhooks, manage knowledge tables, schedule follow-ups, pull conversations, report. | The **hands** |
| **Prompts** (slash-commands) | Named launchers: `/edit_instructions`, `/build_pipeline`, `/audit_pipeline`. | The **shortcuts** |
| **Skills** (22) | Task know-how Claude auto-invokes — how to interview for a pipeline, safely edit a live agent, wire an automation, debug a conversation. | The **playbooks / steering** |
| **Agents** (6) | Specialists that run multi-step jobs autonomously (architect, doctor, automation-engineer, analyst, kb-librarian, migrator). | The **autopilot / orchestration** |

- **Connector alone** = capable hands, but *you* supply the strategy every time.
- **+ Skills** = Claude already knows the right procedure and guardrails for each task.
- **+ Agents** = Claude runs the whole job end-to-end in Cowork/Code.
- **The Plugin bundles all four.**

> **Two ways to get the connector.** The **hosted server** (`https://api.genudo.ai/mcp`,
> Streamable HTTP + OAuth) needs no token, no Node and no local process — it works in Claude
> web, desktop and Code, and it is what the plugin bundles. The **stdio bridge**
> (`genudo-mcp-client` on npm) runs locally with a token and adds a guidance preamble, the
> three prompts, response slimming, and two guide tools (`get_instruction_guides`,
> `get_editing_playbook`); use it for self-hosted instances or token-based setups. The plugin
> ships that same guidance as the `instruction-guides` and `editing-playbook` skills, so it
> does not depend on which connector you use. The Plugin is what adds the 22 skills and
> 6 agents.

---

## ① Plugin — everything in one install ★★★★★

The complete Genudo workforce: connector + 22 skills + 6 agents + prompts. Claude auto-invokes
the right skill, agents handle heavy multi-step work, and every write to your account is shown
as a diff and confirmed first.

**Get it (three ways):**

**A. By command — Claude Code** *(recommended; auto-updates)*
```
/plugin marketplace add genudo-ai/claude-plugin
/plugin install genudo@genudo-ai
```

**B. By marketplace — claude.ai / Desktop / Cowork**
Customize → Personal plugins → **+** → **Add marketplace** → `genudo-ai/claude-plugin` → **Add** →
Browse plugins → **Install**.

**C. By file — upload the zip**
Customize → Personal plugins → **+** → **Upload plugin** → drop `genudo-plugin.zip` → **Upload**.

**There is no token to enter.** The bundled connector is the hosted Genudo server and uses
OAuth — Claude opens your browser, you approve access, done.

**D. Claude Desktop app**
Settings → **Plugins** → **Add** → **Upload plugin** → drop `genudo-plugin.zip`. The connector
comes with it and signs in through the browser; no separate extension needed. (Before OAuth,
Desktop's plugin upload couldn't collect a token — that's why a second file used to be
required. It no longer is.)

**Runs on:** Claude Code, Claude Desktop, claude.ai, Cowork. (Skills work in all; **agents run
in Cowork & Code**; the connector, being remote, works everywhere — including web chat.)

**Coming:** the same plugin, publicly searchable in Claude's **Browse plugins** directory
(submitted, pending review).

### Plugin global, connector per project — agencies & multi-account users

Working across several Genudo accounts from one machine? You want the **skills and agents
everywhere**, but a **different Genudo account in each client's project**. The bundled
connector in ① is one global server — the opposite. Install the **`genudo-no-connector`**
plugin instead: identical 22 skills and 6 agents, **no bundled connector**, nothing to strip
out.

**1. Plugin — global, once:**
```
/plugin marketplace add genudo-ai/claude-plugin
/plugin install genudo-no-connector@genudo-ai
```

**2. Connector — from inside each client's project directory:**
```
claude mcp add --transport http genudo https://api.genudo.ai/mcp --scope project
```
Each project signs in to its own Genudo account through the browser, so there are no tokens to
create, rotate or keep apart. `--scope project` writes a shared `.mcp.json` that travels with
the client's repo and contains **no secret** — just the URL; every teammate signs in as
themselves. Use `--scope local` to keep the server private to you.

Prefer a token per client instead (CI, shared machines)? Use the stdio bridge from option ③
with `--scope local --env GENUDO_TOKEN=CLIENT_TOKEN`.

Verify from inside the project: `claude mcp list`. The server name `genudo` is free —
`genudo-no-connector` registers no MCP server, so there's no collision with the per-project one.

| | Scope | Auth |
|---|---|---|
| Skills + agents (`genudo-no-connector`) | user / global — every project | none |
| Connector (`genudo`) | project or local — that directory only | browser sign-in, per account |

---

## ② Remote connector (URL + OAuth) — tools everywhere, no setup ★★★★☆

The hosted Genudo MCP server: **29 tools** over Streamable HTTP, authenticated with OAuth 2.1
(PKCE + dynamic client registration). No token, no Node, no local process — and because it is
remote, it reaches **claude.ai web**, which no local bridge can. No skills or agents.

**Claude Code — one command:**
```
claude mcp add --transport http genudo https://api.genudo.ai/mcp
```

**claude.ai / Claude Desktop:** Settings → **Connectors** → *Add custom connector* → URL
`https://api.genudo.ai/mcp`. Adding custom connectors is a paid-plan feature.

**Self-hosted:** point at `https://<your-instance>/mcp`.

**Runs on:** everywhere Claude supports custom connectors — web, Desktop, Code, Cowork.

**Best for:** anyone who wants tools with the least possible setup. Add the Plugin on top when
you want Claude to *know how* to build and fix pipelines.

---

## ③ stdio bridge (`genudo-mcp-client`) — tools + guidance, run locally ★★★☆☆

The published npm bridge: the same **29 tools**, plus a guidance preamble, the two guide tools,
3 prompts, and response slimming that keeps long personas out of your context. Runs locally
over stdio and authenticates with a **token** rather than a browser login.

**Claude Code — one command:**
```
claude mcp add --env GENUDO_TOKEN=YOUR_TOKEN --transport stdio genudo -- npx -y genudo-mcp-client@2.5.0
```

**Any MCP client — JSON config:**
```json
{
  "mcpServers": {
    "genudo": {
      "command": "npx",
      "args": ["-y", "genudo-mcp-client@2.5.0"],
      "env": { "GENUDO_TOKEN": "your_token_here" }
    }
  }
}
```

**Runs on:** Claude Code, Claude Desktop (local stdio). Needs Node.js 18+.

**Best for:** self-hosted instances, token-based/CI setups, a pinned offline version, or when
you specifically want the guidance preamble, prompts and response slimming the hosted server
does not yet serve. Otherwise prefer ②.

---

## ④ Desktop extension (`.mcpb`) — one-click stdio bridge on Desktop ★★☆☆☆

The stdio bridge from ③, packaged as a Claude Desktop extension (with the Genudo logo).
Double-click `genudo.mcpb` → enter token → done. No terminal, no Node config.

**Runs on:** Claude Desktop (macOS/Windows). Tools only — no skills/agents.

**Coming:** listed in Claude's **Browse extensions** directory for one-click discovery.

---

## ⑤ Other MCP clients — Codex, Cursor, Windsurf ★★☆☆☆

Both connectors work in any MCP-compatible client. Point it at
`https://api.genudo.ai/mcp` (Streamable HTTP + OAuth), or add the stdio JSON block from ③.
ChatGPT/Codex use `url` + `auth` rather than `type` — Genudo ships a
[ChatGPT & Codex plugin](chatgpt/README.md) with the connector and 28 skills already wired.
You get the 29 tools; Claude skills/agents are Claude-specific.

**Best for:** teams standardized on a non-Claude AI client who still want Genudo tool access.

---

## Where each option runs

| | Web chat | Mobile | Desktop | Cowork | Claude Code |
|---|:--:|:--:|:--:|:--:|:--:|
| Plugin — **skills** | ✅ | limited | ✅ | ✅ | ✅ |
| Plugin — **agents** | — | — | — | ✅ | ✅ |
| Connector — **remote** (URL + OAuth) | ✅ | limited | ✅ | ✅ | ✅ |
| Connector — **stdio bridge** (npx / `.mcpb`) | — | — | ✅ | ✅ | ✅ |

The remote connector is what put tools in **web chat** — that row was empty before OAuth
shipped. Mobile depends on whether the client supports custom connectors there.

---

## What the connector can do (29 tools)

- **Analytics** — account summary, messaging stats, AI performance & cost.
- **Discover** — list pipelines, stages, actions, variables, contacts, opportunities, messages, knowledge tables; search knowledge; follow-up configs; pipeline options.
- **Build** — guided journey, create pipeline / stage / variable / action / follow-up / knowledge table; upsert knowledge rows.
- **Update** — pipeline, stage, action, variable, follow-up, opportunities (bulk).
- **Delete** — knowledge rows (by stable id).

The tool list **grows automatically** as Genudo's backend adds capabilities (e.g. follow-up
sequences, knowledge base) — no reinstall needed.

---

## Install cheat-sheet

| Goal | Command / action |
|---|---|
| Full experience (Code) | `/plugin marketplace add genudo-ai/claude-plugin` → `/plugin install genudo@genudo-ai` |
| Full experience (claude.ai) | Add marketplace `genudo-ai/claude-plugin` → Browse plugins → Install |
| Full experience (offline file) | Upload `genudo-plugin.zip` |
| **Tools only, no token (Code)** | `claude mcp add --transport http genudo https://api.genudo.ai/mcp` — sign in via browser |
| **Tools only, no token (web/desktop)** | Settings → **Connectors** → *Add custom connector* → `https://api.genudo.ai/mcp` |
| Tools only, token-based (Code) | `claude mcp add --env GENUDO_TOKEN=TOKEN --transport stdio genudo -- npx -y genudo-mcp-client@2.5.0` |
| Tools only (Desktop, one-click) | Install `genudo.mcpb` |
| Tools only (other client) | Point it at `https://api.genudo.ai/mcp`, or add the stdio JSON block from option ③ |
| Desktop app (full experience) | Upload `genudo-plugin.zip` — the connector comes with it |
| Global skills, own connection per client project | `/plugin install genudo-no-connector@genudo-ai`, then `claude mcp add --transport http genudo https://api.genudo.ai/mcp --scope project` in each project |
| Get a token | Only needed for the stdio bridge — see [Get a token](#get-a-token) |

---

## Get a token

1. Log in at [app.genudo.ai](https://app.genudo.ai).
2. Sidebar → **Developer** → **API Keys & Tokens**.
3. Click **Create token**.
4. Name it (e.g. `claude-mcp`).
5. Under **Scopes**, scroll the list and check **`mcp:use`** (Access MCP server — Streamable HTTP + JSON-RPC
   tool calls).
6. Pick an **Expiry** — 30 days, 90 days, 1 year, or No Expiry.
7. Click **Create token** and copy it immediately — **the full token is shown only once**;
   Genudo keeps only a hashed copy. Lost it? Revoke and create a new one.

---

## Resources

- **npm package:** https://www.npmjs.com/package/genudo-mcp-client
- **GitHub (source + marketplace):** https://github.com/genudo-ai/genudo_mcp
- **MCP Registry:** `io.github.genudo-ai/genudo_mcp`
- **Genudo platform:** https://genudo.ai
- **API base URL:** `https://api.genudo.ai`
- **Privacy policy:** https://genudo.ai/legal/privacy-policy
- **Terms:** https://genudo.ai/legal/terms-of-service
- **Support:** help@genudo.ai

### Learn more about the tech
- Model Context Protocol: https://modelcontextprotocol.io
- Claude plugins: https://code.claude.com/docs/en/plugins
- Claude connectors: https://support.claude.com/en/articles/11176164

---

## Quick troubleshooting

- **"Tool not found" / stale behaviour** → you're on an old cached build. Reinstall the Plugin,
  or clear the npx cache: `rm -rf ~/.npm/_npx`. Use the latest connector (**2.2.0**:
  Bearer-only auth for the migrated backend, 29-tool guidance, bounded auth retries).
- **401 / not connected** → token wrong or expired. Remove and re-add with a fresh token.
- **Agents greyed out** → agents run only in **Cowork & Code**, not plain web/desktop chat.
- **Nothing works on web/mobile** → expected today; those need the remote OAuth connector (⑤).

---

*Genudo — one platform, one inbox, one analytics dashboard. Build your AI workforce for any channel.*
