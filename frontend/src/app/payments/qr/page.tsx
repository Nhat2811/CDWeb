'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, Loader2, QrCode, RefreshCcw, ShieldCheck, Smartphone } from 'lucide-react';
import QRCode from 'qrcode';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useProtected } from '@/hooks/use-protected';
import { getErrorMessage } from '@/services/api';
import { checkoutPayment, getPaymentBooking } from '@/services/payments.service';
import { Booking, PaymentCheckoutMethod, PaymentProvider } from '@/types';

function formatCurrency(value: number) {
  return `${value.toLocaleString('vi-VN')}d`;
}

function providerLabel(provider: string) {
  if (provider === 'momo') return 'MoMo';
  if (provider === 'vnpay') return 'VNPay';
  return 'QR';
}

function checkoutMethodFor(provider: PaymentProvider): PaymentCheckoutMethod {
  if (provider === 'momo') return 'e_wallet';
  if (provider === 'vnpay') return 'bank_transfer';
  return 'card';
}

function PaymentQrContent() {
  useProtected();
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId') ?? '';
  const provider = (searchParams.get('provider') ?? 'momo') as PaymentProvider;
  const discountCode = searchParams.get('discountCode') ?? undefined;
  const amount = Number(searchParams.get('amount') ?? 0);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(300);

  const label = providerLabel(provider);
  const paymentPayload = useMemo(() => {
    const eventTitle = booking?.event?.title ?? 'Event booking';
    return JSON.stringify({
      gateway: label,
      bookingId,
      event: eventTitle,
      amount,
      currency: 'VND',
      note: `PAY ${bookingId}`,
      source: 'event-booking',
    });
  }, [amount, booking?.event?.title, bookingId, label]);

  useEffect(() => {
    async function load() {
      if (!bookingId) {
        setError('Missing booking id.');
        setLoading(false);
        return;
      }
      try {
        const nextBooking = await getPaymentBooking(bookingId);
        setBooking(nextBooking);
        const qr = await QRCode.toDataURL(paymentPayload, {
          width: 280,
          margin: 2,
          color: {
            dark: provider === 'momo' ? '#a50064' : '#0f766e',
            light: '#ffffff',
          },
        });
        setQrDataUrl(qr);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [bookingId, paymentPayload, provider]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSecondsLeft((current) => Math.max(current - 1, 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  async function confirmPayment() {
    if (!bookingId || processing) return;
    setProcessing(true);
    setError('');
    try {
      await checkoutPayment(bookingId, checkoutMethodFor(provider), false, discountCode, 'mock');
      router.push('/my-tickets');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setProcessing(false);
    }
  }

  if (loading) {
    return (
      <div className="grid min-h-[calc(100vh-140px)] place-items-center">
        <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-5 py-4 font-semibold text-slate-700 shadow-soft">
          <Loader2 className="animate-spin text-[#14b8a6]" size={22} />
          Dang tao ma QR thanh toan...
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <Link
        href={bookingId ? `/payments/${bookingId}` : '/my-tickets'}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-[#14b8a6]"
      >
        <ArrowLeft size={17} />
        Quay lai thanh toan
      </Link>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase text-[#14b8a6]">Quet ma thanh toan</p>
              <h1 className="mt-1 text-2xl font-extrabold text-slate-950">Thanh toan bang {label}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Mo ung dung {label}, chon quet QR va xac nhan dung so tien, noi dung chuyen khoan.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded border border-teal-100 bg-teal-50 px-3 py-2 text-sm font-bold text-teal-700">
              <ShieldCheck size={17} />
              Bao mat
            </div>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-[320px_minmax(0,1fr)]">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-lg border border-slate-200 bg-slate-50 p-5 text-center"
            >
              <div className="mx-auto grid h-12 w-12 place-items-center rounded bg-white text-[#14b8a6] shadow-sm">
                <QrCode size={24} />
              </div>
              <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt={`QR ${label}`} className="mx-auto h-64 w-64" />
                ) : (
                  <div className="grid h-64 place-items-center text-sm font-semibold text-slate-500">Khong tao duoc QR</div>
                )}
              </div>
              <p className="mt-3 text-sm font-semibold text-slate-500">
                Het han sau {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, '0')}
              </p>
            </motion.div>

            <div className="space-y-4">
              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <p className="text-sm font-bold uppercase text-slate-500">Thong tin don hang</p>
                <h2 className="mt-2 text-xl font-extrabold text-slate-950">{booking?.event?.title ?? 'Event booking'}</h2>
                <div className="mt-4 space-y-3 text-sm">
                  <InfoLine label="Ma booking" value={bookingId} />
                  <InfoLine label="Cong thanh toan" value={label} />
                  <InfoLine label="Noi dung" value={`PAY ${bookingId}`} />
                  <InfoLine label="So tien" value={formatCurrency(amount || booking?.totalPrice || 0)} strong />
                </div>
              </div>

              <div className="rounded-lg border border-teal-100 bg-teal-50 p-4 text-sm leading-6 text-slate-700">
                <div className="mb-2 flex items-center gap-2 font-bold text-slate-950">
                  <Smartphone size={18} className="text-[#14b8a6]" />
                  Huong dan thanh toan
                </div>
                Sau khi hoan tat thanh toan, bam nut xac nhan ben duoi de he thong cap nhat don hang va sinh ve QR.
              </div>

              {error && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700">
                  {error}
                </div>
              )}

              <div className="grid gap-3 sm:grid-cols-2">
                <Button className="h-12" disabled={processing || secondsLeft === 0} onClick={() => void confirmPayment()}>
                  {processing ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                  Da thanh toan
                </Button>
                <Button
                  variant="outline"
                  className="h-12"
                  disabled={processing}
                  onClick={() => {
                    setSecondsLeft(300);
                    setError('');
                  }}
                >
                  <RefreshCcw size={18} />
                  Tao lai QR
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function InfoLine({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-2 last:border-b-0 last:pb-0">
      <span className="text-slate-500">{label}</span>
      <span className={strong ? 'text-lg font-extrabold text-slate-950' : 'break-all text-right font-bold text-slate-900'}>
        {value}
      </span>
    </div>
  );
}

export default function PaymentQrPage() {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-[calc(100vh-140px)] place-items-center">
          <Loader2 className="animate-spin text-[#14b8a6]" size={28} />
        </div>
      }
    >
      <PaymentQrContent />
    </Suspense>
  );
}
