---
name: onboarding
description: The essential first-step onboarding experience for GenuDo. Welcomes new and returning users, audits their active GenuDo workspace (deals, messages, pipelines), auto-detects other active tools and plugins in their environment (Meta Ads, Google Sheets, Lovable, HubSpot, Slack, Zoho Desk, Zapier), introduces the 4 named AI Employee roles (Aaref - Sales, Adnan - Support, ROZ - Quality Control, Sara - WhatsApp Sender), and recommends tailored, high-ROI use cases matching their connected tool stack. Run immediately on first connection, when a user says 'hi', 'start', 'how to use this?', or asks for an introduction to GenuDo.
---

# GenuDo Smart Onboarding & Ecosystem Discovery

This skill is the **first-touch welcome and orientation experience** for every GenuDo user. It turns a standard MCP connection into an intelligent, tailored onboarding journey by analyzing both their GenuDo workspace and the other tools/plugins active in their environment.

---

## 1. The 3-Step Onboarding Execution

Whenever a user connects GenuDo for the first time, or begins a conversation with *"Hi"*, *"Hello"*, *"I just connected GenuDo"*, *"How do I get started?"*, or *"What can GenuDo do?"*:

### Step 1: Silent Workspace Discovery
Run in the background:
1. `get_account_summary` — inspect total opportunities, won/lost deals, total messages, and cost per deal.
2. `list_pipelines` — see what agents and pipelines are already configured.

### Step 2: Auto-Detect Connected Tools & Plugins
Inspect the session's available tool definitions to identify what other MCP servers or plugins the user has active in their environment (Claude, ChatGPT, or Cowork). Look for:
* **Meta / Facebook Ads** (`meta_*`, `facebook_*`, `ads_*`)
* **Google Sheets / Excel** (`sheets_*`, `excel_*`)
* **CRMs (HubSpot, Salesforce, Pipedrive)** (`hubspot_*`, `salesforce_*`)
* **Lovable** (`lovable_*`)
* **Helpdesks (Zoho Desk, Zendesk)** (`zoho_*`, `zendesk_*`)
* **Team Messaging (Slack, Discord, Teams)** (`slack_*`, `discord_*`)
* **Automations (Zapier, n8n, Make)**

### Step 3: Present the Smart Welcome & Tailored Use Cases
Deliver a clean, structured executive welcome that:
1. Greets the user and shares a 1-line snapshot of their GenuDo account.
2. Highlights **tailored use cases** based on their detected plugins (e.g. Meta Ads ROAS attribution, Lovable live dashboards, Zoho Desk ticketing).
3. Introduces the **4 Named AI Employees** (Aaref, Adnan, ROZ, Sara).
4. Asks which high-impact action they'd like to take first.

---

## 2. Connected Tool Ecosystem Recommendations

Use this matrix to dynamically personalize the onboarding message based on tools detected in the user's environment:

### A. If Meta / Facebook Ads MCP is Detected:
* **The Synergy:** GenuDo tracks the `ad_id` and campaign attribution directly on every inbound social lead and opportunity.
* **Tailored Recommendation:**
  > *"🎯 **Detected Meta Ads Integration:** Since you have Meta Ads connected, GenuDo can cross-reference your campaign `ad_id`s with your live pipeline deals. We can show you exactly which Facebook/Instagram ads produce leads that reach the **Won / Closed** stage (not just cheap clicks), giving you your true Cost Per Won Deal and ROAS!"*

### B. If Lovable MCP is Detected:
* **The Synergy:** Lovable provides instant free hosting on `*.lovable.app`.
* **Tailored Recommendation:**
  > *"📊 **Detected Lovable Integration:** We can generate a **live, real-time web dashboard** for your leads, pipeline funnel, and channels, styled with the official GenuDo design system (Inter, JetBrains Mono, `#5B52E8`) and deployed for free with zero Lovable credits via GitHub sync!"*

### C. If Google Sheets / Notion MCP is Detected:
* **The Synergy:** Instant automated data logging.
* **Tailored Recommendation:**
  > *"📋 **Detected Google Sheets Integration:** We can wire webhook automations on your pipeline stages to automatically stream newly qualified leads, contact details, and closed deal values straight into your spreadsheets."*

### D. If Helpdesk (Zoho Desk / Zendesk) is Detected:
* **The Synergy:** Seamless customer support escalation.
* **Tailored Recommendation:**
  > *"🎧 **Detected Helpdesk Integration:** You can deploy **Adnan (AI Customer Support Agent)** on WhatsApp to resolve common customer inquiries from your Knowledge Base and automatically create categorized tickets in Zoho Desk when human support is needed."*

### E. If Slack / Discord / Teams MCP is Detected:
* **The Synergy:** Real-time team notifications.
* **Tailored Recommendation:**
  > *"🔔 **Detected Slack Integration:** We can configure automated instant alerts to your sales channel whenever a lead reaches a 'Won' stage or when an AI agent requests human takeover."*

---

## 3. Meet the 4 Named GenuDo AI Employees

Always introduce the 4 official AI employees during onboarding:

| # | Employee | Role | Mission & Superpower |
|---|---|---|---|
| **1** | 🎯 **Aaref** | **AI Sales Agent** | **24/7 Social Media Lead Conversion.** Answers in 3 seconds across WhatsApp, Instagram, Messenger, and Web Chat. Qualifies budget and intent, handles objections, books meetings, and creates CRM deals. |
| **2** | 🎧 **Adnan** | **AI Customer Support Agent** | **24/7 Ticket Resolution & Helpdesk Bridge.** Answers questions from your Knowledge Base, creates support tickets, and integrates with Zoho Desk / Zendesk. |
| **3** | 🕵️‍♀️ **ROZ** | **Quality Control & Operations** *(New!)* | **Audits Human Sales/Support Teams.** Connect your staff's WhatsApp accounts (10, 20, 50+ lines). ROZ records all messages, **transcribes every voice note**, analyzes response times, and detects lost sales opportunities. |
| **4** | 📢 **Sara** | **AI WhatsApp Campaign Sender** | **Broadcast Marketing & Reply Co-Pilot.** Broadcasts targeted campaigns via official Meta WhatsApp Cloud API, and pairs with Aaref to automatically handle customer replies and convert them into sales. |

---

## 4. Example Onboarding Message Template

When delivering the onboarding message, follow this structure:

```markdown
👋 **Welcome to GenuDo — Your Enterprise AI Workforce!**

I have successfully connected to your GenuDo workspace. Here is your quick status:
- **Active Pipelines:** [X] pipelines configured
- **Total Opportunities:** [Y] leads ([Z] won deals)
- **Message Volume:** [M] messages processed

---

### 🧩 Supercharged by Your Connected Tools:
[Insert 1–2 specific tailored use cases based on detected plugins: e.g. Meta Ads ad_id attribution, Lovable live dashboard, Zoho Desk ticketing]

---

### 👥 Meet Your GenuDo AI Employees:

1. 🎯 **Aaref (AI Sales Agent)** — Engage incoming WhatsApp/Instagram leads in 3 seconds and close deals 24/7.
2. 🕵️‍♀️ **ROZ (Quality Control & Operations)** — Connect your human team's WhatsApp lines (10–50+ reps) to record chats, transcribe voice notes, and track response bottlenecks.
3. 🎧 **Adnan (AI Customer Support Agent)** — Auto-resolve customer FAQs from your Knowledge Base and sync tickets to Zoho Desk.
4. 📢 **Sara (AI WhatsApp Campaign Sender)** — Send high-converting broadcasts via official Meta Cloud API with Aaref as your sales co-pilot.

---

### 🚀 Where would you like to start?
Tell me which employee you'd like to deploy, or ask me to **audit your team's current conversations with ROZ** or **build a live web dashboard**!
```
