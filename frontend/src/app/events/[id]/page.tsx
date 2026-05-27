'use client';

import { useParams, useRouter } from 'next/navigation';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { CreditCard, MapPin } from 'lucide-react';
import { getErrorMessage } from '@/services/api';
import { createBooking, payBooking } from '@/services/bookings.service';
import { getEvent, getTickets } from '@/services/events.service';
import { useAuth } from '@/store/auth-store';
import { Event, Ticket } from '@/types';

const fallbackImage =
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80';

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

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [eventData, ticketData] = await Promise.all([getEvent(id), getTickets(id)]);
        setEvent(eventData);
        setTickets(ticketData);
        setTicketId(ticketData[0]?._id ?? '');
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [id]);

  const selectedTicket = useMemo(() => tickets.find((ticket) => ticket._id === ticketId), [ticketId, tickets]);
  const total = (selectedTicket?.price ?? 0) * quantity;

  async function onBook(eventSubmit: FormEvent) {
    eventSubmit.preventDefault();
    if (!user) {
      router.push('/login');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const booking = await createBooking(id, ticketId, quantity);
      await payBooking(booking._id);
      router.push('/my-tickets');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="h-96 animate-pulse rounded bg-white shadow-soft ring-1 ring-sky-100" />;
  if (!event) return <div className="rounded bg-white p-6 shadow-soft ring-1 ring-sky-100">Không tìm thấy sự kiện.</div>;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <section className="overflow-hidden rounded bg-white shadow-soft ring-1 ring-sky-100">
        <img className="h-80 w-full object-cover" src={event.image || fallbackImage} alt={event.title} />
        <div className="space-y-4 p-5">
          <h1 className="text-3xl font-bold">{event.title}</h1>
          <div className="flex flex-wrap gap-4 text-sm text-slate-600">
            <span className="flex items-center gap-2"><MapPin size={17} />{event.location}</span>
            <span>{new Date(event.startDate).toLocaleString('vi-VN')}</span>
            <span>{event.category}</span>
          </div>
          <p className="leading-7 text-slate-700">{event.description}</p>
        </div>
      </section>

      <aside className="h-fit rounded bg-white p-5 shadow-soft ring-1 ring-sky-100">
        <h2 className="text-xl font-bold">Chọn vé</h2>
        <form onSubmit={onBook} className="mt-4 space-y-4">
          <select className="w-full" value={ticketId} onChange={(e) => setTicketId(e.target.value)} required>
            {tickets.map((ticket) => (
              <option key={ticket._id} value={ticket._id}>
                {ticket.name} - {ticket.price.toLocaleString('vi-VN')}đ còn {ticket.quantity - ticket.sold}
              </option>
            ))}
          </select>
          <input
            className="w-full"
            type="number"
            min={1}
            max={selectedTicket ? selectedTicket.quantity - selectedTicket.sold : 1}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
          />
          <div className="flex items-center justify-between border-t border-sky-100 pt-4">
            <span>Tổng tiền</span>
            <strong>{total.toLocaleString('vi-VN')}đ</strong>
          </div>
          {error && <p className="text-sm text-rose-700">{error}</p>}
          <button
            disabled={submitting || !ticketId}
            className="flex w-full items-center justify-center gap-2 rounded bg-coral px-4 py-2 font-semibold text-white shadow-sm hover:bg-[#ff5959] disabled:opacity-60"
          >
            <CreditCard size={18} />
            {submitting ? 'Đang thanh toán...' : 'Đặt và thanh toán'}
          </button>
        </form>
      </aside>
    </div>
  );
}
