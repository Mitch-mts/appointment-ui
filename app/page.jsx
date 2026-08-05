import Image from 'next/image';
import { Calendar, Users, Shield } from 'lucide-react';
import ColorModeToggle from '../components/ColorModeToggle.jsx';
import LandingRoutePrefetch from '../components/LandingRoutePrefetch.jsx';
import LandingAuthRedirect from '../components/LandingAuthRedirect.jsx';
import LandingHeaderActions from '../components/LandingHeaderActions.jsx';
import LandingHeroCTA from '../components/LandingHeroCTA.jsx';

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-sky-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <LandingRoutePrefetch />
      <LandingAuthRedirect />

      {/* Full-bleed entry wallpaper */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <Image
          src="/background-wallpaper.jpeg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-sky-50/70 dark:bg-slate-950/75" />
        <div className="absolute inset-0 bg-gradient-to-br from-white/45 via-sky-50/35 to-blue-50/40 dark:from-slate-950/45 dark:via-slate-900/40 dark:to-slate-950/50" />
      </div>

      {/* Top navigation */}
      <header className="relative z-10 border-b border-slate-100 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-500 shadow-lg shadow-sky-200 dark:shadow-sky-900/50">
              <span className="text-lg font-semibold text-white">AB</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-wide text-slate-900 dark:text-slate-100">
                Appointment Booking
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Online scheduling platform
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <ColorModeToggle />
            <LandingHeaderActions />
          </div>
        </div>
      </header>

      {/* Hero section */}
      <main className="relative z-10">
        <section className="mx-auto flex max-w-6xl flex-col gap-12 px-4 pb-16 pt-10 sm:px-6 sm:pt-16 lg:flex-row lg:items-center lg:pb-24 lg:pt-20 lg:px-8">
          {/* Left column: copy */}
          <div className="max-w-xl space-y-6">
            <p className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700 ring-1 ring-sky-100 dark:bg-sky-950/60 dark:text-sky-300 dark:ring-sky-800">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Easy online appointment booking
            </p>
            <h1 className="text-balance text-4xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 sm:text-5xl md:text-[2.9rem]">
              Schedule your next{' '}
              <span className="text-sky-600 dark:text-sky-400">appointment</span>{' '}
              in just a few clicks.
            </h1>
            <p className="text-pretty text-sm leading-relaxed text-slate-600 dark:text-slate-300 sm:text-base">
              Pick a time that works for you. See real-time availability, get instant
              confirmation, and receive friendly reminders so you never miss an
              appointment.
            </p>

            <LandingHeroCTA />

            <dl className="mt-4 grid grid-cols-3 gap-4 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
              <div>
                <dt className="font-semibold text-slate-800 dark:text-slate-200">24/7 booking</dt>
                <dd className="mt-1">Patients schedule anytime, on any device.</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-800 dark:text-slate-200">Reduced no‑shows</dt>
                <dd className="mt-1">Automatic email & SMS reminders.</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-800 dark:text-slate-200">For every practice</dt>
                <dd className="mt-1">Clinics, salons, consultants and more.</dd>
              </div>
            </dl>
          </div>

          {/* Right column: illustrative marketing image */}
          <div className="flex-1">
            <div className="relative mx-auto max-w-md">
              {/* Floating decorative circle behind image */}
              <div className="absolute -top-10 -right-10 h-28 w-28 rounded-full bg-sky-100 dark:bg-sky-900/50" />

              <div className="relative overflow-hidden rounded-3xl shadow-xl shadow-sky-100 dark:shadow-sky-950/80">
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
          className="border-t border-slate-100 bg-white/80 py-8 text-slate-700 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300"
        >
          <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-sky-50 text-sky-500 dark:bg-sky-950/80 dark:text-sky-400">
                <Calendar className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Smart scheduling
                </p>
                <p className="text-sm">
                  Syncs with your calendar and prevents double‑bookings automatically.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-sky-50 text-sky-500 dark:bg-sky-950/80 dark:text-sky-400">
                <Shield className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Secure & private
                </p>
                <p className="text-sm">
                  Patient data is protected with role‑based access and encryption.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-sky-50 text-sky-500 dark:bg-sky-950/80 dark:text-sky-400">
                <Users className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
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
