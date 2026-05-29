'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, CreditCard, Loader2, RefreshCcw, ShieldCheck, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useProtected } from '@/hooks/use-protected';
import { getErrorMessage } from '@/services/api';
import { checkoutPayment, getPaymentBooking } from '@/services/payments.service';
import { useAuth } from '@/store/auth-store';
import { Booking, PaymentCheckoutMethod, PaymentStatus } from '@/types';
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

export function PaymentPage({ bookingId }: PaymentPageProps) {
  useProtected();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const discountCode = searchParams.get('discountCode') ?? '';
  const [booking, setBooking] = useState<Booking | null>(null);
  const [method, setMethod] = useState<PaymentMethodValue>('card');
  const [status, setStatus] = useState<PaymentStatus>('pending');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState<ToastState>(null);
  const [successOpen, setSuccessOpen] = useState(false);

  const canPay = useMemo(() => booking?.status === 'pending' && !processing, [booking?.status, processing]);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const nextBooking = await getPaymentBooking(bookingId);
      setBooking(nextBooking);
      setStatus(nextBooking.status === 'cancelled' ? 'cancelled' : nextBooking.status === 'paid' || nextBooking.status === 'used' ? 'paid' : 'pending');
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

    setProcessing(true);
    setStatus('processing');
    setError('');

    try {
      const simulateFailure = method === 'mock_failure';
      const checkoutMethod: PaymentCheckoutMethod = method === 'mock_failure' ? 'card' : method;
      const response = await checkoutPayment(booking._id, checkoutMethod, simulateFailure);
      setBooking(response.booking);
      setStatus('paid');
      setSuccessOpen(true);
      showToast('success', 'Thanh toán thành công.');
      window.setTimeout(() => router.push('/my-tickets'), 1600);
    } catch (err) {
      const message = getErrorMessage(err);
      setStatus('failed');
      setError(message);
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

      <PaymentSummary booking={booking} user={user} discountCode={discountCode} status={status} />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="p-5">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase text-[#14b8a6]">Phương thức thanh toán</p>
              <h2 className="mt-1 text-xl font-extrabold text-slate-950 dark:text-white">Chọn cách thanh toán</h2>
            </div>
            <PaymentStatusBadge status={status} />
          </div>
          <PaymentMethodSelector value={method} disabled={!canPay} onChange={setMethod} />
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
          <h2 className="mt-4 text-xl font-extrabold text-slate-950 dark:text-white">Mock payment</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Booking chỉ được đổi sang paid khi checkout thành công. Nếu mock thất bại, trạng thái booking vẫn là pending và bạn có thể thanh toán lại.
          </p>

          <Button type="button" className="mt-5 h-12 w-full text-base" disabled={!canPay} onClick={() => void handleCheckout()}>
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
        {successOpen && <PaymentSuccessDialog booking={booking} open={successOpen} onGoToTickets={() => router.push('/my-tickets')} />}
      </AnimatePresence>
    </div>
  );
}
