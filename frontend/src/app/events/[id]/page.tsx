'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, XCircle } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { EventDetailSection } from '@/components/event/event-detail-section';
import { EventDetailSkeleton } from '@/components/event/event-detail-skeleton';
import { TicketBookingCard } from '@/components/event/ticket-booking-card';
import { getErrorMessage } from '@/services/api';
import { createBooking, payBooking } from '@/services/bookings.service';
import { getEvent, getTickets } from '@/services/events.service';
import { useAuth } from '@/store/auth-store';
import { Event, Ticket } from '@/types';

type ToastState = {
  type: 'success' | 'error';
  message: string;
} | null;

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [ticketId, setTicketId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState<ToastState>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError('');
      try {
        const [eventData, ticketData] = await Promise.all([getEvent(id), getTickets(id)]);
        setEvent(eventData);
        setTickets(ticketData);
        const firstAvailable = ticketData.find((ticket) => ticket.quantity - ticket.sold > 0) ?? ticketData[0];
        setTicketId(firstAvailable?._id ?? '');
      } catch (err) {
        const message = getErrorMessage(err);
        setError(message);
        showToast('error', message);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [id]);

  const selectedTicket = useMemo(() => tickets.find((ticket) => ticket._id === ticketId), [ticketId, tickets]);
  const remaining = selectedTicket ? Math.max(selectedTicket.quantity - selectedTicket.sold, 0) : 0;

  useEffect(() => {
    if (!selectedTicket) return;
    if (remaining === 0) {
      setQuantity(0);
      return;
    }
    setQuantity((current) => Math.min(Math.max(current || 1, 1), remaining));
  }, [remaining, selectedTicket]);

  function showToast(type: 'success' | 'error', message: string) {
    setToast({ type, message });
    window.setTimeout(() => setToast(null), 3200);
  }

  async function submitBooking() {
    if (!user) {
      showToast('error', 'Vui lòng đăng nhập để đặt vé.');
      router.push('/login');
      return;
    }
    if (!selectedTicket || remaining === 0 || quantity < 1 || quantity > remaining) {
      showToast('error', 'Số lượng vé không hợp lệ.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const booking = await createBooking(id, selectedTicket._id, quantity);
      await payBooking(booking._id);
      showToast('success', 'Đặt vé thành công. Đang chuyển đến vé của tôi...');
      window.setTimeout(() => router.push('/my-tickets'), 900);
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      showToast('error', message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <EventDetailSkeleton />;

  if (!event) {
    return (
      <div className="rounded-lg border border-rose-200 bg-rose-50 p-6 text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200">
        Không tìm thấy sự kiện.
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
        <EventDetailSection event={event} tickets={tickets} />
        <TicketBookingCard
          tickets={tickets}
          selectedTicketId={ticketId}
          quantity={quantity}
          submitting={submitting}
          error={error}
          onTicketChange={setTicketId}
          onQuantityChange={setQuantity}
          onSubmit={submitBooking}
        />
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            className="fixed bottom-5 right-5 z-50 flex max-w-sm items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-800 shadow-2xl dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="text-[#14b8a6]" size={20} />
            ) : (
              <XCircle className="text-rose-600" size={20} />
            )}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
