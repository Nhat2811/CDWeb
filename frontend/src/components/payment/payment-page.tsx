'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Loader2,
  ReceiptText,
  RefreshCcw,
  ShieldCheck,
  Tag,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useProtected } from '@/hooks/use-protected';
import { getErrorMessage } from '@/services/api';
import { checkoutPayment, getPaymentBooking, getPaymentGatewayConfig, getPaymentHistory } from '@/services/payments.service';
import { useAuth } from '@/store/auth-store';
import {
  Booking,
  PaymentCheckoutMethod,
  PaymentGatewayConfig,
  PaymentProvider,
  PaymentReceipt,
  PaymentStatus,
  PaymentTransaction,
} from '@/types';
import { PaymentMethodSelector, PaymentMethodValue } from './payment-method-selector';
import { PaymentStatusBadge } from './payment-status-badge';
import { PaymentSuccessDialog } from './payment-success-dialog';
import { PaymentSummary } from './payment-summary';

type PaymentPageProps = {
  bookingId: string;
};

type ToastState = {
  type: 'success' | 'error';
  message: string;
} | null;

const couponHints = [
  { code: 'EVENT10', label: 'Giảm 10%' },
  { code: 'VIP50', label: 'Giảm tối đa 50.000đ' },
  { code: 'STUDENT20', label: 'Giảm 20%' },
];

function formatCurrency(value: number) {
  return `${value.toLocaleString('vi-VN')}đ`;
}

function calculateDiscountPreview(subtotal: number, code: string) {
  const normalized = code.trim().toUpperCase();
  if (normalized === 'EVENT10') return Math.round(subtotal * 0.1);
  if (normalized === 'VIP50') return Math.min(50000, subtotal);
  if (normalized === 'STUDENT20') return Math.round(subtotal * 0.2);
  return 0;
}

function toPaymentStatus(status: Booking['status']): PaymentStatus {
  if (status === 'cancelled') return 'cancelled';
  if (status === 'paid' || status === 'used') return 'paid';
  return 'pending';
}

export function PaymentPage({ bookingId }: PaymentPageProps) {
  useProtected();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const initialDiscountCode = searchParams.get('discountCode') ?? '';
  const [booking, setBooking] = useState<Booking | null>(null);
  const [method, setMethod] = useState<PaymentMethodValue>('vnpay');
  const [gatewayConfig, setGatewayConfig] = useState<PaymentGatewayConfig | null>(null);
  const [discountCode, setDiscountCode] = useState(initialDiscountCode);
  const [receipt, setReceipt] = useState<PaymentReceipt | null>(null);
  const [history, setHistory] = useState<PaymentTransaction[]>([]);
  const [status, setStatus] = useState<PaymentStatus>('pending');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState<ToastState>(null);
  const [successOpen, setSuccessOpen] = useState(false);

  const subtotal = useMemo(() => {
    if (!booking) return 0;
    return (booking.ticket?.price ?? booking.totalPrice) * booking.quantity;
  }, [booking]);
  const previewDiscount = booking?.status === 'pending' ? calculateDiscountPreview(subtotal, discountCode) : booking?.discountAmount ?? 0;
  const payableAmount = Math.max(subtotal - previewDiscount, 0);
  const canPay = booking?.status === 'pending' && !processing;
  const selectedProvider = resolvePaymentMethod(method).provider;
  const selectedQrGateway =
    (selectedProvider === 'momo' || selectedProvider === 'vnpay') && gatewayConfig?.[selectedProvider]?.enabled === false;
  const normalizedDiscount = discountCode.trim().toUpperCase();
  const invalidDiscount = Boolean(normalizedDiscount) && previewDiscount === 0 && !couponHints.some((coupon) => coupon.code === normalizedDiscount);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const nextBooking = await getPaymentBooking(bookingId);
      setBooking(nextBooking);
      setStatus(toPaymentStatus(nextBooking.status));
      const [nextHistory, nextGatewayConfig] = await Promise.all([getPaymentHistory(bookingId), getPaymentGatewayConfig()]);
      setHistory(nextHistory);
      setGatewayConfig(nextGatewayConfig);
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      showToast('error', message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [bookingId]);

  function showToast(type: 'success' | 'error', message: string) {
    setToast({ type, message });
    window.setTimeout(() => setToast(null), 3200);
  }

  async function handleCheckout() {
    if (!booking || !canPay) return;
    if (selectedQrGateway) {
      const query = new URLSearchParams({
        bookingId: booking._id,
        provider: selectedProvider,
        amount: String(payableAmount),
      });
      if (normalizedDiscount) query.set('discountCode', normalizedDiscount);
      router.push(`/payments/qr?${query.toString()}`);
      return;
    }
    setProcessing(true);
    setStatus('processing');
    setError('');

    try {
      const { checkoutMethod, provider } = resolvePaymentMethod(method);
      const response = await checkoutPayment(
        booking._id,
        checkoutMethod,
        false,
        normalizedDiscount || undefined,
        provider,
      );
      if (response.paymentUrl) {
        window.location.href = response.paymentUrl;
        return;
      }
      setBooking(response.booking);
      setReceipt(response.receipt ?? null);
      setHistory(await getPaymentHistory(booking._id));
      setStatus('paid');
      setSuccessOpen(true);
      showToast('success', 'Thanh toán thành công.');
    } catch (err) {
      const message = getErrorMessage(err);
      setStatus('failed');
      setError(message);
      setHistory(await getPaymentHistory(booking._id));
      showToast('error', message);
    } finally {
      setProcessing(false);
    }
  }

  if (loading) {
    return (
      <div className="grid min-h-[calc(100vh-140px)] place-items-center">
        <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-5 py-4 font-semibold text-slate-700 shadow-soft dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100">
          <Loader2 className="animate-spin text-[#14b8a6]" size={22} />
          Đang tải thông tin thanh toán...
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <Card className="p-6">
        <p className="font-semibold text-rose-700">{error || 'Không tìm thấy booking.'}</p>
        <Button className="mt-4" variant="outline" onClick={() => router.push('/my-tickets')}>
          Quay lại Vé của tôi
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <Link href="/my-tickets" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-[#14b8a6]">
        <ArrowLeft size={17} />
        Quay lại Vé của tôi
      </Link>

      <PaymentSummary
        booking={booking}
        user={user}
        discountCode={normalizedDiscount}
        previewDiscountAmount={previewDiscount}
        status={status}
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
        <Card className="p-5">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase text-[#14b8a6]">Phương thức thanh toán</p>
              <h2 className="mt-1 text-xl font-extrabold text-slate-950 dark:text-white">Chọn cách thanh toán</h2>
            </div>
            <PaymentStatusBadge status={status} />
          </div>

          <PaymentMethodSelector value={method} disabled={!canPay} gatewayConfig={gatewayConfig} onChange={setMethod} />

          {gatewayConfig && (
            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-800">
              Mot so cong thanh toan can cau hinh khoa tich hop tren backend. MoMo/VNPay co the thanh toan bang ma QR khi cong truc tiep chua san sang.
            </div>
          )}

          <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/60">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-100">
              <Tag size={17} className="text-[#14b8a6]" />
              Mã giảm giá
            </div>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <input
                className="w-full dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                placeholder="Nhập EVENT10, VIP50, STUDENT20"
                value={discountCode}
                disabled={!canPay}
                onChange={(event) => setDiscountCode(event.target.value)}
              />
              <Button type="button" variant="outline" disabled={!canPay} onClick={() => setDiscountCode('')}>
                Xóa
              </Button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {couponHints.map((coupon) => (
                <button
                  key={coupon.code}
                  type="button"
                  disabled={!canPay}
                  onClick={() => setDiscountCode(coupon.code)}
                  className="rounded border border-teal-100 bg-white px-3 py-2 text-xs font-bold text-[#0f9f8e] hover:bg-teal-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {coupon.code} · {coupon.label}
                </button>
              ))}
            </div>
            {invalidDiscount && <p className="mt-2 text-sm font-semibold text-rose-700">Mã giảm giá không hợp lệ.</p>}
          </div>

          {error && (
            <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200">
              {error}
            </div>
          )}
        </Card>

        <Card className="self-start p-5">
          <div className="grid h-12 w-12 place-items-center rounded bg-teal-50 text-[#14b8a6]">
            <ShieldCheck size={24} />
          </div>
          <h2 className="mt-4 text-xl font-extrabold text-slate-950 dark:text-white">Xác nhận thanh toán</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Booking chỉ chuyển sang paid khi thanh toán thành công. Nếu giao dịch thất bại, booking vẫn pending và có thể thanh toán lại.
          </p>

          <div className="mt-4 space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-800 dark:bg-slate-800/60">
            <PaymentLine label="Tạm tính" value={subtotal} />
            <PaymentLine label="Giảm giá" value={-previewDiscount} highlight={previewDiscount > 0} />
            <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-base font-extrabold text-slate-950 dark:border-slate-700 dark:text-white">
              <span>Tổng thanh toán</span>
              <span>{formatCurrency(payableAmount)}</span>
            </div>
          </div>

          {receipt && (
            <div className="mt-4 rounded-lg border border-teal-100 bg-teal-50 p-3 text-sm text-slate-700">
              <p className="flex items-center gap-2 font-bold text-slate-950">
                <ReceiptText size={16} className="text-[#14b8a6]" />
                Receipt #{receipt.transactionCode}
              </p>
              <p>Đã thanh toán: {formatCurrency(receipt.paidAmount)}</p>
              <p>Email xác nhận: đã gửi</p>
            </div>
          )}

          <Button
            type="button"
            className="mt-5 h-12 w-full text-base"
            disabled={!canPay || invalidDiscount}
            onClick={() => void handleCheckout()}
          >
            {processing ? <Loader2 className="animate-spin" size={19} /> : <CreditCard size={19} />}
            {processing ? 'Đang xử lý...' : 'Thanh toán ngay'}
          </Button>

          {booking.status === 'paid' || booking.status === 'used' ? (
            <Button type="button" variant="outline" className="mt-3 w-full" onClick={() => router.push('/my-tickets')}>
              <CheckCircle2 size={17} />
              Xem vé đã thanh toán
            </Button>
          ) : (
            <Button type="button" variant="outline" className="mt-3 w-full" disabled={processing} onClick={() => void load()}>
              <RefreshCcw size={17} />
              Làm mới trạng thái
            </Button>
          )}
        </Card>
      </div>

      {history.length > 0 && <PaymentHistoryTable history={history} />}

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            className="fixed bottom-5 right-5 z-50 flex max-w-sm items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-800 shadow-2xl dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          >
            {toast.type === 'success' ? <CheckCircle2 className="text-[#14b8a6]" size={20} /> : <XCircle className="text-rose-600" size={20} />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {successOpen && (
          <PaymentSuccessDialog
            booking={booking}
            receipt={receipt}
            open={successOpen}
            onGoToTickets={() => router.push('/my-tickets')}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function resolvePaymentMethod(method: PaymentMethodValue): { checkoutMethod: PaymentCheckoutMethod; provider: PaymentProvider } {
  if (method === 'vnpay') return { checkoutMethod: 'bank_transfer', provider: 'vnpay' };
  if (method === 'momo') return { checkoutMethod: 'e_wallet', provider: 'momo' };
  return { checkoutMethod: 'bank_transfer', provider: 'vnpay' };
}

function PaymentLine({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
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

function PaymentHistoryTable({ history }: { history: PaymentTransaction[] }) {
  return (
    <Card className="p-5">
      <h2 className="text-xl font-extrabold text-slate-950 dark:text-white">Lịch sử thanh toán</h2>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500">
              <th className="py-2">Mã giao dịch</th>
              <th>Phương thức</th>
              <th>Trạng thái</th>
              <th>Mã giảm</th>
              <th>Số tiền</th>
              <th>Thời gian</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item) => (
              <tr key={item._id} className="border-b border-slate-100">
                <td className="py-2 font-semibold">{item.transactionCode}</td>
                <td>{item.method}</td>
                <td className={item.status === 'success' ? 'font-semibold text-emerald-700' : 'font-semibold text-rose-700'}>
                  {item.status === 'success' ? 'success' : 'failed'}
                </td>
                <td>{item.discountCode ?? '-'}</td>
                <td>{formatCurrency(item.paidAmount)}</td>
                <td>{new Date(item.createdAt).toLocaleString('vi-VN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
