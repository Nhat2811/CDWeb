'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, TicketCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Booking } from '@/types';

type PaymentSuccessDialogProps = {
  booking: Booking;
  open: boolean;
  onGoToTickets: () => void;
};

export function PaymentSuccessDialog({ booking, open, onGoToTickets }: PaymentSuccessDialogProps) {
  if (!open) return null;

  return (
    <motion.div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        initial={{ scale: 0.96, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.96, y: 16 }}
        className="w-full max-w-md rounded-lg bg-white p-5 shadow-2xl dark:bg-slate-900"
      >
        <div className="grid h-14 w-14 place-items-center rounded-full bg-teal-50 text-[#14b8a6]">
          <CheckCircle2 size={30} />
        </div>
        <h2 className="mt-4 text-2xl font-extrabold text-slate-950 dark:text-white">Thanh toán thành công</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Booking #{booking._id.slice(-8).toUpperCase()} đã được cập nhật sang trạng thái paid. QR code vé đã sẵn sàng trong Vé của tôi.
        </p>

        {booking.qrCode && (
          <div className="mt-5 flex justify-center rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800">
            <img className="h-40 w-40 rounded-lg bg-white p-2" src={booking.qrCode} alt="QR code vé" />
          </div>
        )}

        <Button type="button" className="mt-5 h-11 w-full" onClick={onGoToTickets}>
          <TicketCheck size={18} />
          Đến Vé của tôi
        </Button>
      </motion.div>
    </motion.div>
  );
}
