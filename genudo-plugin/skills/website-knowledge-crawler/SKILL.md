---
name: website-knowledge-crawler
description: Discover pages on a website, extract clean Markdown per page, let the user preview/edit/diff Markdown and select pages before ingestion, and chunk efficiently into a Genudo Knowledge Table attached to a pipeline.
---

# Website Knowledge Crawler & Markdown Chunker

Turn any company website, help center, landing page, or documentation site into high-recall,
heading-aware Knowledge Base rows — with full user review, inline Markdown editing, and
diff comparison before anything is written or embedded.

## Tools

| Stage | Tool | Purpose |
|---|---|---|
| 1. Discover URLs | `discover_website_pages` | Enumerate site pages via `sitemap.xml` or same-domain link crawl (SSRF-guarded). |
| 2. Crawl to Markdown | `crawl_website_to_markdown` | Fetch selected URLs (or bounded site crawl), convert HTML to clean Markdown, check prompt injections, diff against `existing_table_id` if syncing, and stage draft by `draft_id`. |
| 3. Review Card | `WebsiteCrawlCard` | Blocking UI card auto-hydrated from `draft_id` where the user checks/unchecks pages, edits Markdown, inspects diffs & chunk boundaries, and chooses target table + pipeline. |
| 4. Chunk & Ingest | `ingest_website_markdown_to_kb` | Approval-gated ingestion: splits approved/edited Markdown with heading-aware `chunk_markdown_document`, creates/updates Knowledge Table, deletes stale URL chunks on sync, upserts rows, syncs Qdrant, and attaches table to pipeline. |
| 5. Verify | `search_knowledge_table` / `inspect_knowledge_source_index` | Verify retrieval and Qdrant index health immediately after ingestion. |

## Recommended Workflow

1. **Scope First (Optional for single URLs)**:
   - If the user shares a root domain (e.g. `https://example.com`) without naming specific pages,
     call `discover_website_pages(url=..., mode="auto", max_pages=30)` first so large sites
     can be filtered by section (`include` / `exclude`) or selected cleanly.
   - If the user provides specific URLs or asks for a small multi-page crawl (`<= 12` pages),
     pass `urls=[...]` or `url=...` directly to `crawl_website_to_markdown(...)`.
   - If updating an existing table, call `list_knowledge_tables` first and pass
     `existing_table_id=...` to `crawl_website_to_markdown` so `previous_markdown` diffs are
     populated automatically.

2. **Stage Editable Markdown Draft (`crawl_website_to_markdown`)**:
   - Full page Markdown is saved server-side under `draft_id`.
   - **Never paste multi-page raw Markdown dumps into chat messages.**

3. **Emit Blocking `WebsiteCrawlCard` (with `pages=[]`)**:
   - Return `WebsiteCrawlCard` as your structured turn output with `draft_id`, `root_url`,
     `table_name` (`suggested_table_name`), concise RAG router `table_description`, `mode`,
     `existing_table_id`, `attach_pipeline_id`, and **`pages=[]`** (the server hydrates full
     editable `WebsiteCrawlPageSpec` pages automatically onto the SSE UI card).
   - Tell the owner they can inspect, edit Markdown, compare diffs against previous KB content,
     preview chunks, and pick target mode before clicking **Approve & Chunk to Knowledge Base**.

4. **Chunk & Ingest After Confirmation (`ingest_website_markdown_to_kb`)**:
   - On the resume turn (`<ui_response card_type="website_crawl">`), call
     `ingest_website_markdown_to_kb(draft_id=...)` — server-side `confirmed_website_crawl`
     applies the owner's selected URLs, edited Markdown overrides, table settings, and chunk
     parameters automatically (and pauses at the write-approval gate).

5. **Verify & Link**:
   - Confirm chunk counts (`pages_ingested`, `chunks_upserted`, `stale_chunks_deleted`) and verify
     pipeline attachment (`update_pipeline(attach_knowledge_table_ids=...)` runs automatically
     when `attach_pipeline_id` is set).
   - Test with `search_knowledge_table` and emit a `PreviewCard` to `/knowledge-tables/{id}`.

## Guardrails

- All URLs pass SSRF validation (`http://`/`https://` public origins only; private IPs rejected).
- Never bypass user review by skipping `WebsiteCrawlCard` unless the user explicitly instructed
  immediate unattended ingestion on exact pre-supplied URLs.
- Preserve Markdown headings (`#`–`####`) and tables intact inside chunks so customer support /
  sales agents receive complete context per chunk.

