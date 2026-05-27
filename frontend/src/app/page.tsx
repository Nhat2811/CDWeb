'use client';

import Link from 'next/link';
import { Search, SlidersHorizontal } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { getErrorMessage } from '@/services/api';
import { getEvents } from '@/services/events.service';
import { Event } from '@/types';
import { StatusBadge } from '@/components/status-badge';

const fallbackImage =
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80';

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load(params = { search, category }) {
    setLoading(true);
    setError('');
    try {
      setEvents(await getEvents({ ...params, status: 'published' }));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load({ search: '', category: '' });
  }, []);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void load();
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-5 rounded bg-white/70 p-5 shadow-soft ring-1 ring-sky-100 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="flex flex-col justify-center gap-4">
          <p className="font-semibold text-coral">Đặt vé sự kiện</p>
          <h1 className="max-w-3xl text-3xl font-bold tracking-normal md:text-5xl">
            Tìm sự kiện, chọn loại vé và nhận QR sau khi thanh toán.
          </h1>
          <form onSubmit={onSubmit} className="grid gap-3 rounded bg-white p-3 shadow-soft ring-1 ring-sky-100 md:grid-cols-[1fr_220px_auto]">
            <label className="flex items-center gap-2">
              <Search size={18} />
              <input
                className="w-full border-0 p-0 focus:ring-0"
                placeholder="Tìm theo tên, mô tả, địa điểm"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>
            <label className="flex items-center gap-2">
              <SlidersHorizontal size={18} />
              <input
                className="w-full border-0 p-0 focus:ring-0"
                placeholder="Danh mục"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              />
            </label>
            <button className="rounded bg-moss px-5 py-2 font-semibold text-white shadow-sm hover:bg-[#0b897b]">Tìm</button>
          </form>
        </div>
        <img
          className="h-72 w-full rounded object-cover shadow-soft"
          src={fallbackImage}
          alt="Sân khấu sự kiện"
        />
      </section>

      {error && <div className="rounded border border-rose-200 bg-rose-50 p-3 text-rose-700">{error}</div>}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((item) => (
          <div key={item} className="h-72 animate-pulse rounded bg-white shadow-soft ring-1 ring-sky-100" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Link key={event._id} href={`/events/${event._id}`} className="overflow-hidden rounded bg-white shadow-soft ring-1 ring-sky-100 transition hover:-translate-y-0.5 hover:shadow-lg">
              <img className="h-44 w-full object-cover" src={event.image || fallbackImage} alt={event.title} />
              <div className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-lg font-bold">{event.title}</h2>
                  <StatusBadge status={event.status} />
                </div>
                <p className="line-clamp-2 text-sm text-slate-600">{event.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <span>{event.location}</span>
                  <span>{new Date(event.startDate).toLocaleDateString('vi-VN')}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
