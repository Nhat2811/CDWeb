import { CheckCircle2, TicketIcon } from 'lucide-react';
import clsx from 'clsx';
import { Ticket } from '@/types';

const benefits: Record<string, string[]> = {
  Standard: ['Ghế khu tiêu chuẩn', 'Check-in QR nhanh', 'Tham gia toàn bộ chương trình'],
  VIP: ['Ghế khu VIP', 'Ưu tiên check-in', 'Quà tặng sự kiện'],
  VVIP: ['Khu vực VVIP', 'Gặp gỡ khách mời', 'Lounge riêng và quà premium'],
  'Early Bird': ['Giá ưu đãi mở bán sớm', 'Check-in QR nhanh', 'Số lượng giới hạn'],
};

type TicketTypeSelectProps = {
  tickets: Ticket[];
  selectedId: string;
  onChange: (ticketId: string) => void;
};

export function getTicketBenefits(name?: string) {
  return benefits[name ?? ''] ?? ['Check-in bằng QR code', 'Hỗ trợ tại cổng sự kiện'];
}

export function TicketTypeSelect({ tickets, selectedId, onChange }: TicketTypeSelectProps) {
  return (
    <div className="space-y-3">
      {tickets.map((ticket) => {
        const remaining = Math.max(ticket.quantity - ticket.sold, 0);
        const active = ticket._id === selectedId;
        return (
          <button
            key={ticket._id}
            type="button"
            disabled={remaining === 0}
            onClick={() => onChange(ticket._id)}
            className={clsx(
              'w-full rounded-lg border p-4 text-left transition duration-200',
              active
                ? 'border-[#14b8a6] bg-teal-50 ring-2 ring-teal-100 dark:bg-teal-950/40 dark:ring-teal-900'
                : 'border-slate-200 bg-white hover:border-teal-200 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800',
              remaining === 0 && 'cursor-not-allowed opacity-55',
            )}
          >
            <span className="flex items-start justify-between gap-3">
              <span>
                <span className="flex items-center gap-2 font-bold text-slate-950 dark:text-white">
                  <TicketIcon size={17} className="text-[#14b8a6]" />
                  {ticket.name}
                </span>
                <span className="mt-1 block text-sm text-slate-500">
                  Còn {remaining} vé
                </span>
              </span>
              <span className="text-right">
                <span className="block font-bold text-slate-950 dark:text-white">
                  {ticket.price.toLocaleString('vi-VN')}đ
                </span>
                {active && <CheckCircle2 className="ml-auto mt-1 text-[#14b8a6]" size={18} />}
              </span>
            </span>
            <ul className="mt-3 grid gap-1 text-xs text-slate-600 dark:text-slate-300">
              {getTicketBenefits(ticket.name).map((benefit) => (
                <li key={benefit} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#14b8a6]" />
                  {benefit}
                </li>
              ))}
            </ul>
          </button>
        );
      })}
    </div>
  );
}
