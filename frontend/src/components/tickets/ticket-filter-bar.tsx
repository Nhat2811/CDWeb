import { Search } from 'lucide-react';
import { BookingStatus } from '@/types';

export type TicketStatusFilter = 'all' | BookingStatus;
export type TicketSort = 'newest' | 'oldest' | 'price-desc';

type TicketFilterBarProps = {
  search: string;
  status: TicketStatusFilter;
  sort: TicketSort;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: TicketStatusFilter) => void;
  onSortChange: (value: TicketSort) => void;
};

export function TicketFilterBar({
  search,
  status,
  sort,
  onSearchChange,
  onStatusChange,
  onSortChange,
}: TicketFilterBarProps) {
  return (
    <div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900 md:grid-cols-[1fr_220px_180px]">
      <label className="flex items-center gap-2 rounded border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800">
        <Search size={18} className="text-slate-400" />
        <input
          className="w-full border-0 bg-transparent p-0 focus:ring-0 dark:text-white"
          placeholder="Tìm theo tên sự kiện"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </label>

      <select
        className="w-full dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        value={status}
        onChange={(event) => onStatusChange(event.target.value as TicketStatusFilter)}
      >
        <option value="all">Tất cả</option>
        <option value="paid">Đã thanh toán</option>
        <option value="pending">Chờ thanh toán</option>
        <option value="cancelled">Đã hủy</option>
        <option value="used">Đã sử dụng</option>
      </select>

      <select
        className="w-full dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        value={sort}
        onChange={(event) => onSortChange(event.target.value as TicketSort)}
      >
        <option value="newest">Mới nhất</option>
        <option value="oldest">Cũ nhất</option>
        <option value="price-desc">Giá cao nhất</option>
      </select>
    </div>
  );
}
