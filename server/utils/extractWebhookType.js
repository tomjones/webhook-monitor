/**
 * Extract webhook type from body or headers
 * Checks common locations used by popular webhook providers
 */
function extractWebhookType(body, headers) {
  // Normalize body (might be string, object, or null)
  const parsedBody = typeof body === 'string'
    ? tryParseJSON(body)
    : body;

  // Try common body fields (priority order)
  if (parsedBody?.type) return String(parsedBody.type);
  if (parsedBody?.event) return String(parsedBody.event);
  if (parsedBody?.event_type) return String(parsedBody.event_type);
  if (parsedBody?.action) return String(parsedBody.action);
  if (parsedBody?.kind) return String(parsedBody.kind);

  // Normalize headers (case-insensitive)
  const lowerHeaders = Object.keys(headers || {}).reduce((acc, key) => {
    acc[key.toLowerCase()] = headers[key];
    return acc;
  }, {});

  // Try common headers
  if (lowerHeaders['x-github-event']) return String(lowerHeaders['x-github-event']);
  if (lowerHeaders['x-shopify-topic']) return String(lowerHeaders['x-shopify-topic']);
  if (lowerHeaders['x-event-type']) return String(lowerHeaders['x-event-type']);
  if (lowerHeaders['x-event-name']) return String(lowerHeaders['x-event-name']);

  // Default
  return 'unknown';
}

function tryParseJSON(str) {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

module.exports = { extractWebhookType };
