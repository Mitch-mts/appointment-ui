'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext.jsx';
import { hasCachedSession } from '../lib/sessionUser.js';

/**
 * Redirect unauthenticated users without flashing a full-page spinner when
 * a cached session already exists.
 */
export function useRequireAuth(options = {}) {
  const { redirectTo = '/login', adminOnly = false } = options;
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace(redirectTo);
      return;
    }
    if (adminOnly && !isAdmin) {
      router.replace('/dashboard');
    }
  }, [user, loading, isAdmin, adminOnly, redirectTo, router]);

  const showAuthSpinner = loading && !user && !hasCachedSession();
  const ready = Boolean(user) && (!adminOnly || isAdmin);

  return { user, loading, isAdmin, showAuthSpinner, ready };
}
