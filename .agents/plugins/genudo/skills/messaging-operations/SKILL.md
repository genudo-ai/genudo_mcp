---
name: genudo-messaging-operations
description: Analyze messaging statistics, inspect contact conversations, evaluate AI performance metrics, and trigger pipeline journeys. Trigger when reviewing message volume, channel breakdown (WhatsApp, Instagram, Messenger), investigating chat transcripts, or managing contact opportunities.
---

# GenuDo Messaging & CRM Operations

## Overview
Operational runbook for monitoring multi-channel messaging traffic, auditing conversation transcripts, evaluating AI agent performance, and syncing contact opportunities across WhatsApp, Instagram, Messenger, and LinkedIn.

## Key Tools

| Category | MCP Tool | Purpose |
|---|---|---|
| Account Health | `get_account_summary` | Overall count of pipelines, opportunities, and message totals/costs |
| Volume Analytics | `get_messaging_stats` | Time-windowed message traffic by channel provider and pipeline |
| AI Metrics | `get_ai_performance` | Model latency, token usage, cost per conversation, and completion rates |
| Transcripts | `list_messages` | Full turn-by-turn conversation history for contacts or pipelines |
| Contacts | `list_contacts` | Look up contacts by phone number, name, or metadata |
| Opportunities | `list_opportunities` / `update_opportunities` | Inspect and update pipeline deal status (active, won, lost) |
| Journey Automation | `start_pipeline_journey` | Enroll a contact into an automated pipeline flow |

---

## Step-by-Step Workflows

### 1. Workspace Health Audit
1. Call `get_account_summary` to verify:
   - Total pipelines and active opportunities.
   - Cumulative message volume and cost metrics.
   - Cost-per-deal ratios.
2. If anomaly or high volume is detected, proceed to channel-level investigation.

### 2. Channel Traffic & Volume Analysis
Call `get_messaging_stats` with specific filters:
- **`provider`**: Filter by `whatsapp`, `messenger`, `instagram`, or `linkedin`.
- **`pipeline_id`**: Focus on a specific active campaign or pipeline.
- **`start_date` / `end_date`**: Scope to daily, weekly, or monthly reporting intervals.

### 3. Transcript Audit & Drift Diagnosis
When diagnosing customer conversations or agent mistakes:
1. Identify the contact with `list_contacts` (search by phone or name).
2. Fetch chronological chat messages with `list_messages` passing `contact_id` or `pipeline_id`.
3. Review turn-by-turn interactions:
   - Identify which stage the conversation was in.
   - Check if the agent respected stage boundaries, instructions, and grounding facts.
   - Pinpoint drift points (e.g., hallucinations, missed webhook triggers, premature stage transitions).

### 4. Opportunity & Funnel Management
1. Call `list_opportunities` to query leads by stage, status (`active`, `pending`, `won`, `lost`), or pipeline.
2. Call `update_opportunities` to update lead status, move opportunities to different stages, or mark deals as won/lost.

### 5. Enrolling Contacts in Pipeline Journeys
To trigger automated outreach or sequence onboarding:
- Call `start_pipeline_journey` with the target `pipeline_id` and `contact_id` (or contact details).
- Verify enrollment and monitor initial messages via `list_messages`.
