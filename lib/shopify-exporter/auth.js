const fs = require('fs');
const path = require('path');
const os = require('os');

function isUsableValue(val) {
  return typeof val === 'string' && val.trim() !== '' && !val.includes('${');
}

function parseEnvFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) return;
    const content = fs.readFileSync(filePath, 'utf8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        let val = trimmed.slice(eqIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!(key in process.env) && isUsableValue(val)) {
          process.env[key] = val;
        }
      }
    }
  } catch (e) {
    // Ignore error reading file
  }
}

function parseJsonConfig(filePath) {
  try {
    if (!fs.existsSync(filePath)) return;
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (data.shop && !process.env.SHOPIFY_SHOP) process.env.SHOPIFY_SHOP = data.shop;
    if (data.access_token && !process.env.SHOPIFY_ACCESS_TOKEN) process.env.SHOPIFY_ACCESS_TOKEN = data.access_token;
    if (data.client_id && !process.env.SHOPIFY_CLIENT_ID) process.env.SHOPIFY_CLIENT_ID = data.client_id;
    if (data.client_secret && !process.env.SHOPIFY_CLIENT_SECRET) process.env.SHOPIFY_CLIENT_SECRET = data.client_secret;
    if (data.api_version && !process.env.SHOPIFY_API_VERSION) process.env.SHOPIFY_API_VERSION = data.api_version;
  } catch (e) {
    // Ignore
  }
}

function tryLoadEnv() {
  // 1. Current working directory .env
  parseEnvFile(path.resolve(process.cwd(), '.env'));

  // 2. GENUDO_WORKDIR .env (if set)
  if (process.env.GENUDO_WORKDIR && isUsableValue(process.env.GENUDO_WORKDIR)) {
    parseEnvFile(path.resolve(process.env.GENUDO_WORKDIR, '.env'));
  }

  // 3. User global config directory (~/.config/genudo/.env and ~/.config/genudo/shopify.json)
  const userConfigDir = path.join(os.homedir(), '.config', 'genudo');
  parseEnvFile(path.join(userConfigDir, '.env'));
  parseJsonConfig(path.join(userConfigDir, 'shopify.json'));
}

tryLoadEnv();

const ENV_PREFILL_TEMPLATE = [
  "# In your project's .env file (gitignored)",
  "SHOPIFY_SHOP=your-store.myshopify.com",
  "SHOPIFY_CLIENT_ID=your_client_id_here",
  "SHOPIFY_CLIENT_SECRET=your_client_secret_here"
].join('\n');

/**
 * Ensures a .env file exists and is prefilled with the Shopify credentials template,
 * and ensures .env is listed in .gitignore.
 */
function ensureEnvPrefilled(targetDir = process.cwd()) {
  try {
    const envPath = path.resolve(targetDir, '.env');
    let wasCreated = false;
    let wasAppended = false;

    if (!fs.existsSync(envPath)) {
      fs.writeFileSync(envPath, ENV_PREFILL_TEMPLATE + '\n', 'utf8');
      wasCreated = true;
    } else {
      const existing = fs.readFileSync(envPath, 'utf8');
      if (!existing.includes('SHOPIFY_CLIENT_ID') && !existing.includes('SHOPIFY_ACCESS_TOKEN')) {
        const separator = existing.endsWith('\n') ? '' : '\n';
        fs.appendFileSync(envPath, separator + '\n' + ENV_PREFILL_TEMPLATE + '\n', 'utf8');
        wasAppended = true;
      }
    }

    // Ensure .env is gitignored
    const gitignorePath = path.resolve(targetDir, '.gitignore');
    if (fs.existsSync(gitignorePath)) {
      const gitignore = fs.readFileSync(gitignorePath, 'utf8');
      if (!/(^|\n)\.env(\n|$)/.test(gitignore)) {
        const sep = gitignore.endsWith('\n') ? '' : '\n';
        fs.appendFileSync(gitignorePath, sep + '.env\n', 'utf8');
      }
    }

    return {
      success: true,
      envPath,
      wasCreated,
      wasAppended,
      template: ENV_PREFILL_TEMPLATE,
    };
  } catch (err) {
    return {
      success: false,
      error: err.message,
    };
  }
}

/**
 * In-memory token cache to prevent requesting tokens on every single query
 */
let memoryTokenCache = null;

/**
 * Resets the in-memory token cache (useful for testing)
 */
function resetTokenCache() {
  memoryTokenCache = null;
}

/**
 * Sanitizes messages or error strings to ensure secrets and access tokens are NEVER leaked.
 */
function sanitizeLog(message, secrets = []) {
  if (!message) return '';
  let sanitized = String(message);
  for (const secret of secrets) {
    if (secret && typeof secret === 'string' && secret.length >= 4) {
      sanitized = sanitized.split(secret).join('***REDACTED***');
    }
  }
  // Generic pattern for Shopify tokens (shpat_..., shpca_..., shppa_..., etc.)
  sanitized = sanitized.replace(/shp[a-z]{2}_[a-zA-Z0-9_-]{16,}/g, '***REDACTED_SHOPIFY_TOKEN***');
  return sanitized;
}

/**
 * Normalizes shop domain to hostname (removes https://, trailing slashes, etc.)
 */
function normalizeShopDomain(rawShop) {
  if (!rawShop) return '';
  let cleaned = String(rawShop).trim();
  cleaned = cleaned.replace(/^https?:\/\//i, '');
  cleaned = cleaned.replace(/\/+$/, '');
  return cleaned;
}

/**
 * Validates and extracts Shopify configuration from passed args or environment variables.
 */
function loadShopifyConfig(customConfig = {}) {
  const shop = (
    customConfig.shop ||
    customConfig.shop_domain ||
    process.env.SHOPIFY_SHOP ||
    ''
  ).trim();

  const apiVersion = (
    customConfig.apiVersion ||
    customConfig.api_version ||
    process.env.SHOPIFY_API_VERSION ||
    '2026-10'
  ).trim();

  const clientId = (
    customConfig.clientId ||
    customConfig.client_id ||
    process.env.SHOPIFY_CLIENT_ID ||
    ''
  ).trim();

  const clientSecret = (
    customConfig.clientSecret ||
    customConfig.client_secret ||
    process.env.SHOPIFY_CLIENT_SECRET ||
    ''
  ).trim();

  const accessToken = (
    customConfig.accessToken ||
    customConfig.access_token ||
    process.env.SHOPIFY_ACCESS_TOKEN ||
    ''
  ).trim();

  return {
    shop,
    apiVersion,
    clientId,
    clientSecret,
    accessToken,
  };
}

/**
 * Obtains an access token using Client Credentials Grant or returns an existing configured access token.
 * Caches tokens in-memory according to Shopify's expires_in response.
 */
async function getAccessToken(config, fetchImpl) {
  const currentConfig = loadShopifyConfig(config);
  const fetchFn = fetchImpl || globalThis.fetch || require('node-fetch');

  // Mode 2: Existing Admin API Access Token
  if (currentConfig.accessToken) {
    return currentConfig.accessToken;
  }

  // Check if we have a valid non-expired cached token
  const now = Date.now();
  if (memoryTokenCache && memoryTokenCache.expiresAt > now + 60 * 1000) {
    return memoryTokenCache.token;
  }

  // Mode 1: Client Credentials Grant
  const { shop, clientId, clientSecret } = currentConfig;

  if (!shop) {
    throw new Error(
      'Missing shop domain. Please provide "shop_domain" parameter or set SHOPIFY_SHOP in environment.'
    );
  }

  if (!clientId || !clientSecret) {
    throw new Error(
      'No valid Shopify authentication credentials found.\n' +
        'Please provide either:\n' +
        '  - "access_token" (Shopify Admin API Access Token, e.g. shpat_...)\n' +
        '  - or "client_id" & "client_secret" (Shopify App Client Credentials Grant)\n' +
        'You can pass these as tool arguments or set SHOPIFY_ACCESS_TOKEN / SHOPIFY_CLIENT_ID in environment.'
    );
  }

  const normalizedDomain = normalizeShopDomain(shop);
  const tokenEndpoint = `https://${normalizedDomain}/admin/oauth/access_token`;

  const bodyParams = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
  });

  let response;
  try {
    response = await fetchFn(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: bodyParams.toString(),
    });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    throw new Error(
      `Failed to connect to Shopify token endpoint (${tokenEndpoint}): ${sanitizeLog(errorMsg, [
        clientSecret,
        clientId,
      ])}`
    );
  }

  const responseText = await response.text();
  let data;

  try {
    data = JSON.parse(responseText);
  } catch {
    throw new Error(
      `Shopify token endpoint returned non-JSON response (HTTP ${response.status}): ${sanitizeLog(
        responseText.slice(0, 300),
        [clientSecret, clientId]
      )}`
    );
  }

  if (!response.ok || !data.access_token) {
    const errorDetail = JSON.stringify(data);
    const sanitizedDetail = sanitizeLog(errorDetail, [clientSecret, clientId]);

    if (response.status === 400 || response.status === 401) {
      throw new Error(
        `Shopify Client Credentials Grant failed (HTTP ${response.status}): ${sanitizedDetail}\n` +
          'Troubleshooting tips:\n' +
          '1. Client Credentials Grant requires that the Shopify App and the Store belong to the same Shopify Organization.\n' +
          '2. Verify that the Client ID and Client Secret match the credentials in Shopify Dev Dashboard -> Apps -> Credentials.\n' +
          '3. If the app belongs to a different organization, generate and use an Admin API Access Token ("access_token") instead.'
      );
    }

    throw new Error(
      `Shopify authentication request failed with HTTP ${response.status}: ${sanitizedDetail}`
    );
  }

  const expiresInSeconds = typeof data.expires_in === 'number' ? data.expires_in : 86400;
  const bufferSeconds = Math.min(60, Math.floor(expiresInSeconds / 10));
  const expiresAt = now + (expiresInSeconds - bufferSeconds) * 1000;

  memoryTokenCache = {
    token: data.access_token,
    expiresAt,
    scope: data.scope || '',
  };

  return memoryTokenCache.token;
}

module.exports = {
  resetTokenCache,
  sanitizeLog,
  normalizeShopDomain,
  loadShopifyConfig,
  getAccessToken,
  ensureEnvPrefilled,
  ENV_PREFILL_TEMPLATE,
};
