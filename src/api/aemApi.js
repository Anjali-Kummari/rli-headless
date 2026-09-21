const GRAPHQL_URL = import.meta.env.VITE_AEM_GRAPHQL_URL;
const AUTH_USER = import.meta.env.VITE_AEM_AUTH_USER;
const AUTH_PASS = import.meta.env.VITE_AEM_AUTH_PASS;

function buildHeaders() {
  const headers = { Accept: 'application/json' };
  if (AUTH_USER && AUTH_PASS) {
    headers['Authorization'] = `Basic ${btoa(`${AUTH_USER}:${AUTH_PASS}`)}`;
  }
  return headers;
}

/**
 * Fetches all Content Fragments from the AEM persisted GraphQL query.
 * Returns the raw `data` object from the GraphQL response so callers
 * can navigate to the correct list key (e.g. data.personalUmbrellaList.items).
 */
export async function fetchContentFragments() {
  if (!GRAPHQL_URL) {
    throw new Error('VITE_AEM_GRAPHQL_URL is not set. Check your .env file.');
  }

  let response;
  try {
    response = await fetch(GRAPHQL_URL, { headers: buildHeaders() });
  } catch (networkError) {
    console.error('[AEM] Network error:', networkError);
    throw new Error('Network error — could not reach the AEM endpoint.');
  }

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    console.error(`[AEM] HTTP ${response.status}:`, text);
    if (response.status === 401) {
      throw new Error(
        'AEM returned 401 Unauthorized. Set VITE_AEM_AUTH_USER and VITE_AEM_AUTH_PASS in your .env file.'
      );
    }
    throw new Error(`AEM request failed with status ${response.status}.`);
  }

  let json;
  try {
    json = await response.json();
  } catch {
    throw new Error('AEM returned a non-JSON response.');
  }

  if (json.errors?.length) {
    console.error('[AEM] GraphQL errors:', json.errors);
    throw new Error(json.errors.map((e) => e.message).join(' | '));
  }

  if (!json.data) {
    throw new Error('AEM response contained no data field.');
  }

  return json.data;
}

/**
 * Extracts the items array from the GraphQL data object.
 * AEM persisted queries wrap results under a dynamic key, e.g.:
 *   data.personalUmbrellaList.items
 * This helper finds the first key whose value has an `items` array.
 */
export function extractItems(data) {
  for (const key of Object.keys(data)) {
    if (data[key] && Array.isArray(data[key].items)) {
      return data[key].items;
    }
  }
  // Fallback: if data itself is an array
  if (Array.isArray(data)) return data;
  return [];
}
