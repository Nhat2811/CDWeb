'use client';

import { CalendarDays, MapPin, Search, SlidersHorizontal, Sparkles, Tag, Ticket, XCircle } from 'lucide-react';
import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getErrorMessage } from '@/services/api';
import { EventQuery, getEvents } from '@/services/events.service';
import { Event } from '@/types';

const fallbackImage = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80';

const pricePresets = [
  { label: 'Tất cả giá', minPrice: '', maxPrice: '' },
  { label: 'Dưới 300K', minPrice: '', maxPrice: '300000' },
  { label: '300K - 800K', minPrice: '300000', maxPrice: '800000' },
  { label: 'Trên 800K', minPrice: '800000', maxPrice: '' },
];

type FilterState = {
  search: string;
  category: string;
  location: string;
  dateFrom: string;
  dateTo: string;
  minPrice: string;
  maxPrice: string;
};

const emptyFilters: FilterState = {
  search: '',
  category: '',
  location: '',
  dateFrom: '',
  dateTo: '',
  minPrice: '',
  maxPrice: '',
};

function formatCurrency(value?: number) {
  if (!value) return 'Chưa có giá';
  return `${value.toLocaleString('vi-VN')}đ`;
}

function toQuery(filters: FilterState): EventQuery {
  return Object.fromEntries(
    Object.entries({ ...filters, status: 'published' }).filter(([, value]) => String(value).trim() !== ''),
  ) as EventQuery;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [filters, setFilters] = useState<FilterState>(emptyFilters);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load(nextFilters = filters) {
    setLoading(true);
    setError('');
    try {
      setEvents(await getEvents(toQuery(nextFilters)));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load(emptyFilters);
  }, []);

  const activeFilterCount = useMemo(() => Object.values(filters).filter((value) => value.trim() !== '').length, [filters]);

  const categories = useMemo(() => Array.from(new Set(events.map((event) => event.category).filter(Boolean))).sort(), [events]);

  const groupedEvents = useMemo(
    () =>
      categories.map((category) => ({
        category,
        events: events.filter((event) => event.category === category),
      })),
    [categories, events],
  );

  const featuredEvents = useMemo(() => events.slice(0, 4), [events]);

  function updateFilter<K extends keyof FilterState>(key: K, value: FilterState[K]) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function applyPricePreset(minPrice: string, maxPrice: string) {
    setFilters((current) => ({ ...current, minPrice, maxPrice }));
  }

  function applyCategory(category: string) {
    const nextFilters = { ...filters, category };
    setFilters(nextFilters);
    void load(nextFilters);
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void load(filters);
  }

  function clearFilters() {
    setFilters(emptyFilters);
    setExpandedCategories({});
    void load(emptyFilters);
  }

  function toggleCategory(category: string) {
    setExpandedCategories((current) => ({ ...current, [category]: !current[category] }));
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-5 rounded-lg bg-white/80 p-5 shadow-soft ring-1 ring-sky-100 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="flex flex-col justify-center gap-4">
          <p className="font-semibold text-[#14b8a6]">Đặt vé sự kiện</p>
          <h1 className="max-w-3xl text-3xl font-extrabold tracking-normal text-slate-950 md:text-5xl">
            Tìm sự kiện theo ngày, địa điểm và khoảng giá phù hợp.
          </h1>
          <p className="max-w-2xl text-slate-600">
            Lọc nhanh danh sách sự kiện đang mở bán, xem giá vé thấp nhất và số vé còn lại trước khi đặt chỗ.
          </p>
        </div>
        <img className="h-72 w-full rounded-lg object-cover shadow-soft" src={fallbackImage} alt="Sân khấu sự kiện" />
      </section>

      <Card className="p-4">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-3 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
            <label className="flex items-center gap-2 rounded border border-slate-200 bg-white px-3 py-2">
              <Search size={18} className="text-[#14b8a6]" />
              <input
                className="w-full border-0 p-0 focus:ring-0"
                placeholder="Tìm tên, mô tả, địa điểm"
                value={filters.search}
                onChange={(event) => updateFilter('search', event.target.value)}
              />
            </label>
            <label className="flex items-center gap-2 rounded border border-slate-200 bg-white px-3 py-2">
              <SlidersHorizontal size={18} className="text-[#14b8a6]" />
              <select
                className="w-full border-0 p-0 focus:ring-0"
                value={filters.category}
                onChange={(event) => updateFilter('category', event.target.value)}
              >
                <option value="">Tất cả danh mục</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2 rounded border border-slate-200 bg-white px-3 py-2">
              <MapPin size={18} className="text-[#14b8a6]" />
              <input
                className="w-full border-0 p-0 focus:ring-0"
                placeholder="Địa điểm"
                value={filters.location}
                onChange={(event) => updateFilter('location', event.target.value)}
              />
            </label>
          </div>

          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_auto]">
            <label className="flex items-center gap-2 rounded border border-slate-200 bg-white px-3 py-2">
              <CalendarDays size={18} className="text-[#14b8a6]" />
              <input
                type="date"
                className="w-full border-0 p-0 focus:ring-0"
                value={filters.dateFrom}
                onChange={(event) => updateFilter('dateFrom', event.target.value)}
              />
            </label>
            <label className="flex items-center gap-2 rounded border border-slate-200 bg-white px-3 py-2">
              <CalendarDays size={18} className="text-[#14b8a6]" />
              <input
                type="date"
                className="w-full border-0 p-0 focus:ring-0"
                value={filters.dateTo}
                onChange={(event) => updateFilter('dateTo', event.target.value)}
              />
            </label>
            <label className="flex items-center gap-2 rounded border border-slate-200 bg-white px-3 py-2">
              <Tag size={18} className="text-[#14b8a6]" />
              <input
                type="number"
                min={0}
                className="w-full border-0 p-0 focus:ring-0"
                placeholder="Giá từ"
                value={filters.minPrice}
                onChange={(event) => updateFilter('minPrice', event.target.value)}
              />
            </label>
            <label className="flex items-center gap-2 rounded border border-slate-200 bg-white px-3 py-2">
              <Tag size={18} className="text-[#14b8a6]" />
              <input
                type="number"
                min={0}
                className="w-full border-0 p-0 focus:ring-0"
                placeholder="Giá đến"
                value={filters.maxPrice}
                onChange={(event) => updateFilter('maxPrice', event.target.value)}
              />
            </label>
            <Button className="h-11" disabled={loading}>
              {loading ? 'Đang lọc...' : 'Lọc'}
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {pricePresets.map((preset) => {
              const active = filters.minPrice === preset.minPrice && filters.maxPrice === preset.maxPrice;
              return (
                <button
                  key={preset.label}
                  type="button"
                  className={`rounded border px-3 py-2 text-sm font-semibold transition ${
                    active ? 'border-[#14b8a6] bg-teal-50 text-[#0f9f8e]' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                  onClick={() => applyPricePreset(preset.minPrice, preset.maxPrice)}
                >
                  {preset.label}
                </button>
              );
            })}
            {activeFilterCount > 0 && (
              <Button type="button" variant="ghost" onClick={clearFilters}>
                <XCircle size={17} />
                Xóa bộ lọc ({activeFilterCount})
              </Button>
            )}
          </div>
        </form>
      </Card>

      {!loading && categories.length > 0 && (
        <Card className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase text-[#14b8a6]">Danh mục sự kiện</p>
            </div>
            <span className="text-sm font-semibold text-slate-500">{categories.length} category</span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {groupedEvents.map((group) => (
              <button
                key={group.category}
                type="button"
                className={`rounded border px-3 py-2 text-sm font-bold transition ${
                  filters.category === group.category
                    ? 'border-[#14b8a6] bg-teal-50 text-[#0f9f8e]'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-teal-200 hover:bg-teal-50'
                }`}
                onClick={() => applyCategory(group.category)}
              >
                {group.category} ({group.events.length})
              </button>
            ))}
            {filters.category && (
              <button
                type="button"
                className="rounded border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50"
                onClick={() => applyCategory('')}
              >
                Tất cả category
              </button>
            )}
          </div>
        </Card>
      )}

      {error && <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-rose-700">{error}</div>}

      {!loading && featuredEvents.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="flex items-center gap-2 text-sm font-bold uppercase text-[#14b8a6]">
                <Sparkles size={17} />
                Sự kiện nổi bật
              </p>
              <h2 className="mt-1 text-2xl font-extrabold text-slate-950">Đang được quan tâm</h2>
            </div>
            <span className="rounded border border-teal-100 bg-teal-50 px-3 py-1 text-sm font-bold text-[#0f9f8e]">
              {featuredEvents.length} sự kiện
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {featuredEvents.map((event) => (
              <EventCard key={`featured-${event._id}`} event={event} featured />
            ))}
          </div>
        </section>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-extrabold text-slate-950">Sự kiện phù hợp</h2>
        <span className="text-sm font-semibold text-slate-500">{loading ? 'Đang tải...' : `${events.length} sự kiện`}</span>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-80 animate-pulse rounded-lg bg-white shadow-soft ring-1 ring-sky-100" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <Card className="grid min-h-64 place-items-center p-8 text-center">
          <div>
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-teal-50 text-[#14b8a6]">
              <Search size={28} />
            </div>
            <h3 className="mt-4 text-xl font-extrabold text-slate-950">Không có sự kiện phù hợp</h3>
            <p className="mt-2 text-slate-500">Thử nới khoảng giá, đổi ngày hoặc xóa bớt bộ lọc.</p>
            <Button type="button" className="mt-4" variant="outline" onClick={clearFilters}>
              Xóa bộ lọc
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-8">
          {groupedEvents.map((group) => (
            <section key={group.category} className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold uppercase text-[#14b8a6]">Category</p>
                  <h2 className="text-2xl font-extrabold text-slate-950">{group.category}</h2>
                </div>
                <span className="rounded border border-teal-100 bg-teal-50 px-3 py-1 text-sm font-bold text-[#0f9f8e]">
                  {group.events.length} sự kiện
                </span>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {(expandedCategories[group.category] ? group.events : group.events.slice(0, 4)).map((event) => (
                  <EventCard key={event._id} event={event} />
                ))}
              </div>

              {group.events.length > 4 && (
                <div className="flex justify-center pt-1">
                  <Button type="button" variant="outline" onClick={() => toggleCategory(group.category)}>
                    {expandedCategories[group.category] ? 'Thu gọn' : `Xem tất cả ${group.events.length} sự kiện`}
                  </Button>
                </div>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function EventCard({ event, featured }: { event: Event; featured?: boolean }) {
  return (
    <Link
      href={`/events/${event._id}`}
      className="overflow-hidden rounded-lg bg-white shadow-soft ring-1 ring-sky-100 transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <img className="h-44 w-full object-cover" src={event.image || fallbackImage} alt={event.title} />
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <h2 className="line-clamp-2 text-lg font-extrabold text-slate-950">{event.title}</h2>
          {featured ? (
            <span className="shrink-0 rounded border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-bold text-amber-700">
              Nổi bật
            </span>
          ) : (
            <StatusBadge status={event.status} />
          )}
        </div>
        <p className="line-clamp-2 text-sm text-slate-600">{event.description}</p>
        <div className="grid gap-2 text-sm text-slate-600">
          <span className="flex items-center gap-2">
            <MapPin size={16} className="text-[#14b8a6]" />
            {event.location}
          </span>
          <span className="flex items-center gap-2">
            <CalendarDays size={16} className="text-[#14b8a6]" />
            {new Date(event.startDate).toLocaleDateString('vi-VN')}
          </span>
        </div>
        <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3 text-sm">
          <span className="flex items-center gap-2 font-semibold text-slate-600">
            <Ticket size={16} className="text-[#14b8a6]" />
            Còn {event.availableTickets ?? 0} vé
          </span>
          <strong className="text-[#0f9f8e]">Từ {formatCurrency(event.minTicketPrice)}</strong>
        </div>
      </div>
    </Link>
  );
}
