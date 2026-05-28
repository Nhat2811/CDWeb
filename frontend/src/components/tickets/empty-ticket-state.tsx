import Link from 'next/link';
import { CalendarSearch, Ticket } from 'lucide-react';

export function EmptyTicketState() {
  return (
    <div className="rounded-lg border border-dashed border-teal-200 bg-white p-10 text-center shadow-soft dark:border-teal-900 dark:bg-slate-900">
      <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-teal-50 text-[#14b8a6] dark:bg-teal-950">
        <Ticket size={42} />
      </div>
      <h2 className="mt-5 text-2xl font-bold text-slate-950 dark:text-white">Bạn chưa đặt vé nào</h2>
      <p className="mx-auto mt-2 max-w-md text-slate-500">
        Khám phá các sự kiện đang mở bán và lưu vé QR check-in ngay trong tài khoản của bạn.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center justify-center gap-2 rounded bg-[#14b8a6] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-600"
      >
          <CalendarSearch size={18} />
          Khám phá sự kiện
      </Link>
    </div>
  );
}
