import { isJwtExpired } from './authSession';

/** Read cached user from localStorage when token is still valid. */
export function readCachedSessionUser() {
  if (typeof window === 'undefined') return null;
  try {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (!token || !savedUser || isJwtExpired(token)) return null;
    const parsed = JSON.parse(savedUser);
    return parsed?.email ? parsed : null;
  } catch {
    return null;
  }
}

/** Whether we can show the app shell immediately without waiting on auth init. */
export function hasCachedSession() {
  return readCachedSessionUser() != null;
}

/**
 * Normalize GET /users/me — backend may return User directly or ResponseWrapper.
 */
export function normalizeUserFromApi(body) {
  if (!body || typeof body !== 'object') return null;
  if (body.success === true && body.data?.email) return body.data;
  if (body.email) return body;
  return null;
}
