'use client';

import { RefreshCcw, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { StatusBadge } from '@/components/status-badge';
import { getErrorMessage } from '@/services/api';
import { cancelBooking, getMyBookings } from '@/services/bookings.service';
import { useProtected } from '@/hooks/use-protected';
import { Booking } from '@/types';

export default function MyTicketsPage() {
  useProtected();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      setBookings(await getMyBookings());
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function cancel(id: string) {
    try {
      await cancelBooking(id);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Vé của tôi</h1>
        <button className="rounded border border-sky-100 bg-white p-2 text-slate-700 hover:bg-sky-50" title="Tải lại" onClick={() => void load()}>
          <RefreshCcw size={18} />
        </button>
      </div>
      {error && <div className="rounded border border-rose-200 bg-rose-50 p-3 text-rose-700">{error}</div>}
      {loading ? (
        <div className="h-60 animate-pulse rounded bg-white shadow-soft ring-1 ring-sky-100" />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {bookings.map((booking) => (
            <article key={booking._id} className="grid gap-4 rounded bg-white p-4 shadow-soft ring-1 ring-sky-100 sm:grid-cols-[150px_1fr]">
              <img className="h-36 w-36 rounded border border-sky-100 bg-white p-2" src={booking.qrCode} alt="QR code" />
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-lg font-bold">{booking.event?.title}</h2>
                  <StatusBadge status={booking.status} />
                </div>
                <p className="text-sm text-slate-600">{booking.ticket?.name} x {booking.quantity}</p>
                <p className="font-semibold">{booking.totalPrice.toLocaleString('vi-VN')}đ</p>
                <p className="text-sm text-slate-600">{new Date(booking.createdAt).toLocaleString('vi-VN')}</p>
                {booking.status === 'pending' && (
                  <button
                    className="flex items-center gap-2 rounded border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-700"
                    onClick={() => void cancel(booking._id)}
                  >
                    <XCircle size={16} />
                    Hủy booking
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
