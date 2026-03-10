'use client';

import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function AuthPageLayout({ children }) {
  const { user } = useAuth();

  return (
    <div className="relative min-h-screen overflow-hidden bg-sky-50 text-slate-900">
      {/* Soft illustration-style background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -left-32 h-72 w-72 rounded-full bg-blue-100 blur-3xl" />
        <div className="absolute top-32 -right-24 h-80 w-80 rounded-full bg-cyan-100 blur-3xl" />
        <div className="absolute bottom-[-80px] left-12 h-72 w-72 rounded-full bg-indigo-100 blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-white to-blue-50" />
      </div>

      {/* Top navigation (matches home page) */}
      <header className="relative z-10 border-b border-slate-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-500 shadow-lg shadow-sky-200">
              <span className="text-lg font-semibold text-white">AB</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-wide text-slate-900">
                Appointment Booking
              </span>
              <span className="text-xs text-slate-500">Online scheduling platform</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden rounded-full px-4 py-2 text-sm font-medium text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-50 hover:text-slate-900 sm:inline-block"
            >
              Sign in
            </Link>
            <Link
              href={user ? '/dashboard' : '/register'}
              className="rounded-full bg-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-sky-200 transition hover:bg-sky-600"
            >
              {user ? 'Go to dashboard' : 'Book now'}
            </Link>
          </div>
        </div>
      </header>

      {/* Centered auth card area */}
      <main className="relative z-10">
        <section className="mx-auto flex max-w-6xl items-center justify-center px-4 pb-16 pt-10 sm:px-6 lg:px-8">
          <div className="w-full max-w-md">{children}</div>
        </section>
      </main>
    </div>
  );
}

