import clsx from 'clsx';

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={clsx(
        'inline-flex rounded-full px-2.5 py-1 text-xs font-semibold',
        status === 'paid' || status === 'published'
          ? 'bg-emerald-100 text-emerald-700'
          : status === 'cancelled'
            ? 'bg-rose-100 text-rose-700'
            : 'bg-yellow-100 text-yellow-800',
      )}
    >
      {status}
    </span>
  );
}
