'use client';

import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function LandingHeroCTA() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <Link
        href={user ? '/dashboard' : '/register'}
        prefetch
        className="inline-flex items-center justify-center rounded-full bg-sky-500 px-7 py-3 text-sm font-semibold text-white shadow-md shadow-sky-200 transition hover:bg-sky-600 dark:shadow-sky-900/40"
      >
        {user ? 'Open schedule' : 'Make an appointment'}
      </Link>
      <Link
        href="/demo"
        prefetch
        className="inline-flex items-center justify-center rounded-full px-7 py-3 text-sm font-medium text-sky-700 ring-1 ring-sky-200 transition hover:bg-sky-50 dark:text-sky-300 dark:ring-sky-700 dark:hover:bg-sky-950/50"
      >
        Watch how it works
      </Link>
    </div>
  );
}
