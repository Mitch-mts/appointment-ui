'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Calendar, Users, Shield } from 'lucide-react';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // If the user is already authenticated, send them to the dashboard,
  // otherwise keep them on the marketing landing page.
  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-sky-50 text-slate-900">
      {/* Soft illustration-style background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -left-32 h-72 w-72 rounded-full bg-blue-100 blur-3xl" />
        <div className="absolute top-32 -right-24 h-80 w-80 rounded-full bg-cyan-100 blur-3xl" />
        <div className="absolute bottom-[-80px] left-12 h-72 w-72 rounded-full bg-indigo-100 blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-white to-blue-50" />
      </div>

      {/* Top navigation */}
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

      {/* Hero section */}
      <main className="relative z-10">
        <section className="mx-auto flex max-w-6xl flex-col gap-12 px-4 pb-16 pt-10 sm:px-6 sm:pt-16 lg:flex-row lg:items-center lg:pb-24 lg:pt-20 lg:px-8">
          {/* Left column: copy */}
          <div className="max-w-xl space-y-6">
            <p className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700 ring-1 ring-sky-100">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Easy online appointment booking
            </p>
            <h1 className="text-balance text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl md:text-[2.9rem]">
              Schedule your next{' '}
              <span className="text-sky-600">appointment</span>{' '}
              in just a few clicks.
            </h1>
            <p className="text-pretty text-sm leading-relaxed text-slate-600 sm:text-base">
              Let your clients choose the time that works best for them. Real‑time
              availability, instant confirmations and friendly reminders keep everyone on
              track.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link
                href={user ? '/dashboard' : '/register'}
                className="inline-flex items-center justify-center rounded-full bg-sky-500 px-7 py-3 text-sm font-semibold text-white shadow-md shadow-sky-200 transition hover:bg-sky-600"
              >
                {user ? 'Open schedule' : 'Make an appointment'}
              </Link>
              <button className="inline-flex items-center justify-center rounded-full px-7 py-3 text-sm font-medium text-sky-700 ring-1 ring-sky-200 transition hover:bg-sky-50">
                Watch how it works
              </button>
            </div>

            <dl className="mt-4 grid grid-cols-3 gap-4 text-xs text-slate-500 sm:text-sm">
              <div>
                <dt className="font-semibold text-slate-800">24/7 booking</dt>
                <dd className="mt-1">Patients schedule anytime, on any device.</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-800">Reduced no‑shows</dt>
                <dd className="mt-1">Automatic email & SMS reminders.</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-800">For every practice</dt>
                <dd className="mt-1">Clinics, salons, consultants and more.</dd>
              </div>
            </dl>
          </div>

          {/* Right column: illustrative marketing image */}
          <div className="flex-1">
            <div className="relative mx-auto max-w-md">
              {/* Floating decorative circle behind image */}
              <div className="absolute -top-10 -right-10 h-28 w-28 rounded-full bg-sky-100" />

              <div className="relative overflow-hidden rounded-3xl shadow-xl shadow-sky-100">
                <Image
                  src="/ab-appointments.png"
                  alt="People booking and managing appointments"
                  width={800}
                  height={600}
                  className="h-auto w-full object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        {/* Feature strip below hero */}
        <section
          id="features"
          className="border-t border-slate-100 bg-white/80 py-8 text-slate-700 backdrop-blur"
        >
          <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-sky-50 text-sky-500">
                <Calendar className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Smart scheduling
                </p>
                <p className="text-sm">
                  Syncs with your calendar and prevents double‑bookings automatically.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-sky-50 text-sky-500">
                <Shield className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Secure & private
                </p>
                <p className="text-sm">
                  Patient data is protected with role‑based access and encryption.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-sky-50 text-sky-500">
                <Users className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Better experience
                </p>
                <p className="text-sm">
                  A clean, friendly interface that looks great on desktop and mobile.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
