/**
 * Text cleaner and HTML stripper for Shopify product catalogs.
 * Preserves clean paragraphs, bullet points, and Arabic & English text.
 */

const HTML_ENTITIES = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&apos;': "'",
  '&nbsp;': ' ',
  '&copy;': '©',
  '&reg;': '®',
  '&trade;': '™',
  '&bull;': '•',
  '&ndash;': '–',
  '&mdash;': '—',
  '&euro;': '€',
  '&pound;': '£',
  '&yen;': '¥',
  '&cent;': '¢',
  '&hellip;': '…',
  '&laquo;': '«',
  '&raquo;': '»',
  '&times;': '×',
  '&divide;': '÷',
  '&plusmn;': '±',
  '&deg;': '°',
  '&micro;': 'µ',
  '&middot;': '·',
  '&para;': '¶',
  '&sect;': '§',
};

/**
 * Decodes numeric (decimal and hex) and named HTML entities.
 */
function decodeHtmlEntities(input) {
  if (!input) return '';

  let decoded = input;

  for (const [entity, replacement] of Object.entries(HTML_ENTITIES)) {
    decoded = decoded.split(entity).join(replacement);
  }

  // Replace numeric entities: decimal &#123;
  decoded = decoded.replace(/&#([0-9]{1,7});/g, (_match, dec) => {
    try {
      const code = parseInt(dec, 10);
      return String.fromCodePoint(code);
    } catch {
      return _match;
    }
  });

  // Replace numeric entities: hex &#x1F44D;
  decoded = decoded.replace(/&#x([0-9a-fA-F]{1,6});/g, (_match, hex) => {
    try {
      const code = parseInt(hex, 16);
      return String.fromCodePoint(code);
    } catch {
      return _match;
    }
  });

  return decoded;
}

/**
 * Detects if string contains malformed UTF-8, replacement characters, or mojibake indicators.
 */
function detectMalformedEncoding(input) {
  const reasons = [];

  // Unicode replacement character U+FFFD (often rendered as )
  if (input.includes('\uFFFD')) {
    reasons.push('Contains Unicode replacement character (U+FFFD)');
  }

  // Common UTF-8 mojibake patterns caused by double-encoding (e.g. latin1 decoded as UTF-8)
  const mojibakeArabicRegex = /(?:Ø§|Ø¨|Øª|Ø«|Ø¬|Ø­|Ø®|Ø¯|Ø°|Ø±|Ø²|Ø³|Ø´|Øµ|Ø¶|Ø·|Ø¸|Ø¹|Øº|Ù |Ù‚|Ùƒ|Ù„|Ù…|Ù†|Ù‡|Ùˆ|ÙŠ)/;
  if (mojibakeArabicRegex.test(input)) {
    reasons.push('Likely mojibake double-encoded Arabic text (detected byte-scrambled UTF-8 sequences)');
  }

  return {
    isMalformed: reasons.length > 0,
    reasons,
  };
}

/**
 * Strips HTML tags and preserves paragraph and bullet structure.
 */
function stripHtmlTags(html) {
  if (!html) return '';

  let text = html;

  // Replace script and style tags completely with their contents removed
  text = text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

  // Handle line breaks
  text = text.replace(/<br\s*\/?>/gi, '\n');

  // Handle block elements by appending double newlines
  text = text.replace(/<\/(p|div|h[1-6]|section|article)>/gi, '\n\n');

  // Handle list items
  text = text.replace(/<li[^>]*>/gi, '• ');
  text = text.replace(/<\/li>/gi, '\n');
  text = text.replace(/<\/(ul|ol)>/gi, '\n');

  // Handle tables
  text = text.replace(/<\/tr>/gi, '\n');
  text = text.replace(/<(td|th)[^>]*>/gi, ' ');
  text = text.replace(/<\/(td|th)>/gi, ' ');
  text = text.replace(/<\/table>/gi, '\n');

  // Remove any remaining HTML tags
  text = text.replace(/<[^>]+>/g, '');

  return text;
}

/**
 * Normalizes excessive whitespace and preserves intentional line breaks.
 */
function normalizeWhitespace(input) {
  if (!input) return '';

  // Decode entities first
  let cleaned = decodeHtmlEntities(input);

  // Normalize Windows CRLF and Mac CR to LF
  cleaned = cleaned.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // Replace non-breaking spaces with standard space
  cleaned = cleaned.replace(/\u00A0/g, ' ');

  // Split into lines to trim per line
  const lines = cleaned.split('\n').map((line) => {
    const noTabs = line.replace(/\t/g, '  ');
    return noTabs.trimEnd();
  });

  cleaned = lines.join('\n');

  // Collapse 3 or more consecutive newlines into 2 (clean paragraph break)
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

  return cleaned.trim();
}

/**
 * Cleans a Shopify product description.
 * Prefers Shopify's native plain-text `description` field.
 * Falls back to stripping `descriptionHtml` only if plain `description` is empty.
 * Checks for malformed encoding without mutating legitimate text.
 */
function cleanDescription(description, descriptionHtml) {
  const plain = (description || '').trim();
  const html = (descriptionHtml || '').trim();

  let rawCandidate = '';

  if (plain.length > 0) {
    if (/<[a-z][\s\S]*>/i.test(plain)) {
      rawCandidate = stripHtmlTags(plain);
    } else {
      rawCandidate = plain;
    }
  } else if (html.length > 0) {
    rawCandidate = stripHtmlTags(html);
  }

  const cleanText = normalizeWhitespace(rawCandidate);
  const encodingCheck = detectMalformedEncoding(cleanText);

  return {
    text: cleanText,
    isMalformed: encodingCheck.isMalformed,
    malformedReasons: encodingCheck.reasons,
  };
}

module.exports = {
  decodeHtmlEntities,
  detectMalformedEncoding,
  stripHtmlTags,
  normalizeWhitespace,
  cleanDescription,
};
