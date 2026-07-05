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
| **① Plugin** (all-in-one) | Tools **+ know-how + agents + slash-commands** | ★★★★★ | Almost everyone. The full experience. |
| **② Connector** (MCP) | Tools **+ built-in guidance + prompts** — you drive | ★★★☆☆ | Devs / power users who prompt it themselves. |
| **③ Desktop extension** (`.mcpb`) | The connector, one-click on Claude Desktop | ★★★☆☆ | Non-technical desktop users who just want tools. |
| **④ Other MCP clients** (Codex, Cursor, Windsurf) | The connector via config | ★★☆☆☆ | Teams not on Claude. |
| **⑤ Remote connector** (OAuth, *roadmap*) | Tools on **web + mobile** too | ★★★★☆ | Reaching users on claude.ai web / phone. |

**Short version: install the Plugin.** It contains the connector *plus* the operating expertise
and the autonomous agents. Everything below explains why.

---

## What "value" means — the building blocks

Genudo's Claude integration is layered. Each layer adds capability on top of the last:

| Layer | Role | Analogy |
|---|---|---|
| **Connector** (MCP tools) | The 21 actions — read pipelines, create stages, run webhooks, pull conversations, report. | The **hands** |
| **Prompts** (slash-commands) | Named launchers: `/edit_instructions`, `/build_pipeline`, `/audit_pipeline`. | The **shortcuts** |
| **Skills** (18) | Task know-how Claude auto-invokes — how to interview for a pipeline, safely edit a live agent, wire an automation, debug a conversation. | The **playbooks / steering** |
| **Agents** (5) | Specialists that run multi-step jobs autonomously (architect, doctor, automation-engineer, analyst, kb-librarian). | The **autopilot / orchestration** |

- **Connector alone** = capable hands, but *you* supply the strategy every time.
- **+ Skills** = Claude already knows the right procedure and guardrails for each task.
- **+ Agents** = Claude runs the whole job end-to-end in Cowork/Code.
- **The Plugin bundles all four.**

> Even the bare connector isn't "dumb tools": it ships a guidance preamble plus two guide tools
> (`get_instruction_guides`, `get_editing_playbook`) and the three prompts. The Plugin is what
> adds the 18 skills and 5 agents.

---

## ① Plugin — everything in one install ★★★★★

The complete Genudo workforce: connector + 18 skills + 5 agents + prompts. Claude auto-invokes
the right skill, agents handle heavy multi-step work, and every write to your account is shown
as a diff and confirmed first.

**Get it (three ways):**

**A. By command — Claude Code** *(recommended; auto-updates)*
```
/plugin marketplace add genudo-ai/genudo_mcp
/plugin install genudo@genudo-ai
```

**B. By marketplace — claude.ai / Desktop / Cowork**
Customize → Personal plugins → **+** → **Add marketplace** → `genudo-ai/genudo_mcp` → **Add** →
Browse plugins → **Install**.

**C. By file — upload the zip**
Customize → Personal plugins → **+** → **Upload plugin** → drop `genudo-plugin.zip` → **Upload**.

Enter your API key when prompted (Genudo → Settings → API Keys).

**Runs on:** Claude Code, Claude Desktop, Cowork. (Skills work in all; **agents run in Cowork &
Code**; the bundled connector runs on Desktop/Code — web/mobile need option ⑤.)

**Coming:** the same plugin, publicly searchable in Claude's **Browse plugins** directory
(submitted, pending review).

---

## ② Connector (MCP) — tools + guidance, you steer ★★★☆☆

The published `genudo-mcp-client` bridge: **21 tools** + a guidance preamble + the guide tools +
3 prompts. No skills or agents — you prompt Claude to use the tools.

**Claude Code — one command:**
```
claude mcp add --env GENUDO_API_KEY=YOUR_KEY --transport stdio genudo -- npx -y genudo-mcp-client@1.1.1
```

**Any MCP client — JSON config:**
```json
{
  "mcpServers": {
    "genudo": {
      "command": "npx",
      "args": ["-y", "genudo-mcp-client@1.1.1"],
      "env": { "GENUDO_API_KEY": "your_api_key_here" }
    }
  }
}
```

**Runs on:** Claude Code, Claude Desktop (local stdio). Needs Node.js.

**Best for:** developers who want raw tool access and drive the workflow themselves. If you want
Claude to *know how* to build/fix pipelines, use the Plugin instead.

---

## ③ Desktop extension (`.mcpb`) — one-click connector on Desktop ★★★☆☆

Same connector as ②, packaged as a Claude Desktop extension (with the Genudo logo). Double-click
`genudo.mcpb` → enter API key → done. No terminal, no Node config.

**Runs on:** Claude Desktop (macOS/Windows). Tools only — no skills/agents.

**Coming:** listed in Claude's **Browse extensions** directory for one-click discovery.

---

## ④ Other MCP clients — Codex, Cursor, Windsurf ★★☆☆☆

The same connector works in any MCP-compatible client. Add the JSON block from ② to that client's
MCP config. You get the 21 tools + prompts; skills/agents are Claude-specific.

**Best for:** teams standardized on a non-Claude AI client who still want Genudo tool access.

---

## ⑤ Remote connector (OAuth) — web + mobile *(roadmap)* ★★★★☆

Options ①–④ run a **local** process, so they cover Desktop and Code but **not** claude.ai web or
the mobile apps. To reach those, Genudo exposes a **remote MCP server with OAuth 2.1** — then
users add it by URL (like Figma/Notion) and log in with their Genudo account. No install, no key
paste, works on every surface including phones.

**Status:** specced for the backend (OAuth 2.1 + PKCE + discovery). Not yet live. When it ships,
the Plugin's connector simply points at the HTTPS endpoint and the full experience reaches web +
mobile.

---

## Where each option runs

| | Web chat | Mobile | Desktop | Cowork | Claude Code |
|---|:--:|:--:|:--:|:--:|:--:|
| Plugin — **skills** | ✅ | limited | ✅ | ✅ | ✅ |
| Plugin — **agents** | — | — | — | ✅ | ✅ |
| Connector — **local** (npx / `.mcpb`) | — | — | ✅ | ✅ | ✅ |
| Connector — **remote** (OAuth, roadmap) | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## What the connector can do (21 tools)

- **Analytics** — account summary, messaging stats, AI performance & cost.
- **Discover** — list pipelines, stages, variables, contacts, opportunities, messages; pipeline options.
- **Build** — guided journey, create pipeline / stage / variable / action.
- **Update** — pipeline, stage, action, variable, opportunities (bulk).
- **Delete** — variable.

The tool list **grows automatically** as Genudo's backend adds capabilities (e.g. follow-up
sequences, knowledge base) — no reinstall needed.

---

## Install cheat-sheet

| Goal | Command / action |
|---|---|
| Full experience (Code) | `/plugin marketplace add genudo-ai/genudo_mcp` → `/plugin install genudo@genudo-ai` |
| Full experience (claude.ai) | Add marketplace `genudo-ai/genudo_mcp` → Browse plugins → Install |
| Full experience (offline file) | Upload `genudo-plugin.zip` |
| Tools only (Code) | `claude mcp add --env GENUDO_API_KEY=KEY --transport stdio genudo -- npx -y genudo-mcp-client@1.1.1` |
| Tools only (Desktop, one-click) | Install `genudo.mcpb` |
| Tools only (other client) | Add the JSON block from option ② |
| Get an API key | Genudo → Settings → API Keys |

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
  or clear the npx cache: `rm -rf ~/.npm/_npx`. The connector must be **≥ 1.1.0**.
- **401 / not connected** → API key wrong or expired. Remove and re-add with a fresh key.
- **Agents greyed out** → agents run only in **Cowork & Code**, not plain web/desktop chat.
- **Nothing works on web/mobile** → expected today; those need the remote OAuth connector (⑤).

---

*Genudo — one platform, one inbox, one analytics dashboard. Build your AI workforce for any channel.*
