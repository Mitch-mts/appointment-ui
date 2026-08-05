'use client';

import Image from 'next/image';
import Navigation from './Navigation.jsx';

/** Shared page chrome so route transitions keep the same background + nav. */
export default function AppPageShell({ children }) {
  return (
    <div className="relative min-h-screen bg-sky-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Fixed wallpaper so tall pages (e.g. booking) scroll without clipping or layout twitch */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <Image
          src="/background-wallpaper.jpeg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-sky-50/80 dark:bg-slate-950/85" />
        <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-sky-50/40 to-blue-50/45 dark:from-slate-950/50 dark:via-slate-900/45 dark:to-slate-950/55" />
      </div>
      <Navigation />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
