'use client';

import { FormEvent, useEffect, useState } from 'react';
import { CalendarPlus, Save, Trash2, Upload } from 'lucide-react';
import { StatusBadge } from '@/components/status-badge';
import { getErrorMessage } from '@/services/api';
import { getDashboard } from '@/services/admin.service';
import {
  deleteEvent,
  deleteTicket,
  getEvents,
  getTickets,
  saveEvent,
  saveTicket,
  uploadEventImage,
} from '@/services/events.service';
import { useProtected } from '@/hooks/use-protected';
import { Dashboard, Event, Ticket, TicketName } from '@/types';

const emptyEvent = {
  title: '',
  description: '',
  image: '',
  location: '',
  startDate: '',
  endDate: '',
  category: '',
  status: 'draft',
};

export default function AdminPage() {
  useProtected('admin');
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [selected, setSelected] = useState<Partial<Event>>(emptyEvent as Partial<Event>);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [ticketForm, setTicketForm] = useState<{ _id?: string; name: TicketName; price: number; quantity: number }>({
    name: 'Standard',
    price: 0,
    quantity: 0,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const [dashboardData, eventData] = await Promise.all([getDashboard(), getEvents()]);
      setDashboard(dashboardData);
      setEvents(eventData);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function chooseEvent(event: Event) {
    setSelected({
      ...event,
      startDate: event.startDate.slice(0, 16),
      endDate: event.endDate.slice(0, 16),
    });
    setTickets(await getTickets(event._id));
  }

  async function onSaveEvent(submitEvent: FormEvent) {
    submitEvent.preventDefault();
    try {
      const saved = await saveEvent(selected);
      setSelected({
        ...saved,
        startDate: saved.startDate.slice(0, 16),
        endDate: saved.endDate.slice(0, 16),
      });
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function onUpload(file?: File) {
    if (!file) return;
    try {
      const url = await uploadEventImage(file);
      setSelected((current) => ({ ...current, image: url }));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function onSaveTicket(submitEvent: FormEvent) {
    submitEvent.preventDefault();
    if (!selected._id) return;
    try {
      await saveTicket({ ...ticketForm, event: selected._id });
      setTickets(await getTickets(selected._id));
      setTicketForm({ name: 'Standard', price: 0, quantity: 0 });
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <button
          className="flex items-center gap-2 rounded bg-moss px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#0b897b]"
          onClick={() => {
            setSelected(emptyEvent as Partial<Event>);
            setTickets([]);
          }}
        >
          <CalendarPlus size={17} />
          Sự kiện mới
        </button>
      </div>

      {error && <div className="rounded border border-rose-200 bg-rose-50 p-3 text-rose-700">{error}</div>}

      <section className="grid gap-4 md:grid-cols-3">
        {[
          ['Tổng sự kiện', dashboard?.totalEvents ?? 0],
          ['Vé đã bán', dashboard?.totalTicketsSold ?? 0],
          ['Doanh thu', `${(dashboard?.totalRevenue ?? 0).toLocaleString('vi-VN')}đ`],
        ].map(([label, value]) => (
          <div key={label} className="rounded bg-white p-5 shadow-soft ring-1 ring-sky-100">
            <p className="text-sm text-slate-500">{label}</p>
            <strong className="mt-2 block text-3xl">{value}</strong>
          </div>
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded bg-white p-4 shadow-soft ring-1 ring-sky-100">
          <h2 className="mb-3 text-lg font-bold">Sự kiện</h2>
          {loading ? <div className="h-48 animate-pulse rounded bg-sky-50" /> : null}
          <div className="space-y-2">
            {events.map((event) => (
              <button
                key={event._id}
                className="flex w-full items-center justify-between gap-3 rounded border border-sky-100 p-3 text-left hover:bg-sky-50"
                onClick={() => void chooseEvent(event)}
              >
                <span>
                  <strong className="block">{event.title}</strong>
                  <span className="text-sm text-slate-500">{event.location}</span>
                </span>
                <StatusBadge status={event.status} />
              </button>
            ))}
          </div>
        </section>

        <section className="rounded bg-white p-4 shadow-soft ring-1 ring-sky-100">
          <h2 className="mb-3 text-lg font-bold">Thông tin sự kiện</h2>
          <form onSubmit={onSaveEvent} className="grid gap-3 md:grid-cols-2">
            <input placeholder="Tiêu đề" value={selected.title ?? ''} onChange={(e) => setSelected({ ...selected, title: e.target.value })} />
            <input placeholder="Địa điểm" value={selected.location ?? ''} onChange={(e) => setSelected({ ...selected, location: e.target.value })} />
            <input placeholder="Danh mục" value={selected.category ?? ''} onChange={(e) => setSelected({ ...selected, category: e.target.value })} />
            <select value={selected.status ?? 'draft'} onChange={(e) => setSelected({ ...selected, status: e.target.value as Event['status'] })}>
              <option value="draft">draft</option>
              <option value="published">published</option>
              <option value="cancelled">cancelled</option>
            </select>
            <input type="datetime-local" value={selected.startDate ?? ''} onChange={(e) => setSelected({ ...selected, startDate: e.target.value })} />
            <input type="datetime-local" value={selected.endDate ?? ''} onChange={(e) => setSelected({ ...selected, endDate: e.target.value })} />
            <input className="md:col-span-2" placeholder="Ảnh URL" value={selected.image ?? ''} onChange={(e) => setSelected({ ...selected, image: e.target.value })} />
            <textarea
              className="md:col-span-2"
              rows={4}
              placeholder="Mô tả"
              value={selected.description ?? ''}
              onChange={(e) => setSelected({ ...selected, description: e.target.value })}
            />
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded border border-dashed border-sky-200 bg-sky-50 px-3 py-2 text-sm font-semibold text-moss">
              <Upload size={16} />
              Upload ảnh
              <input className="hidden" type="file" accept="image/*" onChange={(e) => void onUpload(e.target.files?.[0])} />
            </label>
            <div className="flex gap-2">
              <button className="flex flex-1 items-center justify-center gap-2 rounded bg-moss px-3 py-2 font-semibold text-white shadow-sm hover:bg-[#0b897b]">
                <Save size={16} />
                Lưu
              </button>
              {selected._id && (
                <button
                  type="button"
                  className="rounded border border-rose-200 p-2 text-rose-700"
                  title="Xóa sự kiện"
                  onClick={async () => {
                    await deleteEvent(selected._id as string);
                    setSelected(emptyEvent as Partial<Event>);
                    setTickets([]);
                    await load();
                  }}
                >
                  <Trash2 size={17} />
                </button>
              )}
            </div>
          </form>

          {selected._id && (
            <div className="mt-6 border-t border-sky-100 pt-4">
              <h3 className="font-bold">Loại vé</h3>
              <form onSubmit={onSaveTicket} className="mt-3 grid gap-3 md:grid-cols-[1fr_120px_120px_auto]">
                <select value={ticketForm.name} onChange={(e) => setTicketForm({ ...ticketForm, name: e.target.value as TicketName })}>
                  <option>VIP</option>
                  <option>Standard</option>
                  <option>Early Bird</option>
                </select>
                <input type="number" min={0} placeholder="Giá" value={ticketForm.price} onChange={(e) => setTicketForm({ ...ticketForm, price: Number(e.target.value) })} />
                <input type="number" min={0} placeholder="SL" value={ticketForm.quantity} onChange={(e) => setTicketForm({ ...ticketForm, quantity: Number(e.target.value) })} />
                <button className="rounded bg-coral px-3 py-2 font-semibold text-white shadow-sm hover:bg-[#ff5959]">
                  {ticketForm._id ? 'Lưu' : 'Thêm'}
                </button>
              </form>
              <div className="mt-3 space-y-2">
                {tickets.map((ticket) => (
                  <div key={ticket._id} className="flex items-center justify-between rounded border border-sky-100 p-3 hover:bg-sky-50">
                    <button
                      className="text-left"
                      onClick={() => setTicketForm({
                        _id: ticket._id,
                        name: ticket.name,
                        price: ticket.price,
                        quantity: ticket.quantity,
                      })}
                    >
                      {ticket.name} - {ticket.price.toLocaleString('vi-VN')}đ - đã bán {ticket.sold}/{ticket.quantity}
                    </button>
                    <button className="rounded border border-rose-200 p-2 text-rose-700" title="Xóa vé" onClick={async () => {
                      await deleteTicket(ticket._id);
                      setTickets(await getTickets(selected._id as string));
                    }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>

      <section className="rounded bg-white p-4 shadow-soft ring-1 ring-sky-100">
        <h2 className="mb-3 text-lg font-bold">Booking gần đây</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-sky-100">
                <th className="py-2">Khách</th>
                <th>Sự kiện</th>
                <th>Vé</th>
                <th>Tổng</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {dashboard?.recentBookings.map((booking) => (
                <tr key={booking._id} className="border-b border-sky-50">
                  <td className="py-2">{typeof booking.user === 'string' ? booking.user : booking.user.email}</td>
                  <td>{booking.event?.title}</td>
                  <td>{booking.ticket?.name} x {booking.quantity}</td>
                  <td>{booking.totalPrice.toLocaleString('vi-VN')}đ</td>
                  <td><StatusBadge status={booking.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
