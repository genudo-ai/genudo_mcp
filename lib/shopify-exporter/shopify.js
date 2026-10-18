const { getAccessToken, normalizeShopDomain, sanitizeLog, loadShopifyConfig } = require('./auth');

/**
 * Sleep helper for rate limiting and backoff
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

class ShopifyGraphQLClient {
  constructor(customConfig = {}, fetchImpl = null) {
    this.config = loadShopifyConfig(customConfig);
    this.fetchFn = fetchImpl || globalThis.fetch || require('node-fetch');

    const domain = normalizeShopDomain(this.config.shop);
    const version = this.config.apiVersion || '2026-10';
    this.graphqlEndpoint = `https://${domain}/admin/api/${version}/graphql.json`;
  }

  /**
   * Executes a GraphQL query against Shopify Admin GraphQL API with automatic
   * token resolution, throttling management, and exponential backoff retry.
   */
  async executeGraphQL(query, variables = {}, maxRetries = 5) {
    let attempt = 0;
    let lastError = null;

    while (attempt < maxRetries) {
      attempt++;
      try {
        const token = await getAccessToken(this.config, this.fetchFn);

        const response = await this.fetchFn(this.graphqlEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': token,
            Accept: 'application/json',
          },
          body: JSON.stringify({ query, variables }),
        });

        // Handle HTTP Rate Limiting (429)
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After');
          const waitTimeMs = retryAfter
            ? parseFloat(retryAfter) * 1000
            : Math.pow(2, attempt) * 1000;
          await sleep(waitTimeMs);
          continue;
        }

        // Handle server side transient errors (500, 502, 503, 504)
        if (response.status >= 500) {
          const waitTimeMs = Math.pow(2, attempt) * 1000;
          await sleep(waitTimeMs);
          continue;
        }

        const rawText = await response.text();
        let jsonResponse;

        try {
          jsonResponse = JSON.parse(rawText);
        } catch {
          throw new Error(
            `Shopify GraphQL returned non-JSON response (HTTP ${response.status}): ${rawText.slice(0, 300)}`
          );
        }

        // Check if GraphQL response indicates throttling error
        if (jsonResponse.errors && jsonResponse.errors.some((e) => e.extensions?.code === 'THROTTLED')) {
          const waitTimeMs = Math.pow(2, attempt) * 1500;
          await sleep(waitTimeMs);
          continue;
        }

        // Inspect extensions.cost for rate limit self-regulation
        if (jsonResponse.extensions?.cost) {
          await this.handleCostThrottle(jsonResponse.extensions.cost);
        }

        return jsonResponse;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        const isNetworkError =
          lastError.message.includes('fetch failed') ||
          lastError.message.includes('ETIMEDOUT') ||
          lastError.message.includes('ECONNRESET');

        if (isNetworkError && attempt < maxRetries) {
          const waitTimeMs = Math.pow(2, attempt) * 1000;
          await sleep(waitTimeMs);
          continue;
        }

        throw new Error(
          sanitizeLog(lastError.message, [this.config.clientSecret, this.config.accessToken])
        );
      }
    }

    throw new Error(
      `Shopify GraphQL request failed after ${maxRetries} attempts: ${sanitizeLog(
        lastError?.message || 'Unknown error',
        [this.config.clientSecret, this.config.accessToken]
      )}`
    );
  }

  /**
   * Evaluates GraphQL cost extension and sleeps if available credit is getting low.
   */
  async handleCostThrottle(cost) {
    const { requestedQueryCost, throttleStatus } = cost;
    if (!throttleStatus) return;

    const { currentlyAvailable, restoreRate } = throttleStatus;
    const buffer = 50; // Safety buffer to avoid 429 threshold

    if (currentlyAvailable < requestedQueryCost + buffer && restoreRate > 0) {
      const deficit = requestedQueryCost + buffer - currentlyAvailable;
      const sleepSeconds = Math.ceil(deficit / restoreRate);
      const sleepMs = Math.min(Math.max(sleepSeconds * 1000, 500), 10000);
      await sleep(sleepMs);
    }
  }

  /**
   * Tests the Shopify connection:
   * 1. Validates authentication token.
   * 2. Retrieves store name, myshopify domain, and primary domain.
   * 3. Confirms read_products permission with a minimal product read.
   */
  async testConnection() {
    const storeQuery = `
      query TestStoreConnection {
        shop {
          name
          myshopifyDomain
          primaryDomain {
            url
            host
          }
          plan {
            displayName
          }
        }
      }
    `;

    let shopResponse;
    try {
      shopResponse = await this.executeGraphQL(storeQuery);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        productAccessGranted: false,
        message: `Connection failed: ${sanitizeLog(msg, [this.config.clientSecret, this.config.accessToken])}`,
      };
    }

    if (shopResponse.errors && shopResponse.errors.length > 0) {
      const errorMsg = shopResponse.errors.map((e) => e.message).join('; ');
      return {
        success: false,
        productAccessGranted: false,
        message: `Shopify GraphQL Error during store verification: ${errorMsg}`,
      };
    }

    const shop = shopResponse.data?.shop;
    if (!shop) {
      return {
        success: false,
        productAccessGranted: false,
        message: 'Shopify response succeeded but returned empty shop details.',
      };
    }

    // Step 2: Validate Product Access Scope (read_products)
    const productScopeCheck = `
      query CheckProductScope {
        products(first: 1) {
          edges {
            node {
              id
              title
            }
          }
        }
      }
    `;

    try {
      const productResponse = await this.executeGraphQL(productScopeCheck);

      if (productResponse.errors && productResponse.errors.length > 0) {
        const errorMsg = productResponse.errors.map((e) => e.message).join('; ');
        const isPermissionError =
          errorMsg.toLowerCase().includes('access denied') ||
          errorMsg.toLowerCase().includes('scope') ||
          errorMsg.toLowerCase().includes('permission');

        return {
          success: true,
          shop: {
            name: shop.name,
            myshopifyDomain: shop.myshopifyDomain,
            primaryDomainUrl: shop.primaryDomain?.url,
            planDisplayName: shop.plan?.displayName,
          },
          productAccessGranted: false,
          message: isPermissionError
            ? `Store authenticated ("${shop.name}"), but product access is DENIED. Missing "read_products" scope.\n` +
              'Ensure the Shopify App or Custom App has the "read_products" scope granted.'
            : `Store authenticated ("${shop.name}"), but product check returned error: ${errorMsg}`,
        };
      }

      return {
        success: true,
        shop: {
          name: shop.name,
          myshopifyDomain: shop.myshopifyDomain,
          primaryDomainUrl: shop.primaryDomain?.url,
          planDisplayName: shop.plan?.displayName,
        },
        productAccessGranted: true,
        message: `Authentication successful! Connected to store "${shop.name}" (${shop.myshopifyDomain}). Product read access is verified.`,
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        success: true,
        shop: {
          name: shop.name,
          myshopifyDomain: shop.myshopifyDomain,
          primaryDomainUrl: shop.primaryDomain?.url,
          planDisplayName: shop.plan?.displayName,
        },
        productAccessGranted: false,
        message: `Store authenticated ("${shop.name}"), but product check failed: ${sanitizeLog(msg, [this.config.clientSecret, this.config.accessToken])}`,
      };
    }
  }

  /**
   * Fetches all products from Shopify using cursor-based pagination.
   */
  async fetchAllProducts(options = {}) {
    const { limit, activeOnly = false, onProgress } = options;
    const pageSize = 100;
    const queryFilter = activeOnly ? 'status:ACTIVE' : null;

    const productsQuery = `
      query FetchProductsCatalog($first: Int!, $after: String, $query: String) {
        products(first: $first, after: $after, query: $query) {
          pageInfo {
            hasNextPage
            endCursor
          }
          edges {
            cursor
            node {
              id
              title
              handle
              description
              descriptionHtml
              vendor
              productType
              category {
                id
                name
              }
              tags
              status
              onlineStoreUrl
              featuredImage {
                url
                altText
              }
              images(first: 100) {
                pageInfo {
                  hasNextPage
                  endCursor
                }
                edges {
                  node {
                    url
                    altText
                    width
                    height
                  }
                }
              }
              variants(first: 100) {
                pageInfo {
                  hasNextPage
                  endCursor
                }
                edges {
                  node {
                    id
                    title
                    sku
                    price
                    compareAtPrice
                    inventoryQuantity
                    availableForSale
                    selectedOptions {
                      name
                      value
                    }
                    image {
                      url
                    }
                    createdAt
                    updatedAt
                  }
                }
              }
              createdAt
              updatedAt
            }
          }
        }
      }
    `;

    const allProducts = [];
    let hasNextPage = true;
    let cursor = null;
    let pageCount = 0;

    while (hasNextPage) {
      pageCount++;

      if (limit && allProducts.length >= limit) {
        break;
      }

      const remainingNeeded = limit ? limit - allProducts.length : pageSize;
      const currentBatchSize = Math.min(pageSize, remainingNeeded);

      onProgress?.({
        page: pageCount,
        fetchedProducts: allProducts.length,
        message: `Fetching product page ${pageCount} (cursor: ${cursor ? cursor.slice(-8) : 'start'})...`,
      });

      const response = await this.executeGraphQL(productsQuery, {
        first: currentBatchSize,
        after: cursor,
        query: queryFilter,
      });

      if (response.errors && response.errors.length > 0) {
        const errorMsg = response.errors.map((e) => e.message).join('; ');
        throw new Error(`Shopify GraphQL error while fetching products: ${errorMsg}`);
      }

      const productsData = response.data?.products;
      if (!productsData) {
        throw new Error('Shopify GraphQL returned empty data structure while paginating products.');
      }

      for (const edge of productsData.edges) {
        let productNode = edge.node;

        // Check if product has more than 100 variants
        if (productNode.variants && productNode.variants.pageInfo && productNode.variants.pageInfo.hasNextPage) {
          productNode = await this.fetchAllVariantsForProduct(productNode);
        }

        // Check if product has more than 100 images
        if (productNode.images && productNode.images.pageInfo && productNode.images.pageInfo.hasNextPage) {
          productNode = await this.fetchAllImagesForProduct(productNode);
        }

        allProducts.push(productNode);

        if (limit && allProducts.length >= limit) {
          break;
        }
      }

      hasNextPage = productsData.pageInfo.hasNextPage;
      cursor = productsData.pageInfo.endCursor;

      if (!cursor) {
        hasNextPage = false;
      }
    }

    onProgress?.({
      page: pageCount,
      fetchedProducts: allProducts.length,
      message: `Completed catalog retrieval. Total products fetched: ${allProducts.length}.`,
    });

    return allProducts;
  }

  /**
   * Paginates remaining variants for products with more than 100 variants.
   */
  async fetchAllVariantsForProduct(product) {
    let hasNextPage = product.variants.pageInfo.hasNextPage;
    let cursor = product.variants.pageInfo.endCursor;
    const variantEdges = [...product.variants.edges];

    const variantsSubquery = `
      query FetchProductVariants($id: ID!, $after: String!) {
        product(id: $id) {
          variants(first: 100, after: $after) {
            pageInfo {
              hasNextPage
              endCursor
            }
            edges {
              node {
                id
                title
                sku
                price
                compareAtPrice
                inventoryQuantity
                availableForSale
                selectedOptions {
                  name
                  value
                }
                image {
                  url
                }
                createdAt
                updatedAt
              }
            }
          }
        }
      }
    `;

    while (hasNextPage && cursor) {
      const response = await this.executeGraphQL(variantsSubquery, {
        id: product.id,
        after: cursor,
      });

      const nextVariants = response.data?.product?.variants;
      if (!nextVariants) break;

      variantEdges.push(...nextVariants.edges);
      hasNextPage = nextVariants.pageInfo.hasNextPage;
      cursor = nextVariants.pageInfo.endCursor;
    }

    return {
      ...product,
      variants: {
        pageInfo: {
          hasNextPage: false,
          endCursor: cursor,
        },
        edges: variantEdges,
      },
    };
  }

  /**
   * Paginates remaining images for products with more than 100 images.
   */
  async fetchAllImagesForProduct(product) {
    let hasNextPage = product.images.pageInfo.hasNextPage;
    let cursor = product.images.pageInfo.endCursor;
    const imageEdges = [...product.images.edges];

    const imagesSubquery = `
      query FetchProductImages($id: ID!, $after: String!) {
        product(id: $id) {
          images(first: 100, after: $after) {
            pageInfo {
              hasNextPage
              endCursor
            }
            edges {
              node {
                url
                altText
                width
                height
              }
            }
          }
        }
      }
    `;

    while (hasNextPage && cursor) {
      const response = await this.executeGraphQL(imagesSubquery, {
        id: product.id,
        after: cursor,
      });

      const nextImages = response.data?.product?.images;
      if (!nextImages) break;

      imageEdges.push(...nextImages.edges);
      hasNextPage = nextImages.pageInfo.hasNextPage;
      cursor = nextImages.pageInfo.endCursor;
    }

    return {
      ...product,
      images: {
        pageInfo: {
          hasNextPage: false,
          endCursor: cursor,
        },
        edges: imageEdges,
      },
    };
  }
}

module.exports = {
  ShopifyGraphQLClient,
  sleep,
};
