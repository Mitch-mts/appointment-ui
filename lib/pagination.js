/**
 * Helpers for paginated API responses ({ content, page, size, totalElements, ... }).
 */

/** Extract list items from a ResponseWrapper (paginated or legacy array). */
export function getPageContent(response) {
  const data = response?.data;
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.content)) return data.content;
  return [];
}

/** Extract pagination metadata, or null for legacy array responses. */
export function getPageMeta(response) {
  const data = response?.data;
  if (!data || Array.isArray(data) || !Array.isArray(data.content)) {
    return null;
  }
  return {
    page: data.page,
    size: data.size,
    totalElements: data.totalElements,
    totalPages: data.totalPages,
    first: data.first,
    last: data.last,
  };
}

/**
 * Fetch every page from a paginated list API (for small client-owned datasets).
 * Stops when `last` is true or a page returns no content.
 */
export async function collectAllPages(fetchPage) {
  const items = [];
  let page = 0;
  let last = false;

  while (!last) {
    const response = await fetchPage(page);
    if (!response?.success) break;

    const data = response.data;
    if (Array.isArray(data)) {
      return data;
    }

    const chunk = data?.content ?? [];
    items.push(...chunk);
    last = data?.last ?? chunk.length === 0;
    page += 1;
  }

  return items;
}
