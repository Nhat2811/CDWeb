'use client';

import { CalendarClock, LucideIcon, Mail, MapPin, Percent, Ticket } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Booking, PaymentStatus, User } from '@/types';
import { PaymentStatusBadge } from './payment-status-badge';

type PaymentSummaryProps = {
  booking: Booking;
  user: User | null;
  discountCode?: string;
  previewDiscountAmount?: number;
  status: PaymentStatus;
};

function formatCurrency(value: number) {
  return `${value.toLocaleString('vi-VN')}đ`;
}

function getBookerName(user: Booking['user'], fallback: User | null) {
  if (typeof user === 'object' && user?.name) return user.name;
  return fallback?.name ?? 'Người đặt';
}

function getBookerEmail(user: Booking['user'], fallback: User | null) {
  if (typeof user === 'object' && user?.email) return user.email;
  return fallback?.email ?? 'Chưa có email';
}

export function PaymentSummary({ booking, user, discountCode, previewDiscountAmount = 0, status }: PaymentSummaryProps) {
  const event = booking.event;
  const ticket = booking.ticket;
  const unitPrice = (typeof ticket === 'object' && ticket ? ticket.price : undefined) ?? Math.round(booking.totalPrice / Math.max(booking.quantity, 1));
  const originalAmount = unitPrice * booking.quantity;
  const discountAmount = booking.discountAmount ?? previewDiscountAmount;
  const payableAmount = booking.status === 'pending' ? Math.max(originalAmount - discountAmount, 0) : booking.totalPrice;
  const normalizedDiscount = booking.discountCode || discountCode?.trim()?.toUpperCase() || 'Không áp dụng';

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-slate-200 bg-gradient-to-r from-teal-50 via-white to-slate-50 p-5 dark:border-slate-800 dark:from-teal-950/30 dark:via-slate-900 dark:to-slate-900">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase text-[#14b8a6]">Xác nhận thanh toán</p>
            <h1 className="mt-1 text-2xl font-extrabold text-slate-950 dark:text-white md:text-3xl">
              {event?.title ?? 'Sự kiện'}
            </h1>
          </div>
          <PaymentStatusBadge status={status} />
        </div>
      </div>

      <div className="grid gap-5 p-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <InfoItem icon={Ticket} label="Loại vé" value={(typeof ticket === 'object' && ticket ? ticket.name : undefined) ?? 'Vé'} />
            <InfoItem label="Số lượng" value={`${booking.quantity} vé`} />
            <InfoItem label="Giá vé" value={formatCurrency(unitPrice)} />
            <InfoItem icon={Percent} label="Mã giảm giá" value={normalizedDiscount} />
          </div>

          <div className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-800 dark:bg-slate-800/60 sm:grid-cols-2">
            <InfoItem icon={CalendarClock} label="Thời gian" value={event?.startDate ? new Date(event.startDate).toLocaleString('vi-VN') : 'Chưa có'} compact />
            <InfoItem icon={MapPin} label="Địa điểm" value={event?.location ?? 'Chưa có'} compact />
          </div>
        </div>

        <div className="rounded-lg border border-teal-100 bg-teal-50 p-4 dark:border-teal-900 dark:bg-teal-950/30">
          <p className="text-sm font-bold uppercase text-[#14b8a6]">Thông tin người đặt</p>
          <div className="mt-4 space-y-3 text-sm">
            <div>
              <p className="text-slate-500">Họ tên</p>
              <p className="font-bold text-slate-950 dark:text-white">{getBookerName(booking.user, user)}</p>
            </div>
            <div>
              <p className="text-slate-500">Email</p>
              <p className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-200">
                <Mail size={15} className="text-[#14b8a6]" />
                {getBookerEmail(booking.user, user)}
              </p>
            </div>
            <div className="space-y-2 border-t border-teal-200 pt-3 dark:border-teal-900">
              <MoneyRow label="Tạm tính" value={originalAmount} />
              <MoneyRow label="Giảm giá" value={-discountAmount} highlight={discountAmount > 0} />
              <div className="pt-2">
                <p className="text-slate-500">Cần thanh toán</p>
                <p className="text-3xl font-extrabold text-slate-950 dark:text-white">{formatCurrency(payableAmount)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

function MoneyRow({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-slate-500">{label}</span>
      <strong className={highlight ? 'text-emerald-700' : 'text-slate-800 dark:text-slate-100'}>
        {value < 0 ? '-' : ''}
        {formatCurrency(Math.abs(value))}
      </strong>
    </div>
  );
}

function InfoItem({
  icon: Icon,
  label,
  value,
  compact,
}: {
  icon?: LucideIcon;
  label: string;
  value: string;
  compact?: boolean;
}) {
  return (
    <div className={compact ? '' : 'rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900'}>
      <p className="flex items-center gap-2 text-sm text-slate-500">
        {Icon && <Icon size={15} className="text-[#14b8a6]" />}
        {label}
      </p>
      <p className="mt-1 font-bold text-slate-950 dark:text-white">{value}</p>
    </div>
  );
}
