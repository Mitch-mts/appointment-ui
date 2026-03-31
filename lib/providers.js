import { providerAPI } from './api.js';

export { providerAPI };

/** Display label: title + full name (API fields). */
export function providerDisplayName(p) {
  if (!p) return '';
  const t = (p.title || '').trim();
  const n = (p.fullName || '').trim();
  if (t && n) return `${t} ${n}`;
  return n || t || '';
}

/** Resolve a provider from an in-memory list (ids may be number or string from URLs). */
export function getProviderFromList(providers, id) {
  if (id == null || id === '') return undefined;
  const sid = String(id);
  return providers.find((p) => String(p.id) === sid);
}
