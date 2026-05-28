'use client';

import { motion } from 'framer-motion';
import { CalendarClock, CreditCard, Download, Eye, MapPin, RotateCcw, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Booking, User } from '@/types';
import { TicketQRCode } from './ticket-qr-code';
import { TicketStatusBadge } from './ticket-status-badge';
import { downloadTicket } from './ticket-download';

const fallbackImage =
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=80';

type TicketCardProps = {
  booking: Booking;
  user: User | null;
  onViewDetail: (booking: Booking) => void;
  onCancel: (booking: Booking) => void;
  onPay: (booking: Booking) => void;
};

export function TicketCard({ booking, user, onViewDetail, onCancel, onPay }: TicketCardProps) {
  const event = booking.event;
  const canCancel = booking.status === 'pending';
  const canPay = booking.status === 'pending';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 14 }}
      transition={{ duration: 0.22 }}
    >
      <Card className="overflow-hidden transition duration-200 hover:-translate-y-0.5 hover:shadow-lg">
        <div className="grid gap-4 p-4 md:grid-cols-[220px_minmax(0,1fr)_220px] md:p-5">
          <div className="relative overflow-hidden rounded-lg">
            <img className="h-52 w-full object-cover md:h-full" src={event?.image || fallbackImage} alt={event?.title ?? 'Event'} />
            <div className="absolute left-3 top-3">
              <TicketStatusBadge status={booking.status} />
            </div>
          </div>

          <div className="min-w-0 space-y-4">
            <div>
              <h2 className="line-clamp-2 text-2xl font-extrabold text-slate-950 dark:text-white">{event?.title}</h2>
              <p className="mt-2 text-sm font-semibold text-[#14b8a6]">{booking.ticket?.name} · Booking #{booking._id.slice(-8).toUpperCase()}</p>
            </div>

            <div className="grid gap-3 text-sm text-slate-600 dark:text-slate-300">
              <span className="flex items-center gap-2">
                <CalendarClock size={17} className="text-[#14b8a6]" />
                {event?.startDate ? new Date(event.startDate).toLocaleString('vi-VN') : 'Chưa có thời gian'}
              </span>
              <span className="flex items-center gap-2">
                <MapPin size={17} className="text-[#14b8a6]" />
                {event?.location ?? 'Chưa có địa điểm'}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={() => onViewDetail(booking)}>
                <Eye size={16} />
                Xem chi tiết
              </Button>
              <Button type="button" variant="outline" onClick={() => downloadTicket(booking, user)}>
                <Download size={16} />
                Tải vé PDF
              </Button>
              {canPay && (
                <Button type="button" onClick={() => onPay(booking)}>
                  <CreditCard size={16} />
                  Thanh toán tiếp
                </Button>
              )}
              {canCancel && (
                <Button type="button" variant="danger" onClick={() => onCancel(booking)}>
                  <XCircle size={16} />
                  Hủy vé
                </Button>
              )}
            </div>
          </div>

          <div className="flex flex-col items-center justify-between gap-4 rounded-lg bg-slate-50 p-4 dark:bg-slate-800 md:items-end">
            <div className="w-full text-left md:text-right">
              <p className="text-sm text-slate-500">Tổng tiền</p>
              <p className="text-2xl font-extrabold text-slate-950 dark:text-white">{booking.totalPrice.toLocaleString('vi-VN')}đ</p>
              <p className="mt-1 text-sm text-slate-500">Số lượng: {booking.quantity}</p>
            </div>
            <TicketQRCode value={booking.qrCode} />
            <button
              type="button"
              className="flex items-center gap-2 text-sm font-semibold text-[#14b8a6] hover:text-teal-700"
              onClick={() => onViewDetail(booking)}
            >
              <RotateCcw size={15} />
              QR check-in
            </button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
