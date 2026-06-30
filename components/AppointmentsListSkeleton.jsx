/** Inline skeleton for the appointments list area (avoids full-page spinner flash). */
export default function AppointmentsListSkeleton() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="h-9 w-48 rounded-lg bg-slate-200 dark:bg-slate-700" />
          <div className="mt-3 h-5 w-72 rounded bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="h-10 w-40 rounded-lg bg-slate-200 dark:bg-slate-700" />
      </div>
      <div className="card mb-6 h-14" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card h-28" />
        ))}
      </div>
    </div>
  );
}
