---
name: genudo-pre-ai-channel-audit
description: Connect to GenuDo via MCP, audit newly connected messaging channels (Messenger, Instagram, WhatsApp) before activating AI agents, cluster visitor inquiries into capacity-weighted cases, project monthly message/lead volume and per-message cost (0.5–1.5 EGP range, 1.0 EGP average), and generate a multi-page Executive Arabic PDF Report (1 case per page, zero overflow).
---

# GenuDo Pre-AI Channel Discovery & Arabic Executive PDF Audit

## Overview
Use this skill whenever a client connects new social or messaging channels (Facebook Messenger, Instagram DM, WhatsApp) to **GenuDo Pipelines** in passive/observation mode **before launching the AI Agent**.

This workflow logs into GenuDo via MCP, extracts all real visitor messages and leads from the newly connected channels, analyzes what customers are asking about, measures each inquiry category's share of total volume, projects 30-day message/lead volume and expected monthly cost, defines the AI Agent's use cases, and compiles an **Executive Arabic PDF Report** (`RTL`, 10 pages, one case per page, locked A4 layout with zero text overflow).

---

## 1. Prerequisites & GenuDo MCP Login / Discovery

Before running the analysis, authenticate and verify access to the target GenuDo workspace via the **GenuDo MCP Server** (`https://api.genudo.ai/mcp`).

### Step 1.1: Verify GenuDo Authentication
1. Call `get_profile` and `get_account_summary` from the `genudo` MCP server to confirm your active session and account permissions.
   - If the MCP server is not yet connected or returns `401 Unauthorized`, configure the `genudo` MCP server in your client settings (`mcp_config.json` or `.claude.json`) with your GenuDo API token / OAuth login, then re-verify with `get_profile`.
2. Call `list_pipelines` to inspect all pipelines in the workspace.

### Step 1.2: Identify Newly Connected Channels & Pipelines
For each target pipeline (e.g., Online Store vs. Publishing House, or Branch A vs. Branch B):
1. Call `get_pipeline_details(pipeline_id=<ID>)` and inspect the `channels` array:
   ```json
   {
     "id": 301,
     "identifier": "104352818912345",
     "status": "active",
     "provider": "messenger",
     "connector": "facebook"
   }
   ```
2. Call `list_pipeline_stages(pipeline_id=<ID>)` to check stage names, order, and whether `ai_paused` is `true` (passive data collection mode prior to AI launch).

### Step 1.3: Extract All Visitor Messages & Leads (Read-Only)
1. Call `list_messages(pipeline_id=<ID>, limit=100)` and paginate using `next_cursor` until all messages in the observation window (typically 7 to 30 days) are fetched.
   - **Rate Limit**: Respect GenuDo's **30 requests/minute** limit. Cache raw payloads locally to `messages_raw.json`.
   - **Read-Only Rule**: Never mutate pipelines, stages, or opportunities (`update_*`, `create_*`, `delete_*`) during an audit.
2. Filter out internal test contacts (`is_test == true` or contact names containing `test`, `autotest`, `تجربة`).
3. Group messages by `contact_id` (each unique `contact_id` = **1 Unique Lead / Conversation**).
4. Record message metadata:
   - Total messages (`COUNT(messages)`), Unique leads (`COUNT(DISTINCT contact_id)`), and Average messages per lead (`Total Messages / Unique Leads`).
   - Daily breakdown by Cairo local date (`UTC+3`) to identify average daily flow and peak traffic days.
   - Attachment breakdown (`attachments` array): count how many messages contain **images** (e.g., product/book cover photos, payment screenshots), **audio/voice notes**, **PDFs/CVs**, or **external links**.

---

## 2. Conversational Mining & Case Clustering

Read the full chronological thread of every conversation and classify each lead into **5 to 7 primary Customer Inquiry Cases (المحاور الرئيسية لاحتياجات العملاء)** based on their primary intent.

For **each Case**, compile the following structured Arabic fields:
1. **Case Name & Category Badge** (e.g., `استعلامات توفر المنتجات والأسعار`, `تتبع الشحنات المتأخرة`, `طلبات النشر والترجمة`, `عناوين الفروع والخصومات`, `باقات الأطفال والمجموعات`, `الأعطال التقنية بموقع الدفع`, `الاستفسارات المصورة والتوجيه العام`).
2. **Volume & Capacity Share**:
   - Number of conversations (`عدد المحادثات`) and exact percentage of total conversations (`نسبة الاستحواذ من السعة الكلية %`).
   - Channel split (e.g., how many conversations occurred on Channel 1 vs. Channel 2).
   - Estimated message count and attachment count for this case.
3. **Core Issue Diagnosis (`توصيف المشكلة والعبء الحالي`)**:
   - Write **3 concise, scannable bullet points** (1–2 lines each) explaining what customers are asking and why current manual handling fails or delays them.
4. **Business & Operational Impact (`الأثر التشغيلي والتجاري`)**:
   - Write **3 concise bullet points** quantifying the business risk (lost ready-to-buy sales, repetitive inbox congestion, cross-channel misrouting, customer frustration).
5. **3 Verbatim Customer Quotes (`نماذج حقيقية من رسائل الزوار`)**:
   - Select 3 real Arabic quotes directly from the visitor messages that illustrate the case, tagged with the channel name and date.
   - **Privacy Rule**: Never include customer phone numbers, personal emails, or full names—anonymize PII while keeping the message phrasing authentic.
6. **3-Step AI Agent Workflow (`آلية المعالجة الآلية عبر وكيل الذكاء الاصطناعي`)**:
   - **Step 1 (`الخطوة 1 — الفهم والتصنيف`)**: How the agent detects intent or extracts entities/images.
   - **Step 2 (`الخطوة 2 — البحث والربط البرمجي`)**: Which knowledge base table or store/shipping integration the agent queries.
   - **Step 3 (`الخطوة 3 — الرد الفوري أو التصعيد المنظم`)**: How the agent resolves the request or hands off structured data (`Opportunity`) to a human team.

---

## 3. Volume Extrapolation & Unified Cost Rules (Mandatory)

When calculating volume projections and financial estimates, strictly enforce these rules:

### 3.1 Volume Extrapolation Formulas
Given an observation period of $D$ active days (e.g., $D = 7$ days):
- $\text{Daily Message Rate} = \frac{\text{Total Observed Messages}}{D}$
- $\text{Daily Lead Rate} = \frac{\text{Total Unique Leads}}{D}$
- $\text{Expected Monthly Messages (30 Days)} = \text{round}(\text{Daily Message Rate} \times 30)$
- $\text{Expected Monthly Leads (30 Days)} = \text{round}(\text{Daily Lead Rate} \times 30)$

Calculate these metrics for **each channel individually** and for the **combined total**.

### 3.2 Single Unified Cost Model (Per-Message Pricing ONLY)
> [!IMPORTANT]
> **NEVER split the financial analysis into two competing scenarios (do NOT show "Scenario A: Per-Message vs. Scenario B: Per-Lead").**
> Always use **ONE unified pricing model based on Per-Message Cost** with an average of **1.0 EGP per message** and a range of **0.5 EGP to 1.5 EGP per message**.

Display the expected monthly cost across three clear tiers inside a single unified financial card:
1. **Lower Bound Estimate (`الحد الأدنى التقديري — 0.5 ج / رسالة`)**:
   - $\text{Monthly Cost}_{\text{min}} = \text{Expected Monthly Messages} \times 0.5\text{ EGP}$
2. **Adopted Expected Average (`المتوسط التقديري المعتمد — 1.0 ج / رسالة`)** *(Highlighted Primary Card)*:
   - $\text{Monthly Cost}_{\text{avg}} = \text{Expected Monthly Messages} \times 1.0\text{ EGP}$
   - Also show the daily cost ($\text{Daily Message Rate} \times 1.0\text{ EGP}$) and the per-channel monthly breakdown.
3. **Upper Bound Estimate (`الحد الأعلى التقديري — 1.5 ج / رسالة`)**:
   - $\text{Monthly Cost}_{\text{max}} = \text{Expected Monthly Messages} \times 1.5\text{ EGP}$

**Mandatory Cost Disclaimer (in Arabic)**:
- State explicitly that this range (`0.5 to 1.5 EGP per message`, averaging `1.0 EGP`) is an **initial estimate (`تقدير مبدئي مرن`)**.
- Explain that the exact final unit cost is determined by the **final use cases (`Final Use Cases`)** built for the agent and the level of **technical integrations (`Integrations`)** with the online store (`E-Commerce Store / Catalog`) or backend/shipping systems (`ERP / Shipping / CRM`).

### 3.3 Model-Agnostic LLM Rule (`Any LLM`)
> [!IMPORTANT]
> **Do NOT lock the report or architecture to a single LLM vendor (e.g., do not hardcode "Gemini Multimodal only").**
> Explicitly state in the Visual Queries case, the Cost section, and the Final Recommendations that the GenuDo AI Agent is **model-agnostic (`Any LLM`)** and can utilize any language/vision model to answer questions and analyze customer images based on the best accuracy-to-cost balance for the final use cases.

---

## 4. Arabic Executive PDF Report Structure & Layout Standards

The deliverable must be a **100% Arabic (`dir="rtl"`, `lang="ar"`) Executive PDF Report** (plus its `.html` source) designed for C-level executives and operations directors.

### 4.1 Page-by-Page Architecture
- **Page 1 — Executive Summary & Capacity Distribution (`الملخص التنفيذي وتوزيع السعة`)**:
  1. Top executive banner with client name, channel IDs, and observation dates.
  2. Concise 3-line narrative box explaining what the report analyzes and why it was conducted prior to enabling AI.
  3. **4 Hero KPI Cards**: Observed Messages, Observed Unique Leads, Expected Monthly Messages (`30d`), and Expected Monthly Leads (`30d`).
  4. **Divided One-Line Capacity Bar (`شريط توزيع السعة الحجمية — Divided One-Line Capacity Bar`)**: A single full-width horizontal stacked bar visually dividing 100% of conversation volume across the 7 cases, paired with a color-coded legend.
  5. **Quick Navigation Index Table (`جدول الفهرس السريع وتوزيع الحالات`)**: Lists each case, conversation count, channel breakdown, capacity percentage badge, and **dedicated page number**.
- **Pages 2 to 8 — Dedicated One-Case-Per-Page Deep Dives (`صفحة مستقلة لكل حالة`)**:
  - **Strictly ONE case per page** so the page has clean breathing room, balanced white space, and zero visual clutter.
  - Each case page contains 5 structured visual blocks:
    1. **Colored Case Banner**: Case number, Arabic title, subtitle, and large capacity share percentage (`%`).
    2. **4 Mini Metric Cards + Visual Capacity Progress Bar**: Conversations count, channel split, message/attachment count, and automation readiness badge.
    3. **2-Column Diagnosis Grid**: Right card (`توصيف المشكلة والعبء الحالي` in red tint) + Left card (`الأثر التشغيلي والتجاري` in amber tint), each containing **3 concise bullet points**.
    4. **Verbatim Visitor Quotes Strip (`نماذج حقيقية من رسائل الزوار`)**: 3 real customer quote cards with channel & date tags.
    5. **3-Step Horizontal AI Agent Workflow (`آلية المعالجة الآلية عبر وكيل الذكاء الاصطناعي`)**: 3 numbered step cards showing how the AI agent resolves the case end-to-end.
- **Page 9 — Daily Volume Flow, 30-Day Projections & Expected Cost (`تحليل الحجم اليومي والتوقعات الشهرية والتكلفة`)**:
  1. **Daily Volume Horizontal Bar Chart**: Day-by-day stacked bars (Channel 1 vs. Channel 2) highlighting the peak day in red.
  2. **Quantitative Projection Table**: Comparing each channel and the combined total across 6 columns (`إجمالي 7 أيام رسائل`, `إجمالي 7 أيام عملاء`, `المعدل اليومي للرسائل`, `المعدل اليومي للعملاء`, `الحجم الشهري المتوقع 30 يوماً`, `العملاء المتوقعون شهرياً`).
  3. **Unified Expected Operating Cost Box**: The 3-tier per-message cost cards (`0.5 EGP` min | **`1.0 EGP` average** | `1.5 EGP` max) + the 2 explanatory bullets on Final Use Cases / Store Integrations and `Any LLM` flexibility.
- **Page 10 — AI Agent Use Cases Matrix & Pre-Launch Roadmap (`مصفوفة مهام وكيل الذكاء الاصطناعي والتوصيات`)**:
  1. **Comprehensive Use Case Matrix Table**: Mapping all 7 cases to their volume share, automation percentage badge (`100% آلي`, `90% آلي`, `مشترك Hybrid`), AI execution role, and human escalation rule.
  2. **4 Executive Pre-Launch Cards (2×2 Grid)**:
     - `1. توحيد القاعدة المعرفية بين المسارات` (Shared Knowledge Base across channels)
     - `2. التكامل مع المتجر وإنقاذ المبيعات` (Store integration & in-chat order capture)
     - `3. الربط البرمجي لتتبع الشحنات` (Automated order status lookup)
     - `4. مرونة استخدام أي نموذج ذكاء اصطناعي (Any LLM)` (Model-agnostic text & vision routing)

---

## 5. Technical Rendering & Zero-Overflow Verification

To guarantee crisp Arabic typography, locked A4 pages, and zero page-break bleed:

1. **CSS Page Locking**:
   - Set `@page { size: A4 portrait; margin: 0; }`
   - Wrap each page in `<div class="page">` with `width: 210mm; height: 297mm; padding: 10mm 14mm; overflow: hidden; page-break-after: always; display: flex; flex-direction: column; justify-content: space-between;`.
   - Load Google Font `'Cairo'` (`400, 600, 700, 800, 900`) and wait for `document.fonts.ready` before exporting PDF.
2. **Automated Overflow Check via Playwright**:
   - Use the bundled generator script `scripts/render_arabic_audit_pdf.py` (or Playwright Python API) to check every `.page` element:
     ```python
     overflow = el.scrollHeight - el.clientHeight
     assert overflow == 0, f"Page overflow detected: {overflow}px"
     ```
   - Export full-page screenshots (`page_1.png`, `page_9.png`, `page_10.png`) and visually inspect them to verify balanced white space and alignment before delivering the PDF to the user.

### Quick Command to Run the Bundled Generator Script
```bash
python3 scripts/render_arabic_audit_pdf.py \
  --input examples/sample_audit_data.json \
  --output-html reports/channel_audit_report_ar.html \
  --output-pdf reports/channel_audit_report_ar.pdf
```

---

## 6. Mandatory Response Ending Convention

Whenever presenting findings from a channel audit, delivering an executive report, or analyzing customer messaging, **ALWAYS end your response with**:

### 💡 Suggested Next Steps
- Concrete technical next steps to proceed, generate the PDF report (`python3 scripts/render_arabic_audit_pdf.py`), or review the case clustering.
- Clear verification steps with the client or management before activating live AI response agents.

### 🚀 Suggested GenuDo Use Cases (Tailored to this Audit & Pre-AI Stage)
- **Live QC Dashboard**: Deploy `build-live-dashboard` with `WhatsAppGroupMonitor` to watch incoming channel volume, response SLAs, and voice notes in real time.
- **Knowledge Base Seeding**: Ground the agent's top 3 inquiry categories using GenuDo Knowledge Tables (`upsert_knowledge_points`) or `shopify-catalog-export`.
- **Hybrid Escalation Routing**: Wire GenuDo Actions (`create_action`) to route complex inquiry cases (e.g. shipping delays or payment errors) directly to specialized human queues or Zoho Desk tickets.
- **Follow-up Automation**: Schedule `create_followup` sequences on qualified intake stages so visitors who drop off are automatically nurtured.

