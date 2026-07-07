'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, TicketCheck, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Booking, PaymentReceipt } from '@/types';

type PaymentSuccessDialogProps = {
  booking: Booking;
  receipt?: PaymentReceipt | null;
  open: boolean;
  onClose: () => void;
  onGoToTickets: () => void;
};

export function PaymentSuccessDialog({ booking, receipt, open, onClose, onGoToTickets }: PaymentSuccessDialogProps) {
  if (!open) return null;

  return (
    <motion.div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.96, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.96, y: 16 }}
        className="w-full max-w-md rounded-lg bg-white p-5 shadow-2xl dark:bg-slate-900"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-teal-50 text-[#14b8a6]">
            <CheckCircle2 size={30} />
          </div>
          <Button type="button" variant="ghost" className="h-9 w-9 p-0" onClick={onClose} aria-label="Đóng">
            <X size={18} />
          </Button>
        </div>
        <h2 className="mt-4 text-2xl font-extrabold text-slate-950 dark:text-white">
          {booking.status === 'paid' ? 'Thanh toán thành công' : 'Đã ghi nhận yêu cầu'}
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          {booking.status === 'paid'
            ? `Booking #${booking._id.slice(-8).toUpperCase()} đã được cập nhật sang trạng thái paid. QR code vé đã sẵn sàng trong Vé của tôi.`
            : `Booking #${booking._id.slice(-8).toUpperCase()} đã được ghi nhận. Hệ thống đang chờ thanh toán hoàn tất để cấp mã QR.`}
        </p>

        {booking.status === 'pending' && receipt && (
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            <p className="font-bold">Hướng dẫn thanh toán:</p>
            {receipt.paidAmount === 0 ? (
              <p>Bạn đã chọn phương thức thanh toán không hợp lệ.</p>
            ) : (
              <div>
                <p>
                  Nếu bạn chọn <strong>Chuyển khoản</strong>, vui lòng chuyển khoản số tiền {receipt.paidAmount.toLocaleString('vi-VN')}đ vào tài khoản:
                  <br />
                  Ngân hàng: <strong>Vietcombank</strong>
                  <br />
                  STK: <strong>123456789</strong>
                  <br />
                  Chủ TK: <strong>EVENT BOOKING</strong>
                  <br />
                  Nội dung CK: <strong>{receipt.transactionCode}</strong>
                </p>
                <div className="mt-3 mb-2 flex justify-center rounded bg-white p-3">
                  <img src={`https://img.vietqr.io/image/970436-123456789-compact2.png?amount=${receipt.paidAmount}&addInfo=${receipt.transactionCode}&accountName=EVENT%20BOOKING`} alt="Mã QR Chuyển khoản" className="h-48 w-auto" />
                </div>
              </div>
            )}
            <p className="mt-2">Nếu bạn chọn <strong>COD</strong>, vui lòng chuẩn bị sẵn tiền mặt khi tham gia sự kiện.</p>
          </div>
        )}

        {booking.status === 'paid' && receipt && (
          <div className="mt-4 rounded-lg border border-teal-100 bg-teal-50 p-3 text-sm text-slate-700">
            <p className="font-bold text-slate-950">Mã giao dịch: {receipt.transactionCode}</p>
            <p>Đã thanh toán: {receipt.paidAmount.toLocaleString('vi-VN')}đ</p>
            <p>Email xác nhận: đã gửi</p>
          </div>
        )}

        {booking.status === 'paid' && booking.qrCode && (
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
