/**
 * Client-side session helpers (JWT exp check only; server still validates tokens).
 */

function decodeJwtPayload(token) {
  if (!token || typeof token !== 'string') return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const padded = payload + '=='.slice(0, (4 - (payload.length % 4)) % 4);
    const base64 = padded.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = atob(base64);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

/**
 * @param {string} token
 * @param {number} skewSeconds treat token as expired this many seconds before actual exp
 */
export function isJwtExpired(token, skewSeconds = 30) {
  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload.exp !== 'number') return false;
  return Date.now() / 1000 >= payload.exp - skewSeconds;
}

export function getJwtExpMs(token) {
  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload.exp !== 'number') return null;
  return payload.exp * 1000;
}

/** Paths where we clear session but do not hard-redirect (marketing / auth forms). */
export function isAuthOptionalPath(pathname) {
  if (!pathname || pathname === '/') return true;
  if (pathname.startsWith('/login')) return true;
  if (pathname.startsWith('/register')) return true;
  if (pathname.startsWith('/get-started')) return true;
  if (pathname.startsWith('/providers')) return true;
  return false;
}

/**
 * Remove token and user from storage. Optionally send user to login (full navigation).
 */
export function clearAuthSession(options = {}) {
  const { redirectToLogin = false } = options;
  if (typeof window === 'undefined') return;
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  if (redirectToLogin) {
    window.location.href = '/login';
  }
}
