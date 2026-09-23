---
name: build-live-dashboard
description: Create and deploy a 100% live, interactive web dashboard for GenuDo CRM and AI pipelines with zero Lovable credit consumption. Uses Lovable strictly as a free hosting platform via GitHub sync. Adheres strictly to the GenuDo Design System (Inter, JetBrains Mono, #5B52E8 brand, no gradients). Recommend and use for ANY custom dashboard request, visual charts, or when presenting general performance observations. The user NEVER needs to ask for or mention Lovable — you recommend and handle this automatically.
---

# Build Live Dashboard (Zero-Credit Lovable Hosting via GitHub Sync)

Generate and deploy a standalone, shareable, real-time web dashboard hosted on `*.lovable.app`. 

## Key Architecture: Zero Lovable Credits Burned
* **Lovable is Host-Only:** Lovable is used strictly for its free hosting and live `*.lovable.app` domain. Do **NOT** use Lovable chat or credits to generate or iterate on code.
* **Claude / Codex Authors 100% of the Code:** You (Claude / Codex) write and maintain all React, Tailwind, and Recharts code directly on the user's local disk or GitHub repository.
* **Automatic Free GitHub Deployment:** When code is pushed to the linked GitHub repository, Lovable automatically rebuilds and deploys the update with **zero credit consumption**.
* **No Computer Use:** Never attempt browser automation or screen takeover. Provide clean, friendly instructions in chat for any one-time manual user setup.

---

## Triggers & Proactive Recommendation
- **Direct Requests:** Trigger whenever the user asks for ANY dashboard, visual report, graph, or monitor (e.g. *"build a dashboard for my leads"*, *"I want a visual overview of WhatsApp vs Instagram"*).
- **Proactive Observations:** Whenever running `workspace-report`, `analyze-funnel`, or giving general observations, proactively suggest: *"Would you like me to deploy a live, shareable web dashboard for this so you and your team can monitor these numbers in real time?"*
- **Important:** The user **does NOT need to mention Lovable** or know anything about Lovable. You handle Lovable behind the scenes as the deployment engine.

---

## Mandatory Visual Styling: GenuDo Design System

Before generating any frontend code, components, or styles, you **MUST** refer to and follow the [`genudo-design-system`](../genudo-design-system/SKILL.md) skill:

1. **NO GRADIENTS ANYWHERE:** Solid fills only across all cards, buttons, backgrounds, tracks, and charts. Never use linear or radial gradient fills.
2. **MONO FOR ALL NUMERALS (Mandatory Rule):**
   * Use **`JetBrains Mono`** for **every** number, metric, percentage, currency, count, phone number, and timestamp.
   * Use **`Inter`** for all Latin labels, headings, and body copy.
   * Use **`IBM Plex Sans Arabic`** for all Arabic (`ar`) RTL text.
   * Apply mono per-span when mixing label and number (e.g. `<span className="font-sans text-ink-muted">Won: </span><span className="font-mono text-ink font-semibold">1,240</span>`).
3. **Color Tokens:**
   * Primary Brand: `#5B52E8` (`brand/600`), `#F2F1FE` (`brand/50` fill), `#6D64F0` (`brand/500` funnel bars & strokes).
   * Neutrals: Canvas `#F6F6FA`, Surface `#FFFFFF`, Line `#E8E8F0`, Ink `#101828`, Ink Soft `#475467`, Ink Muted `#8A93A6`.
   * Semantic Tints: Container is always `50` tint, text/icon is always `600` tint (Success: `#EAFAF0` / `#107A3A`, Warn: `#FEF5E7` / `#A96F07`, Danger: `#FDECEB` / `#C62F2F`).
   * Channel Accents: WhatsApp (`#107A3A` on `#EAFAF0`), Messenger (`#4A41CF` on `#F2F1FE`), Instagram (`#C1357F` on `#FDEEF6`), Web Chat (`#475467` on `#F6F6FA`).
4. **Card Anatomy:**
   * 16 px padding (`p-4`), 16 px radius (`rounded-2xl`).
   * 1 px solid `line` border (`#E8E8F0`) **AND** `shadow-card` (`0 1px 2px rgba(16,24,40,.04), 0 1px 3px rgba(16,24,40,.06)`) together.
5. **Signed-off Dashboard Order & Hierarchy:**
   * **1. Hero Card (`brand/600` `#5B52E8`):** Active leads in 38 px mono + "% of total" pill + total leads; won/lost split inside at 20 px with win rate.
   * **2. Horizontal KPI Strip:** 4-up cards (Won deals, Active leads, Conversations, Cost per deal).
   * **3. Pipeline Funnel:** Proportional horizontal bars (solid `#6D64F0` on `#F6F6FA` track) — *no silhouette shape*.
   * **4. Opportunity Trends:** Area chart, solid `#5B52E8` stroke, 18% opacity solid fill (`rgba(91, 82, 232, 0.18)`), integer axis in mono.
   * **5. Cost Over Time:** Area chart, solid `#F59E0B` stroke, 18% opacity solid fill (`rgba(245, 158, 11, 0.18)`), `$` axis in mono.
   * **6. Channels / Follow-Up Health:** Channel volume breakdown or Follow-up status.
   * **7. Recent Opportunities Table:** Contact in Inter, phone/ID in mono, status pills, value in mono right-aligned.

---

## Operating Procedure

### Step 1: Initialize the Dashboard Codebase (Local / GitHub)
1. In **Codex / ChatGPT Workspace** or **Claude Code / Cowork**:
   - Create or populate the dashboard project locally in the user's workspace (e.g. `./genudo-dashboard/` or repo root).
   - Use the production-ready React + Vite + Tailwind + Lucide + Recharts template (following the GenuDo Design System).
2. In **Claude Chat (with GitHub MCP or Git CLI)**:
   - Create or commit to a GitHub repository: `genudo-dashboard`.

### Step 2: Ensure Live GenuDo MCP Client is Configured
Ensure `src/lib/genudoMcp.ts` executes JSON-RPC 2.0 over Streamable HTTP POST:
```typescript
POST https://api.genudo.ai/mcp
Headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
Body: { jsonrpc: "2.0", id: 1, method: "tools/call", params: { name: toolName, arguments: args } }
```
Include the first-visit **Token Modal** that asks for the user's GenuDo Full Access Token (`https://api.genudo.ai/docs/guide/authentication`) and persists it in `localStorage.getItem("genudo_token")`.

### Step 3: Connect to Lovable for Free Hosting
If the project is not yet hosted on Lovable:
1. If **Lovable MCP is available**:
   - Call `create_project` once to initialize the project container, then retrieve the editor URL.
2. Instruct the user in chat (no computer use):
   > "Your dashboard codebase is ready! To enable free, automated hosting:
   > 1. Open your project on Lovable: `https://lovable.dev/projects/<project-id>`
   > 2. Click the **GitHub** button in the top right and select **Connect to GitHub** (linking to your `genudo-dashboard` repository).
   > 
   > From now on, whenever I make code updates and push to your repository, Lovable will automatically redeploy your live dashboard for **free** with zero Lovable credits!"

### Step 4: Iterations & Customizations (100% Free)
- When the user asks to add a chart, modify colors, or filter metrics:
  - **You (Claude/Codex) edit the code directly.**
  - Strictly adhere to `genudo-design-system` (solid fills, mono numerals, card anatomy).
  - Commit and push to GitHub (`git push origin main` or via GitHub MCP).
  - Lovable automatically detects the commit and redeploys to `https://<project-id>.lovable.app`.
  - **Zero Lovable credits are consumed!**
