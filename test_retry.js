// Self-check for the retry/auth classification that stops the wrong-token
// retry storm. Run: node test_retry.js
process.env.GENUDO_TOKEN = 'test-token'; // required by index.js at load time
const assert = require('assert');
const { isRetryableStatus, isAuthError } = require('./index');

// 4xx is permanent for this token/request — must NOT retry (this is the storm).
for (const s of [400, 401, 403, 404, 429]) {
  assert.strictEqual(isRetryableStatus(s), false, `${s} must not be retried`);
}
// Transient — worth one more try.
for (const s of [500, 502, 503, 504]) {
  assert.strictEqual(isRetryableStatus(s), true, `${s} should be retried`);
}
// Network/timeout errors have no HTTP status — retryable.
assert.strictEqual(isRetryableStatus(undefined), true);

// Auth failures are fatal (stop reconnecting a bad token).
assert.strictEqual(isAuthError(401), true);
assert.strictEqual(isAuthError(403), true);
assert.strictEqual(isAuthError(500), false);
assert.strictEqual(isAuthError(undefined), false);

console.log('OK: retry/auth classification');
