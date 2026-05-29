import { CheckCircle2, Clock3, Loader2, XCircle } from 'lucide-react';
import { PaymentStatus } from '@/types';

const config: Record<PaymentStatus, { label: string; className: string; Icon: typeof Clock3 }> = {
  pending: {
    label: 'Chờ thanh toán',
    className: 'border-amber-200 bg-amber-50 text-amber-700',
    Icon: Clock3,
  },
  processing: {
    label: 'Đang xử lý',
    className: 'border-teal-200 bg-teal-50 text-[#0f9f8e]',
    Icon: Loader2,
  },
  paid: {
    label: 'Đã thanh toán',
    className: 'border-teal-200 bg-teal-50 text-[#0f9f8e]',
    Icon: CheckCircle2,
  },
  failed: {
    label: 'Thất bại',
    className: 'border-rose-200 bg-rose-50 text-rose-700',
    Icon: XCircle,
  },
  cancelled: {
    label: 'Đã hủy',
    className: 'border-slate-200 bg-slate-100 text-slate-600',
    Icon: XCircle,
  },
};

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const item = config[status] ?? config.pending;
  const Icon = item.Icon;

  return (
    <span className={`inline-flex items-center gap-2 rounded border px-3 py-1 text-xs font-bold uppercase ${item.className}`}>
      <Icon size={14} className={status === 'processing' ? 'animate-spin' : ''} />
      {item.label}
    </span>
  );
}
