# Genudo — Claude Plugin Marketplace

Install Genudo in **Claude Code**, **Claude Desktop**, **claude.ai** or **Cowork**:

```
/plugin marketplace add genudo-ai/claude-plugin
/plugin install genudo@genudo-ai
```

On claude.ai / Desktop: Customize (or Settings) → **Plugins** → **+** → **Add marketplace** →
`genudo-ai/claude-plugin` → **Add** → Browse plugins → **Install**.

Then approve the Genudo sign-in when prompted — the connector is a hosted server that uses
OAuth, so a browser page opens and you grant access. **There is no token to create or paste.**

**Genudo** is the platform to build AI agents for any communication or sequence-based
channel — WhatsApp, Messenger, Instagram, LinkedIn, email, and more — managed from one
platform, one inbox, and one analytics dashboard.

## Two plugins

| Plugin | Connector | Use it when |
|---|---|---|
| **`genudo`** | ✅ bundled (`https://api.genudo.ai/mcp`) | Almost always. Everything in one install. |
| **`genudo-no-connector`** | ❌ none | You connect Genudo yourself — e.g. a different account per project. |

Both carry the same **22 skills** and **6 agents**. For the no-connector build, add the
server where you want it:

```
claude mcp add --transport http genudo https://api.genudo.ai/mcp --scope project
```

Each project signs in to its own Genudo account, so there are no tokens to keep apart.

## What you get

- **Connector** — 29 tools: pipelines, stages, actions, variables, contacts, opportunities,
  messages, knowledge tables, follow-ups, analytics.
- **22 skills** — playbooks Claude auto-invokes: guided pipeline builds, safe edits to a live
  agent, webhook automations, conversation diagnosis, funnel reporting.
- **6 agents** (Cowork & Code) — specialists that run multi-step jobs end to end.

Every write to your account is diff-previewed and confirmed first.

Agents run in **Cowork** and **Claude Code**; skills and the connector work everywhere,
including claude.ai web chat.

---

> ⚠️ **Auto-generated repo — do not edit or open PRs here.** Source of truth is
> [`genudo-ai/genudo_mcp`](https://github.com/genudo-ai/genudo_mcp), synced by CI on every
> merge to main. Issues → the genudo_mcp tracker.

Other surfaces: [ChatGPT & Codex](https://github.com/genudo-ai/chatgpt-plugin) ·
[npm bridge](https://www.npmjs.com/package/genudo-mcp-client) (self-hosted / token-based)
