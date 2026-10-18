---
name: shopify-catalog-export
description: Dynamically export clean Shopify product catalogs, variants, and formatted Excel knowledge bases with auto-translated Arabic titles for GenuDo AI agent grounding. Trigger when onboarding e-commerce stores, syncing product catalogs, refreshing store inventory, or preparing knowledge tables for sales agents.
---

# Shopify Catalog Export & Knowledge Base Generator

## Overview
The `shopify_export_catalog` MCP tool dynamically extracts products and variants directly from any Shopify store via GraphQL Admin API. It strips HTML tags, cleans excessive whitespace, decodes entities, normalizes Arabic and English copy, summarizes product options and SKUs, and generates both:
1. **Clean CSV (`products_catalog_clean.csv`)** with UTF-8 BOM, formatted for immediate import into GenuDo Knowledge Tables.
2. **Formatted Excel Knowledge Base (`products_knowledge_base_active.xlsx`)** featuring auto-translated Arabic titles (with soft yellow review highlights), in-stock/sold-out badges, price ranges, variant summaries, and clickable Shopify links.

---

## When to Invoke

- **E-Commerce Agent Onboarding**: Setting up a sales, consultation, or customer service agent (e.g. Aaref or Adnan) for a Shopify merchant on WhatsApp, Instagram, or Messenger.
- **Product Catalog Sync**: Refreshing inventory, pricing changes, or new product drops from a merchant's Shopify store into GenuDo.
- **Knowledge Table Grounding**: Creating or curating GenuDo Knowledge Tables (`create_knowledge_table` / `upsert_knowledge_points`) so agents give accurate, grounded answers without hallucinating prices or inventory.
- **Catalog Quality Audit**: Inspecting a Shopify merchant's catalog for missing Arabic titles, encoding errors, broken descriptions, or out-of-stock items.

---

## Required Agent Workflow: Secure Credential Setup & App Creation Guide

> [!IMPORTANT]
> **CRITICAL SECURITY RULE**: Never ask the customer to paste their Shopify Client Secret, Access Token, or API keys directly into the chat. Always use the local `.env` prefill workflow so credentials remain secure and strictly outside the conversation history.

Whenever the customer wants to export their Shopify catalog and credentials are not yet configured:

### Step 1: Proactively Prefill `.env`
Before asking the customer for credentials, Claude must inspect the working directory and prefill the `.env` file with the exact template:

```bash
# In your project's .env file (gitignored)
SHOPIFY_SHOP=your-store.myshopify.com
SHOPIFY_CLIENT_ID=your_client_id_here
SHOPIFY_CLIENT_SECRET=your_client_secret_here
```

Also verify that `.env` is listed in `.gitignore` (add it if missing).

### Step 2: Guide the Customer to Create the Shopify App
Send the customer clear, step-by-step instructions to obtain their Client ID and Client Secret:

> 1. In **Shopify Admin**, go to **Settings** (bottom-left gear icon) → **Apps and sales channels** → **Develop apps** (or open the **Shopify Partners Dashboard** → **Apps**).
> 2. Click **Create an app** (name it e.g. `GenuDo Integration`).
> 3. Under **Configuration** → **Admin API integration**, search for the **`read_products`** scope, check the checkbox, and click **Save**.
> 4. Go to **App settings** → **Credentials**.
> 5. Copy the **Client ID** and **Client Secret**.
> 6. Open the `.env` file in your editor (I have already prefilled it for you):
>    - Set `SHOPIFY_SHOP` to your permanent domain (e.g., `your-store.myshopify.com`).
>    - Paste your `SHOPIFY_CLIENT_ID`.
>    - Paste your `SHOPIFY_CLIENT_SECRET`.
> 7. Save the `.env` file.
> 
> 🔒 **Security Notice:** For your security, please do not post your Client Secret here in the chat.
> Once you have saved your `.env` file, reply **"Saved"** or **"Ready"**, and I will begin exporting your catalog!

*(Alternative: If the customer already has a Custom App Admin API token `shpat_...`, they can instead set `SHOPIFY_ACCESS_TOKEN=shpat_...` in `.env`)*.

### Step 3: Execute Export on Customer Confirmation
When the customer replies that they have saved the file:
1. Invoke `shopify_export_catalog`:
   ```json
   {
     "active_only": true,
     "generate_excel": true,
     "output_dir": "./output"
   }
   ```
   *(The server process reads `SHOPIFY_SHOP`, `SHOPIFY_CLIENT_ID`, and `SHOPIFY_CLIENT_SECRET` directly from `.env`)*.
2. Present the export deliverables summary to the customer.

---

## Tool Invocation (`shopify_export_catalog`)

### Input Schema
- `shop_domain` (*string*, optional if set in `.env`): The Shopify store domain (e.g. `your-store.myshopify.com` or custom domain).
- `access_token` (*string*, optional): Shopify Admin API access token (`shpat_...`).
- `client_id` (*string*, optional): Client ID for Client Credentials grant.
- `client_secret` (*string*, optional): Client Secret for Client Credentials grant.
- `active_only` (*boolean*, optional, default: `true`): If `true`, exports only `ACTIVE` products; if `false`, includes `DRAFT` and `ARCHIVED`.
- `generate_excel` (*boolean*, optional, default: `true`): Whether to generate the formatted Excel knowledge base with auto-translated Arabic titles and human review highlights.
- `output_dir` (*string*, optional, default: `./output`): Destination directory for generated files.

---

## Deliverables & Review Workflow

When the export finishes, the tool generates:

1. **`products_catalog_clean.csv`**:
   - Encoded with **UTF-8 BOM** (`\uFEFF`) to prevent Arabic text corruption when opened in Microsoft Excel or Google Sheets.
   - Contains 13 structured columns ready for GenuDo ingestion:
     - `default_id` (deterministic stable ID: `prod-{numeric_id}`)
     - `product_name` (original title)
     - `arabic_title` (Arabic name, auto-translated if missing)
     - `target_age` (extracted age guidance)
     - `category_and_tags` (category + top tags)
     - `stock_status` (`IN_STOCK (X units)` or `OUT_OF_STOCK`)
     - `price_range` (e.g. `89.00 SAR` or `45.00 - 120.00 SAR`)
     - `discount_info` (`Was 110.00 SAR (Save 21.00 SAR - 19%)` or `Regular Price`)
     - `description` (clean plain-text sales copy, stripped of HTML tags)
     - `variants_summary` (e.g. `No Options (Standard Item) | SKU: ...` or bulleted options breakdown)
     - `image_url` (featured image URL)
     - `product_url` (public customer link)
     - `admin_url` (Shopify merchant admin link)

2. **`products_knowledge_base_active.xlsx`**:
   - Dark slate headers (`#0F172A`) with bold white text and frozen top row.
   - **Soft yellow review highlight (`#FEF08A`)** on Arabic titles that were machine-translated, alerting the merchant to review/verify names before going live.
   - Green badges (`#DCFCE7`) for in-stock products and red badges (`#FEE2E2`) for out-of-stock items.
   - Clickable hyperlinks for public store links and Shopify Admin product management.
   - `wrap_text=True` applied across all cells for clean readability.

3. **`products_clean.json` & `variants_clean.csv`**:
   - Raw normalized JSON and variant-level breakdown with SKU mappings for technical review.

---

## Best Practices for GenuDo Knowledge Table Ingestion

Once the files are generated, wire them into the GenuDo agent:

### 1. Create Knowledge Table Schema
Call `create_knowledge_table` with the matching column schema:
```json
{
  "name": "shopify_product_catalog",
  "description": "Consult this table whenever a customer inquires about products, specs, sizes, colors, pricing, age recommendations, stock availability, or store links.",
  "columns": [
    "product_name",
    "arabic_title",
    "target_age",
    "category_and_tags",
    "stock_status",
    "price_range",
    "discount_info",
    "description",
    "variants_summary",
    "image_url",
    "product_url",
    "admin_url"
  ]
}
```

### 2. Ingest Points with Stable IDs
Call `upsert_knowledge_points`:
- Use the deterministic `default_id` from the CSV (e.g., `prod-1001`).
- Supplying stable IDs ensures that subsequent catalog syncs update existing records in-place without creating duplicate points.

### 3. Verify Retrieval
Test the knowledge table using `search_knowledge_table`:
- Run a query in Arabic (e.g. "كم سعر مكعبات الخشب؟").
- Run a query in English (e.g. "Do you have playmats for infants under 1 year?").
- Verify that the top result returns high semantic relevance with clean description and stock status.
