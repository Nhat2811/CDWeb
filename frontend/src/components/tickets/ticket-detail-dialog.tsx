'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Download, Mail, Phone, ShieldCheck, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TicketQRCode } from './ticket-qr-code';
import { TicketStatusBadge } from './ticket-status-badge';
import { Booking, User } from '@/types';
import { downloadTicket } from './ticket-download';

type TicketDetailDialogProps = {
  booking: Booking | null;
  user: User | null;
  onClose: () => void;
};

export function TicketDetailDialog({ booking, user, onClose }: TicketDetailDialogProps) {
  return (
    <AnimatePresence>
      {booking && (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.96, y: 18 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.96, y: 18 }}
            className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white shadow-2xl dark:bg-slate-900"
          >
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <div>
                <h2 className="text-2xl font-bold text-slate-950 dark:text-white">Chi tiết vé</h2>
                <p className="mt-1 text-sm text-slate-500">Booking #{booking._id.slice(-8).toUpperCase()}</p>
              </div>
              <Button type="button" variant="ghost" className="h-9 w-9 p-0" onClick={onClose}>
                <X size={18} />
              </Button>
            </div>

            <div className="grid gap-6 p-5 md:grid-cols-[260px_1fr]">
              <div className="flex flex-col items-center rounded-lg bg-slate-50 p-5 dark:bg-slate-800">
                <TicketQRCode value={booking.qrCode} size="lg" />
                <TicketStatusBadge status={booking.status} />
                <Button className="mt-5 w-full" onClick={() => downloadTicket(booking, user)}>
                  <Download size={17} />
                  Tải vé PDF
                </Button>
              </div>

              <div className="space-y-5">
                <section>
                  <h3 className="text-xl font-bold text-slate-950 dark:text-white">{booking.event?.title}</h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                    {new Date(booking.event?.startDate).toLocaleString('vi-VN')} · {booking.event?.location}
                  </p>
                </section>

                <InfoGrid
                  items={[
                    ['Người đặt', user?.name ?? 'Khách hàng'],
                    ['Email', user?.email ?? 'Không có'],
                    ['SĐT', user?.phone || 'Chưa cập nhật'],
                    ['Loại vé', booking.ticket?.name ?? 'N/A'],
                    ['Số lượng', `${booking.quantity}`],
                    ['Tổng tiền', `${booking.totalPrice.toLocaleString('vi-VN')}đ`],
                    ['Thời gian thanh toán', booking.status === 'paid' ? new Date(booking.createdAt).toLocaleString('vi-VN') : 'Chưa thanh toán'],
                    ['Trạng thái', booking.status],
                  ]}
                />

                <div className="rounded-lg border border-teal-100 bg-teal-50 p-4 dark:border-teal-900 dark:bg-teal-950/30">
                  <h4 className="flex items-center gap-2 font-bold text-slate-950 dark:text-white">
                    <ShieldCheck size={18} className="text-[#14b8a6]" />
                    Chính sách hoàn vé
                  </h4>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    Vé chờ thanh toán có thể hủy trực tiếp. Vé đã thanh toán cần liên hệ ban tổ chức để được hỗ trợ theo chính sách từng sự kiện.
                  </p>
                </div>

                <div className="grid gap-3 text-sm md:grid-cols-2">
                  <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <Mail size={16} className="text-[#14b8a6]" />
                    Hỗ trợ qua email trong 24h
                  </span>
                  <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <Phone size={16} className="text-[#14b8a6]" />
                    Hotline tại cổng check-in
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function InfoGrid({ items }: { items: Array<[string, string]> }) {
  return (
    <div className="grid gap-3 rounded-lg border border-slate-200 p-4 dark:border-slate-800 md:grid-cols-2">
      {items.map(([label, value]) => (
        <div key={label}>
          <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
          <p className="mt-1 font-semibold text-slate-950 dark:text-white">{value}</p>
        </div>
      ))}
    </div>
  );
}
