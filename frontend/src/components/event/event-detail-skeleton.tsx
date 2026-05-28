export function EventDetailSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
      <div className="space-y-6">
        <div className="h-[520px] animate-pulse rounded-lg bg-white shadow-soft ring-1 ring-sky-100 dark:bg-slate-900" />
        <div className="h-40 animate-pulse rounded-lg bg-white shadow-soft ring-1 ring-sky-100 dark:bg-slate-900" />
        <div className="h-56 animate-pulse rounded-lg bg-white shadow-soft ring-1 ring-sky-100 dark:bg-slate-900" />
      </div>
      <div className="h-[620px] animate-pulse rounded-lg bg-white shadow-soft ring-1 ring-sky-100 dark:bg-slate-900" />
    </div>
  );
}
