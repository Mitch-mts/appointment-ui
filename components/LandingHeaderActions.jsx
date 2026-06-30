'use client';

import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function LandingHeaderActions() {
  const { user } = useAuth();

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <Link
        href="/login"
        prefetch
        className="hidden rounded-full px-4 py-2 text-sm font-medium text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:ring-slate-600 dark:hover:bg-slate-800 dark:hover:text-white sm:inline-block"
      >
        Sign in
      </Link>
      <Link
        href={user ? '/dashboard' : '/register'}
        prefetch
        className="rounded-full bg-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-sky-200 transition hover:bg-sky-600 dark:shadow-sky-900/40"
      >
        {user ? 'Go to dashboard' : 'Book now'}
      </Link>
    </div>
  );
}
