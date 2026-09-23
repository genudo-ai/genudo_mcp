---
name: genudo-api-reference
description: Comprehensive reference for all public GenuDo REST API endpoints and remote Streamable HTTP MCP tools. Use when building custom dashboards, integrations, webhooks, or when looking up endpoint URLs, HTTP methods, headers, schemas, and payload examples.
---

# GenuDo API & MCP Reference Guide

GenuDo provides two developer integration surfaces:
1. **Remote Streamable HTTP MCP Server** (`https://api.genudo.ai/mcp`) — 32 tools accessible via standard JSON-RPC 2.0 HTTP POST.
2. **Public REST API** (`https://api.genudo.ai/docs/`) — Scoped Personal Access Token REST endpoints.

---

## 1. Authentication

* **Header:** `Authorization: Bearer <TOKEN>`
* **Content-Type:** `application/json`
* **Tokens:** Personal Access Tokens generated in GenuDo Console under **Settings → API Tokens / MCP Servers** (`https://api.genudo.ai/docs/guide/authentication`).
* **OAuth 2.1:** Standard OAuth endpoint at `https://api.genudo.ai/oauth/authorize`.

---

## 2. Remote MCP Tools Reference (`POST https://api.genudo.ai/mcp`)

Call any tool using standard HTTP POST:
```bash
POST https://api.genudo.ai/mcp
Authorization: Bearer <TOKEN>
Content-Type: application/json

{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"TOOL_NAME","arguments":{...}}}
```

### Analytics & Operations
* **`get_account_summary`**: High-level metrics:
  - `total_pipelines`, `total_opportunities`, `active_opportunities`, `won_opportunities`, `lost_opportunities`, `total_messages`, `total_messages_cost`, `cost_per_deal`.
* **`get_messaging_stats`**: Messaging volume and spend:
  - Params: `provider` (`whatsapp`, `messenger`, `instagram`, `linkedin`), `pipeline_id` (optional), `days` (e.g. 7, 30, 90).
* **`get_ai_performance`**: AI automation metrics:
  - `total_ai_messages`, `avg_response_time`, `total_cost`.

### Pipelines & Stages
* **`list_pipelines`**: Returns all pipelines (id, name, type, status, channel).
* **`get_pipeline`**: Detailed pipeline configuration, attached knowledge tables, opening messages.
* **`list_pipeline_stages`**: Stages for a pipeline with order, auto-advancement rules, and lead counts.
* **`create_pipeline`** / **`update_pipeline`**: Create or configure pipeline settings.
* **`create_pipeline_stage`** / **`update_pipeline_stage`** / **`delete_pipeline_stage`**: Stage topology.

### Opportunities & Contacts
* **`list_opportunities`**: Paginated deal rows:
  - Params: `pipeline_id`, `stage_id`, `status` (`active`, `pending`, `won`, `lost`), `priority`, `q` (search), `page`, `per_page`.
* **`get_opportunity`** / **`create_opportunity`** / **`update_opportunity`**: Deal detail and stage progression.
* **`list_contacts`** / **`get_contact`** / **`update_contact`**: Customer contact records and channel handles.

### Knowledge Tables & Vectors
* **`list_knowledge_tables`**: Structured knowledge tables attached to pipelines.
* **`search_knowledge_table`**: Hybrid vector + keyword semantic search.
* **`upsert_knowledge_points`**: Add or update product catalogue / FAQ rows.
* **`delete_knowledge_points`**: Remove specific knowledge rows.

---

## 3. Public REST API Endpoints (`https://api.genudo.ai`)

All endpoints accept and return JSON.

### Opportunities
* **Create Opportunity:**
  `POST /api/v1/opportunities`
  Body: `{ "pipeline_id": 1, "stage_id": 2, "contact_id": 10, "value": 500, "status": "active" }`
* **Retrieve Opportunity:**
  `GET /api/v1/opportunities/{id}`
* **Update Opportunity:**
  `PUT /api/v1/opportunities/{id}`
  Body: `{ "stage_id": 3, "status": "won", "value": 750 }`

### Conversations & Messaging
* **Update Conversation:**
  `PUT /api/v1/conversations/{id}`
  Body: `{ "status": "open", "assigned_to": 4 }`
* **Send Message:**
  `POST /api/v1/conversations/{id}/messages`
  Body: `{ "body": "Hello from GenuDo!", "provider": "whatsapp" }`

### Web Channel (Live Chat Widget Integration)
* **Initiate Session:**
  `POST /api/v1/channels/web/initiate`
  Body: `{ "pipeline_id": 1, "visitor_id": "anon-123", "metadata": { ... } }`
* **Send Message:**
  `POST /api/v1/channels/web/messages`
  Body: `{ "session_id": "...", "text": "Hi, I have a question" }`
* **List Messages:**
  `GET /api/v1/channels/web/messages?session_id=...`

### Structured Knowledge Tables
* **List Tables:**
  `GET /api/v1/knowledge-tables`
* **List Columns:**
  `GET /api/v1/knowledge-tables/{id}/columns`
* **List Points (Rows):**
  `GET /api/v1/knowledge-tables/{id}/points?page=1&per_page=50`
* **Upsert Points:**
  `POST /api/v1/knowledge-tables/{id}/points`
  Body: `{ "points": [{ "default_id": "sku-1", "name": "Item", "price": 100 }] }`
* **Delete Points:**
  `DELETE /api/v1/knowledge-tables/{id}/points`
  Body: `{ "ids": ["sku-1"] }`
