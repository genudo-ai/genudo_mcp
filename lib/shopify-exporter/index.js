const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const { ShopifyGraphQLClient } = require('./shopify');
const { normalizeCatalog, writeExportFiles, generateCsv } = require('./export');
const { normalizeShopDomain, ensureEnvPrefilled, ENV_PREFILL_TEMPLATE } = require('./auth');

/**
 * Runs the Python script to format Excel knowledge base and generate the active CSV.
 */
function runPythonExcelGenerator(jsonPath, excelPath, csvPath, shopDomain, activeOnly) {
  return new Promise((resolve) => {
    const scriptPath = path.join(__dirname, 'generate_active_excel.py');
    const pythonBin = process.env.PYTHON_BIN || 'python3';

    const args = [
      scriptPath,
      jsonPath,
      excelPath,
      csvPath,
      shopDomain || '',
      String(activeOnly),
    ];

    const child = spawn(pythonBin, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (d) => { stdout += d.toString(); });
    child.stderr.on('data', (d) => { stderr += d.toString(); });

    child.on('close', (code) => {
      if (code === 0) {
        resolve({ success: true, stdout, stderr });
      } else {
        resolve({ success: false, code, stdout, stderr });
      }
    });

    child.on('error', (err) => {
      resolve({ success: false, error: err.message, stdout, stderr });
    });
  });
}

/**
 * Fallback generator for products_catalog_clean.csv using pure JavaScript.
 */
function generateFallbackActiveCsv(products, csvPath) {
  const headers = [
    'default_id',
    'product_name',
    'arabic_title',
    'target_age',
    'category_and_tags',
    'stock_status',
    'price_range',
    'discount_info',
    'description',
    'variants_summary',
    'image_url',
    'product_url',
    'admin_url',
  ];

  const rows = products.map((p) => {
    const defaultId = `prod-${p.numeric_product_id || p.shopify_product_id.split('/').pop()}`;
    const variants = p.variants || [];
    const inStock = variants.some((v) => v.available_for_sale);
    const stockStatus = inStock ? 'IN_STOCK' : 'OUT_OF_STOCK';

    const prices = variants.map((v) => v.price).filter((pr) => pr !== null && pr !== undefined);
    let priceRange = '';
    if (prices.length > 0) {
      const minP = Math.min(...prices);
      const maxP = Math.max(...prices);
      priceRange = minP === maxP ? `${minP.toFixed(2)} SAR` : `${minP.toFixed(2)} - ${maxP.toFixed(2)} SAR`;
    }

    const varSummary = variants.length === 1
      ? `No Options (Standard Item) | SKU: ${variants[0].sku || 'NO-SKU'}`
      : `Variants (${variants.length}): ${variants.map((v) => v.variant_title).join(', ')}`;

    return {
      default_id: defaultId,
      product_name: p.title,
      arabic_title: p.title, // fallback un-translated
      target_age: 'All Ages',
      category_and_tags: `Category: ${p.category || p.product_type || 'General'} | Tags: ${p.tags_formatted}`,
      stock_status: stockStatus,
      price_range: priceRange,
      discount_info: 'Regular Price',
      description: p.description,
      variants_summary: varSummary,
      image_url: p.featured_image_url || '',
      product_url: p.product_url || '',
      admin_url: p.admin_url || '',
    };
  });

  const csvContent = generateCsv(headers, rows);
  fs.mkdirSync(path.dirname(csvPath), { recursive: true });
  fs.writeFileSync(csvPath, csvContent, 'utf-8');
}

/**
 * Main function to export Shopify product catalog into clean CSV, JSON, and formatted Excel.
 */
async function exportShopifyCatalog(options = {}) {
  const startTimeMs = Date.now();

  const shopDomain = (options.shop_domain || options.shop || process.env.SHOPIFY_SHOP || '').trim();
  if (!shopDomain) {
    throw new Error('Missing required parameter "shop_domain" (e.g. "your-store.myshopify.com").');
  }

  const activeOnly = options.active_only !== undefined ? Boolean(options.active_only) : true;
  const generateExcel = options.generate_excel !== undefined ? Boolean(options.generate_excel) : true;
  const outputDir = options.output_dir || './output';

  const resolvedOutputDir = path.resolve(process.cwd(), outputDir);
  if (!fs.existsSync(resolvedOutputDir)) {
    fs.mkdirSync(resolvedOutputDir, { recursive: true });
  }

  const clientConfig = {
    shop: shopDomain,
    accessToken: options.access_token,
    clientId: options.client_id,
    clientSecret: options.client_secret,
  };

  const client = new ShopifyGraphQLClient(clientConfig);

  // 1. Validate connection and scopes early
  const testRes = await client.testConnection();
  if (!testRes.success || !testRes.productAccessGranted) {
    throw new Error(testRes.message || 'Failed to authenticate with Shopify.');
  }

  const storeName = testRes.shop?.name || shopDomain;
  const myshopifyDomain = testRes.shop?.myshopifyDomain || normalizeShopDomain(shopDomain);

  // 2. Fetch products
  const rawProducts = await client.fetchAllProducts({
    activeOnly,
    limit: options.limit,
  });

  // 3. Normalize catalog
  const { products, variants, malformedCount } = normalizeCatalog(rawProducts, myshopifyDomain);

  // 4. Write base JSON & CSV files
  const baseFiles = await writeExportFiles(products, variants, resolvedOutputDir);

  // 5. Excel Knowledge Base & Active CSV
  const productsCatalogCsvPath = path.resolve(resolvedOutputDir, 'products_catalog_clean.csv');
  const productsKnowledgeBaseExcelPath = path.resolve(resolvedOutputDir, 'products_knowledge_base_active.xlsx');

  let excelGenerated = false;

  if (generateExcel) {
    const pyResult = await runPythonExcelGenerator(
      baseFiles.jsonPath,
      productsKnowledgeBaseExcelPath,
      productsCatalogCsvPath,
      myshopifyDomain,
      activeOnly
    );

    if (pyResult.success && fs.existsSync(productsKnowledgeBaseExcelPath)) {
      excelGenerated = true;
    } else {
      // Fallback: If python fails, ensure products_catalog_clean.csv is still created
      if (!fs.existsSync(productsCatalogCsvPath)) {
        generateFallbackActiveCsv(
          activeOnly ? products.filter((p) => p.status === 'ACTIVE') : products,
          productsCatalogCsvPath
        );
      }
    }
  } else {
    // If Excel generation was explicitly disabled, generate active clean CSV directly
    generateFallbackActiveCsv(
      activeOnly ? products.filter((p) => p.status === 'ACTIVE') : products,
      productsCatalogCsvPath
    );
  }

  const durationSeconds = parseFloat(((Date.now() - startTimeMs) / 1000).toFixed(2));
  const activeProducts = products.filter((p) => p.status === 'ACTIVE');

  return {
    success: true,
    storeName,
    shopDomain: myshopifyDomain,
    totalProducts: products.length,
    activeProducts: activeProducts.length,
    totalVariants: variants.length,
    malformedCount,
    durationSeconds,
    productsCatalogCsvPath,
    productsKnowledgeBaseExcelPath: excelGenerated ? productsKnowledgeBaseExcelPath : null,
    jsonPath: baseFiles.jsonPath,
    productsCsvPath: baseFiles.productsCsvPath,
    variantsCsvPath: baseFiles.variantsCsvPath,
  };
}

module.exports = {
  exportShopifyCatalog,
  ensureEnvPrefilled,
  ENV_PREFILL_TEMPLATE,
};
