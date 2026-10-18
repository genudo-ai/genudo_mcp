const fs = require('fs');
const path = require('path');
const { cleanDescription } = require('./cleaner');

/**
 * Extracts numeric ID from Shopify GID (e.g. "gid://shopify/Product/12345" -> "12345")
 */
function extractNumericId(gid) {
  if (!gid) return '';
  const parts = String(gid).split('/');
  return parts[parts.length - 1] || '';
}

/**
 * Escapes a single CSV value according to RFC 4180 rules.
 */
function escapeCsvCell(value) {
  if (value === null || value === undefined) {
    return '';
  }

  let str = String(value);

  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    str = `"${str.split('"').join('""')}"`;
  }

  return str;
}

/**
 * Converts a list of records to CSV string with UTF-8 BOM.
 */
function generateCsv(headers, rows) {
  const BOM = '\uFEFF';
  const headerLine = headers.map((h) => escapeCsvCell(h)).join(',');

  const dataLines = rows.map((row) => {
    return headers.map((header) => escapeCsvCell(row[header])).join(',');
  });

  return BOM + [headerLine, ...dataLines].join('\n');
}

/**
 * Normalizes raw Shopify GraphQL product and variant nodes into structured, clean data.
 */
function normalizeCatalog(rawProducts, shopDomain = '') {
  const products = [];
  const allVariants = [];
  let malformedCount = 0;

  for (const raw of rawProducts) {
    const numericProductId = extractNumericId(raw.id);
    const cleanedDesc = cleanDescription(raw.description, raw.descriptionHtml);

    if (cleanedDesc.isMalformed) {
      malformedCount++;
    }

    const mediaUrls = (raw.images?.edges || [])
      .map((e) => e.node?.url)
      .filter((url) => Boolean(url));

    const productVariants = [];

    for (const vEdge of raw.variants?.edges || []) {
      const v = vEdge.node;
      const numericVariantId = extractNumericId(v.id);

      const optionsMap = {};
      const optionsParts = [];

      for (const opt of v.selectedOptions || []) {
        optionsMap[opt.name] = opt.value;
        optionsParts.push(`${opt.name}: ${opt.value}`);
      }

      const parsedPrice = parseFloat(v.price) || 0;
      const parsedCompareAt = v.compareAtPrice ? parseFloat(v.compareAtPrice) : null;

      const normalizedVariant = {
        shopify_variant_id: v.id,
        numeric_variant_id: numericVariantId,
        shopify_product_id: raw.id,
        product_title: raw.title,
        product_handle: raw.handle,
        variant_title: v.title,
        sku: v.sku || '',
        price: parsedPrice,
        compare_at_price: parsedCompareAt,
        inventory_quantity: typeof v.inventoryQuantity === 'number' ? v.inventoryQuantity : null,
        available_for_sale: Boolean(v.availableForSale),
        selected_options: optionsMap,
        selected_options_summary: optionsParts.join('; '),
        variant_image_url: v.image?.url || '',
        created_at: v.createdAt || raw.createdAt,
        updated_at: v.updatedAt || raw.updatedAt,
      };

      productVariants.push(normalizedVariant);
      allVariants.push(normalizedVariant);
    }

    const cleanDomain = shopDomain ? shopDomain.replace(/^https?:\/\//i, '').replace(/\/+$/, '') : '';
    const adminUrl = cleanDomain && numericProductId
      ? `https://${cleanDomain}/admin/products/${numericProductId}`
      : '';
    const publicUrl = raw.onlineStoreUrl || (cleanDomain && raw.handle ? `https://${cleanDomain}/products/${raw.handle}` : '');

    const normalizedProduct = {
      shopify_product_id: raw.id,
      numeric_product_id: numericProductId,
      title: raw.title,
      handle: raw.handle,
      description: cleanedDesc.text,
      vendor: raw.vendor || '',
      product_type: raw.productType || '',
      category: raw.category?.name || '',
      tags: raw.tags || [],
      tags_formatted: (raw.tags || []).join('; '),
      status: raw.status || '',
      product_url: publicUrl,
      admin_url: adminUrl,
      featured_image_url: raw.featuredImage?.url || (mediaUrls.length > 0 ? mediaUrls[0] : ''),
      media_image_urls: mediaUrls,
      created_at: raw.createdAt,
      updated_at: raw.updatedAt,
      variant_count: productVariants.length,
      has_malformed_encoding: cleanedDesc.isMalformed,
      variants: productVariants,
    };

    products.push(normalizedProduct);
  }

  return {
    products,
    variants: allVariants,
    malformedCount,
  };
}

/**
 * Writes the normalized catalog to JSON and CSV files.
 */
async function writeExportFiles(products, variants, outputDir = './output') {
  const resolvedDir = path.resolve(process.cwd(), outputDir);
  if (!fs.existsSync(resolvedDir)) {
    fs.mkdirSync(resolvedDir, { recursive: true });
  }

  const jsonPath = path.join(resolvedDir, 'products_clean.json');
  const productsCsvPath = path.join(resolvedDir, 'products_clean.csv');
  const variantsCsvPath = path.join(resolvedDir, 'variants_clean.csv');

  // 1. Write structured products_clean.json
  fs.writeFileSync(jsonPath, JSON.stringify(products, null, 2), 'utf-8');

  // 2. Write products_clean.csv
  const productHeaders = [
    'shopify_product_id',
    'numeric_product_id',
    'title',
    'handle',
    'status',
    'vendor',
    'product_type',
    'category',
    'tags',
    'description',
    'variant_count',
    'product_url',
    'admin_url',
    'featured_image_url',
    'media_image_urls',
    'created_at',
    'updated_at',
    'has_malformed_encoding',
  ];

  const productCsvRows = products.map((p) => ({
    shopify_product_id: p.shopify_product_id,
    numeric_product_id: p.numeric_product_id,
    title: p.title,
    handle: p.handle,
    status: p.status,
    vendor: p.vendor,
    product_type: p.product_type,
    category: p.category,
    tags: p.tags_formatted,
    description: p.description,
    variant_count: p.variant_count,
    product_url: p.product_url,
    admin_url: p.admin_url,
    featured_image_url: p.featured_image_url,
    media_image_urls: (p.media_image_urls || []).join('; '),
    created_at: p.created_at,
    updated_at: p.updated_at,
    has_malformed_encoding: p.has_malformed_encoding ? 'YES' : 'NO',
  }));

  const productsCsvContent = generateCsv(productHeaders, productCsvRows);
  fs.writeFileSync(productsCsvPath, productsCsvContent, 'utf-8');

  // 3. Write variants_clean.csv
  const variantHeaders = [
    'shopify_variant_id',
    'numeric_variant_id',
    'shopify_product_id',
    'product_title',
    'product_handle',
    'variant_title',
    'sku',
    'price',
    'compare_at_price',
    'inventory_quantity',
    'available_for_sale',
    'selected_options',
    'variant_image_url',
    'created_at',
    'updated_at',
  ];

  const variantCsvRows = variants.map((v) => ({
    shopify_variant_id: v.shopify_variant_id,
    numeric_variant_id: v.numeric_variant_id,
    shopify_product_id: v.shopify_product_id,
    product_title: v.product_title,
    product_handle: v.product_handle,
    variant_title: v.variant_title,
    sku: v.sku,
    price: typeof v.price === 'number' ? v.price.toFixed(2) : v.price,
    compare_at_price: v.compare_at_price !== null && v.compare_at_price !== undefined ? parseFloat(v.compare_at_price).toFixed(2) : '',
    inventory_quantity: v.inventory_quantity !== null && v.inventory_quantity !== undefined ? v.inventory_quantity : '',
    available_for_sale: v.available_for_sale ? 'TRUE' : 'FALSE',
    selected_options: v.selected_options_summary,
    variant_image_url: v.variant_image_url,
    created_at: v.created_at,
    updated_at: v.updated_at,
  }));

  const variantsCsvContent = generateCsv(variantHeaders, variantCsvRows);
  fs.writeFileSync(variantsCsvPath, variantsCsvContent, 'utf-8');

  return {
    jsonPath,
    productsCsvPath,
    variantsCsvPath,
  };
}

module.exports = {
  extractNumericId,
  escapeCsvCell,
  generateCsv,
  normalizeCatalog,
  writeExportFiles,
};
