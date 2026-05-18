export default function AuthFormSkeleton() {
  return (
    <div
      className="animate-pulse rounded-3xl border border-slate-200 bg-white p-8 shadow-lg dark:border-slate-700 dark:bg-slate-900"
      aria-hidden
    >
      <div className="mx-auto mb-6 h-8 w-40 rounded-lg bg-slate-200 dark:bg-slate-700" />
      <div className="mb-4 h-4 w-56 rounded bg-slate-100 dark:bg-slate-800" />
      <div className="space-y-4">
        <div className="h-14 rounded-lg bg-slate-100 dark:bg-slate-800" />
        <div className="h-14 rounded-lg bg-slate-100 dark:bg-slate-800" />
        <div className="mt-6 h-12 rounded-full bg-slate-200 dark:bg-slate-700" />
      </div>
    </div>
  );
}
