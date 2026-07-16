# Genudo — ChatGPT & Codex Plugin Marketplace

Install Genudo in **ChatGPT Work (desktop)** or **Codex**:

1. Plugins → Create ▾ → **Add marketplace** → Source: `genudo-ai/chatgpt-plugin`
2. Install **genudo** (26 skills + the Genudo connector).
3. Settings → MCP servers → genudo (gear) → set env var **`GENUDO_TOKEN`** to your
   Genudo token (account → API Keys & Tokens → Create token, `mcp:use` scope).
4. Toggle the server on and try: *"Use Genudo to list my pipelines."*

Codex CLI: `codex plugin marketplace add genudo-ai/chatgpt-plugin`

**Genudo** is the platform to build AI agents for any communication or sequence-based
channel — WhatsApp, Messenger, Instagram, LinkedIn, email, and more — managed from one
platform, one inbox, and one analytics dashboard. Details in
[`genudo-chatgpt-plugin/README.md`](./genudo-chatgpt-plugin/README.md).

---

> ⚠️ **Auto-generated repo — do not edit or PR here.** Source of truth is
> [`genudo-ai/genudo_mcp`](https://github.com/genudo-ai/genudo_mcp) (`chatgpt/`),
> synced by CI on every merge to main. Issues → the genudo_mcp tracker.
