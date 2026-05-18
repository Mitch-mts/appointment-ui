'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  LayoutDashboard,
  LogIn,
  Play,
  UserPlus,
} from 'lucide-react';
import ColorModeToggle from '../../components/ColorModeToggle.jsx';

const STEPS = [
  {
    id: 'signup',
    title: 'Create your account',
    subtitle: 'Sign up in seconds as a client to start booking.',
    icon: UserPlus,
  },
  {
    id: 'login',
    title: 'Sign in',
    subtitle: 'Log in with your email and password to access your dashboard.',
    icon: LogIn,
  },
  {
    id: 'dashboard',
    title: 'See your dashboard',
    subtitle: 'View upcoming visits and book new appointments from one place.',
    icon: LayoutDashboard,
  },
  {
    id: 'book',
    title: 'Pick a provider & time',
    subtitle: 'Choose who you want to see, then select an open slot on the calendar.',
    icon: Calendar,
  },
  {
    id: 'confirm',
    title: 'Review & confirm',
    subtitle: 'Check your details, add notes if needed, and confirm the booking.',
    icon: CheckCircle2,
  },
  {
    id: 'done',
    title: 'Instant confirmation',
    subtitle: 'Get a reference number and reminders so everyone stays on schedule.',
    icon: Clock,
  },
];

const DEMO = {
  user: { name: 'Alex Morgan', email: 'alex@example.com' },
  provider: 'Dr. Sarah Chen',
  date: 'Thursday, May 22, 2026',
  time: '10:30 AM',
  reference: 'AB-2026-4831',
  times: ['9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '2:00 PM'],
  upcoming: [
    { title: 'Annual check-up', when: 'May 22 · 10:30 AM', status: 'Confirmed' },
    { title: 'Follow-up visit', when: 'Jun 5 · 2:00 PM', status: 'Confirmed' },
  ],
};

function StepIndicator({ current, onGoTo }) {
  return (
    <ol className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
      {STEPS.map((step, index) => {
        const isActive = index === current;
        const isComplete = index < current;
        return (
          <li key={step.id} className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => onGoTo(index)}
              className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold transition ${
                isActive
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-200 dark:shadow-sky-900/40'
                  : isComplete
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                    : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
              }`}
              aria-label={`Step ${index + 1}: ${step.title}`}
              aria-current={isActive ? 'step' : undefined}
            >
              {isComplete ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
            </button>
            {index < STEPS.length - 1 && (
              <ChevronRight className="hidden h-4 w-4 text-slate-300 dark:text-slate-600 sm:block" />
            )}
          </li>
        );
      })}
    </ol>
  );
}

function DemoField({ label, value, highlight, placeholder }) {
  return (
    <div className="mb-3">
      <p className="mb-1 text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
      <div
        className={`rounded-lg border px-3 py-2 text-sm ${
          highlight
            ? 'border-sky-200 bg-sky-50 font-medium text-sky-800 dark:border-sky-800 dark:bg-sky-950/50 dark:text-sky-200'
            : value
              ? 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
              : 'border-slate-200 bg-white text-slate-400 dark:border-slate-700 dark:bg-slate-900'
        }`}
      >
        {value || placeholder || label}
      </div>
    </div>
  );
}

function DemoCalendar() {
  const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const cells = Array.from({ length: 35 }, (_, i) => {
    const day = i - 2;
    if (day < 1 || day > 31) return null;
    return day;
  });

  return (
    <>
      <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs text-slate-400">
        {days.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) =>
          day === null ? (
            <span key={`empty-${i}`} />
          ) : (
            <span
              key={day}
              className={`flex h-8 items-center justify-center rounded-lg text-xs ${
                day === 22
                  ? 'bg-sky-500 font-semibold text-white'
                  : day > 18 && day < 28
                    ? 'bg-slate-100 font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200'
                    : 'text-slate-400'
              }`}
            >
              {day}
            </span>
          )
        )}
      </div>
    </>
  );
}

function MockSignup() {
  return (
    <div className="mx-auto max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-700 dark:bg-slate-900">
      <p className="mb-4 text-center text-sm font-medium text-slate-500 dark:text-slate-400">
        Create account
      </p>
      <div className="space-y-3">
        <DemoField label="Full name" placeholder="Alex Morgan" />
        <DemoField label="Email address" placeholder="alex@example.com" />
        <DemoField label="Password" placeholder="••••••••" />
        <div className="mt-4 rounded-full bg-sky-500 py-2.5 text-center text-sm font-semibold text-white">
          Create account
        </div>
      </div>
      <p className="mt-4 text-center text-xs text-slate-500 dark:text-slate-400">
        Already have an account?{' '}
        <span className="font-medium text-sky-600 dark:text-sky-400">Sign in</span>
      </p>
    </div>
  );
}

function MockLogin() {
  return (
    <div className="mx-auto max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-700 dark:bg-slate-900">
      <p className="mb-4 text-center text-sm font-medium text-slate-500 dark:text-slate-400">
        Sign in
      </p>
      <div className="space-y-3">
        <DemoField label="Email address" placeholder="alex@example.com" />
        <DemoField label="Password" placeholder="••••••••" />
        <div className="mt-4 rounded-full bg-sky-500 py-2.5 text-center text-sm font-semibold text-white">
          Sign in
        </div>
      </div>
      <p className="mt-4 text-center text-xs text-slate-500 dark:text-slate-400">
        New here?{' '}
        <span className="font-medium text-sky-600 dark:text-sky-400">Create an account</span>
      </p>
    </div>
  );
}

function MockDashboard() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-lg dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
          Welcome back, {DEMO.user.name.split(' ')[0]}
        </p>
        <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-700 dark:bg-sky-900/50 dark:text-sky-300">
          Demo
        </span>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-sky-50 px-4 py-3 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300">
          <p className="text-2xl font-semibold">2</p>
          <p className="text-xs font-medium opacity-80">Upcoming</p>
        </div>
        <div className="rounded-xl bg-indigo-50 px-4 py-3 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
          <p className="text-2xl font-semibold">3</p>
          <p className="text-xs font-medium opacity-80">This month</p>
        </div>
      </div>
      <div className="mt-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Upcoming appointments
        </p>
        <ul className="space-y-2">
          {DEMO.upcoming.map((apt) => (
            <li
              key={apt.title}
              className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5 dark:bg-slate-800/80"
            >
              <div>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{apt.title}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{apt.when}</p>
              </div>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                {apt.status}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-4 flex justify-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-sky-500 px-5 py-2 text-sm font-semibold text-white">
          <Calendar className="h-4 w-4" />
          Book appointment
        </span>
      </div>
    </div>
  );
}

function MockBooking() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-lg dark:border-slate-700 dark:bg-slate-900">
        <p className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-100">May 2026</p>
        <DemoCalendar />
        <p className="mt-4 mb-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
          Available times — May 22
        </p>
        <div className="flex flex-wrap gap-2">
          {DEMO.times.map((t) => (
            <span
              key={t}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium ${
                t === DEMO.time
                  ? 'bg-sky-500 text-white'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              {t}
            </span>
          ))}
        </div>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-lg dark:border-slate-700 dark:bg-slate-900">
        <p className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-100">
          Appointment details
        </p>
        <DemoField label="Provider" value={DEMO.provider} highlight />
        <DemoField label="Full name" value={DEMO.user.name} />
        <DemoField label="Email" value={DEMO.user.email} />
        <DemoField label="Notes (optional)" value="First visit — please send intake forms." />
        <div className="mt-4 rounded-xl bg-sky-50 p-3 dark:bg-sky-950/50">
          <p className="text-xs text-slate-500 dark:text-slate-400">Selected slot</p>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            {DEMO.date} at {DEMO.time}
          </p>
        </div>
      </div>
    </div>
  );
}

function MockReview() {
  const rows = [
    ['Provider', DEMO.provider],
    ['Patient', DEMO.user.name],
    ['Email', DEMO.user.email],
    ['Date', DEMO.date],
    ['Time', DEMO.time],
  ];

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-700 dark:bg-slate-900">
      <p className="mb-1 text-center text-lg font-semibold text-slate-900 dark:text-slate-100">
        Confirm your appointment
      </p>
      <p className="mb-5 text-center text-sm text-slate-500 dark:text-slate-400">
        Please review the details below
      </p>
      <dl className="space-y-3 text-sm">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="flex justify-between border-b border-slate-100 pb-2 dark:border-slate-800"
          >
            <dt className="text-slate-500 dark:text-slate-400">{label}</dt>
            <dd className="font-medium text-slate-800 dark:text-slate-100">{value}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-5 flex gap-3">
        <span className="flex-1 rounded-full border border-slate-200 py-2.5 text-center text-sm font-medium text-slate-600 dark:border-slate-600 dark:text-slate-300">
          Back
        </span>
        <span className="flex-1 rounded-full bg-sky-500 py-2.5 text-center text-sm font-semibold text-white">
          Confirm booking
        </span>
      </div>
    </div>
  );
}

function MockConfirmation() {
  return (
    <div className="mx-auto max-w-md rounded-2xl border border-emerald-200 bg-white p-6 text-center shadow-lg dark:border-emerald-900/50 dark:bg-slate-900">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
        <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
      </div>
      <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
        Appointment confirmed!
      </p>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        A confirmation has been sent to {DEMO.user.email}
      </p>
      <div className="mt-5 rounded-xl bg-slate-50 p-4 text-left dark:bg-slate-800/80">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Reference number
        </p>
        <p className="mt-1 font-mono text-lg font-semibold text-sky-600 dark:text-sky-400">
          {DEMO.reference}
        </p>
        <div className="mt-3 space-y-1 text-sm">
          <p className="text-slate-700 dark:text-slate-200">
            <span className="text-slate-500 dark:text-slate-400">With </span>
            {DEMO.provider}
          </p>
          <p className="text-slate-700 dark:text-slate-200">
            {DEMO.date} · {DEMO.time}
          </p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <Clock className="h-3.5 w-3.5" />
        Email & SMS reminders sent automatically
      </div>
    </div>
  );
}

function StepPreview({ stepId }) {
  switch (stepId) {
    case 'signup':
      return <MockSignup />;
    case 'login':
      return <MockLogin />;
    case 'dashboard':
      return <MockDashboard />;
    case 'book':
      return <MockBooking />;
    case 'confirm':
      return <MockReview />;
    case 'done':
      return <MockConfirmation />;
    default:
      return null;
  }
}

export default function DemoPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const step = STEPS[currentStep];
  const StepIcon = step.icon;
  const isFirst = currentStep === 0;
  const isLast = currentStep === STEPS.length - 1;

  const goNext = useCallback(() => {
    setCurrentStep((s) => Math.min(s + 1, STEPS.length - 1));
  }, []);

  const goPrev = useCallback(() => {
    setCurrentStep((s) => Math.max(s - 1, 0));
  }, []);

  const handlePlay = () => {
    if (isPlaying) return;
    setIsPlaying(true);
    setCurrentStep(0);
    let stepIndex = 0;
    const interval = setInterval(() => {
      stepIndex += 1;
      if (stepIndex >= STEPS.length) {
        clearInterval(interval);
        setIsPlaying(false);
        return;
      }
      setCurrentStep(stepIndex);
    }, 2800);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-sky-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -left-32 h-72 w-72 rounded-full bg-blue-100 blur-3xl dark:bg-sky-900/40" />
        <div className="absolute top-32 -right-24 h-80 w-80 rounded-full bg-cyan-100 blur-3xl dark:bg-indigo-900/30" />
        <div className="absolute bottom-[-80px] left-12 h-72 w-72 rounded-full bg-indigo-100 blur-3xl dark:bg-blue-900/25" />
        <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950" />
      </div>

      <header className="relative z-10 border-b border-slate-100 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
          <ColorModeToggle />
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="mb-8 text-center">
          <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700 ring-1 ring-sky-100 dark:bg-sky-950/60 dark:text-sky-300 dark:ring-sky-800">
            <Play className="h-3 w-3" />
            Interactive demo
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
            See how appointment booking works
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-slate-600 dark:text-slate-300 sm:text-base">
            Walk through the same steps your clients take — from sign-up and login to confirmed
            appointment. No account required.
          </p>
        </div>

        <div className="mb-8">
          <StepIndicator current={currentStep} onGoTo={setCurrentStep} />
        </div>

        <div className="mb-6 rounded-2xl border border-slate-100 bg-white/80 p-5 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80 sm:p-6">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-600 dark:bg-sky-900/50 dark:text-sky-400">
                <StepIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-sky-600 dark:text-sky-400">
                  Step {currentStep + 1} of {STEPS.length}
                </p>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {step.title}
                </h2>
                <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-400">{step.subtitle}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handlePlay}
              disabled={isPlaying}
              className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200 disabled:opacity-60 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <Play className="h-4 w-4" />
              {isPlaying ? 'Playing…' : 'Auto-play'}
            </button>
          </div>

          <div key={step.id} className="transition-opacity duration-300">
            <StepPreview stepId={step.id} />
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <button
            type="button"
            onClick={goPrev}
            disabled={isFirst}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 px-6 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-white disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 sm:w-auto"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </button>

          {isLast ? (
            <Link
              href="/register"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-sky-500 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-sky-200 transition hover:bg-sky-600 dark:shadow-sky-900/40 sm:w-auto"
            >
              Get started for real
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <button
              type="button"
              onClick={goNext}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-sky-500 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-sky-200 transition hover:bg-sky-600 dark:shadow-sky-900/40 sm:w-auto"
            >
              Next step
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>

        <p className="mt-8 text-center text-xs text-slate-500 dark:text-slate-400">
          This is a preview with sample data.{' '}
          <Link href="/login" className="font-medium text-sky-600 hover:underline dark:text-sky-400">
            Sign in
          </Link>{' '}
          or{' '}
          <Link
            href="/register"
            className="font-medium text-sky-600 hover:underline dark:text-sky-400"
          >
            create an account
          </Link>{' '}
          to book a real appointment.
        </p>
      </main>
    </div>
  );
}
