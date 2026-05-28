import clsx from 'clsx';
import { HTMLAttributes } from 'react';

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: 'teal' | 'slate' | 'amber' | 'rose';
};

export function Badge({ className, tone = 'teal', ...props }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold',
        tone === 'teal' && 'bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-200',
        tone === 'slate' && 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
        tone === 'amber' && 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-200',
        tone === 'rose' && 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-200',
        className,
      )}
      {...props}
    />
  );
}
