'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { RefreshCcw, TicketCheck, XCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useProtected } from '@/hooks/use-protected';
import { getErrorMessage } from '@/services/api';
import { cancelBooking, getMyBookings, payBooking } from '@/services/bookings.service';
import { useAuth } from '@/store/auth-store';
import { Booking } from '@/types';
import { EmptyTicketState } from './empty-ticket-state';
import { TicketCard } from './ticket-card';
import { TicketDetailDialog } from './ticket-detail-dialog';
import { TicketFilterBar, TicketSort, TicketStatusFilter } from './ticket-filter-bar';

const PAGE_SIZE = 5;

type ToastState = {
  type: 'success' | 'error';
  message: string;
} | null;

export function TicketListPage() {
  useProtected();
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [confirmCancel, setConfirmCancel] = useState<Booking | null>(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<TicketStatusFilter>('all');
  const [sort, setSort] = useState<TicketSort>('newest');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState<ToastState>(null);

  async function load() {
    setLoading(true);
    setError('');
    try {
      setBookings(await getMyBookings());
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
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, status, sort]);

  function showToast(type: 'success' | 'error', message: string) {
    setToast({ type, message });
    window.setTimeout(() => setToast(null), 3000);
  }

  const filteredBookings = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return bookings
      .filter((booking) => {
        const matchesSearch = !keyword || booking.event?.title?.toLowerCase().includes(keyword);
        const matchesStatus = status === 'all' || booking.status === status;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (sort === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        if (sort === 'price-desc') return b.totalPrice - a.totalPrice;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [bookings, search, sort, status]);

  const totalPages = Math.max(1, Math.ceil(filteredBookings.length / PAGE_SIZE));
  const visibleBookings = filteredBookings.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  async function handleCancel(booking: Booking) {
    setActionLoading(true);
    try {
      await cancelBooking(booking._id);
      showToast('success', 'Hủy vé thành công.');
      setConfirmCancel(null);
      await load();
    } catch (err) {
      showToast('error', getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  }

  async function handlePay(booking: Booking) {
    setActionLoading(true);
    try {
      await payBooking(booking._id);
      showToast('success', 'Thanh toán thành công.');
      await load();
    } catch (err) {
      showToast('error', getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-110px)] space-y-6 rounded-lg bg-slate-50/80 p-4 dark:bg-slate-950 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-semibold text-[#14b8a6]">Event Booking</p>
          <h1 className="text-3xl font-extrabold text-slate-950 dark:text-white md:text-4xl">Vé của tôi</h1>
          <p className="mt-2 text-slate-500">Quản lý vé đã đặt, QR check-in và trạng thái thanh toán.</p>
        </div>
        <Button variant="outline" onClick={() => void load()} disabled={loading}>
          <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
          Làm mới
        </Button>
      </div>

      <TicketFilterBar
        search={search}
        status={status}
        sort={sort}
        onSearchChange={setSearch}
        onStatusChange={setStatus}
        onSortChange={setSort}
      />

      {error && <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200">{error}</div>}

      {loading ? (
        <TicketSkeleton />
      ) : filteredBookings.length === 0 ? (
        <EmptyTicketState />
      ) : (
        <>
          <div className="space-y-4">
            <AnimatePresence>
              {visibleBookings.map((booking) => (
                <TicketCard
                  key={booking._id}
                  booking={booking}
                  user={user}
                  onViewDetail={setSelectedBooking}
                  onCancel={setConfirmCancel}
                  onPay={handlePay}
                />
              ))}
            </AnimatePresence>
          </div>

          <div className="flex flex-col items-center justify-between gap-3 rounded-lg bg-white p-4 text-sm text-slate-600 shadow-soft dark:bg-slate-900 dark:text-slate-300 md:flex-row">
            <span>
              Hiển thị {visibleBookings.length} / {filteredBookings.length} vé
            </span>
            <div className="flex items-center gap-2">
              <Button variant="outline" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>
                Trước
              </Button>
              <span className="px-2 font-semibold">
                {page} / {totalPages}
              </span>
              <Button variant="outline" disabled={page >= totalPages} onClick={() => setPage((current) => current + 1)}>
                Sau
              </Button>
            </div>
          </div>
        </>
      )}

      <TicketDetailDialog booking={selectedBooking} user={user} onClose={() => setSelectedBooking(null)} />

      <AnimatePresence>
        {confirmCancel && (
          <motion.div
            className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.96, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 16 }}
              className="w-full max-w-md rounded-lg bg-white p-5 shadow-2xl dark:bg-slate-900"
            >
              <div className="grid h-12 w-12 place-items-center rounded-full bg-rose-50 text-rose-600">
                <XCircle size={24} />
              </div>
              <h2 className="mt-4 text-xl font-bold text-slate-950 dark:text-white">Xác nhận hủy vé</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Booking #{confirmCancel._id.slice(-8).toUpperCase()} sẽ được hủy và số lượng vé được trả lại hệ thống.
              </p>
              <div className="mt-5 flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setConfirmCancel(null)} disabled={actionLoading}>
                  Không hủy
                </Button>
                <Button variant="danger" className="flex-1" onClick={() => void handleCancel(confirmCancel)} disabled={actionLoading}>
                  Hủy vé
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            className="fixed bottom-5 right-5 z-50 flex max-w-sm items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-800 shadow-2xl dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          >
            {toast.type === 'success' ? <TicketCheck className="text-[#14b8a6]" size={20} /> : <XCircle className="text-rose-600" size={20} />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TicketSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((item) => (
        <div key={item} className="h-72 animate-pulse rounded-lg bg-white shadow-soft dark:bg-slate-900 md:h-64" />
      ))}
    </div>
  );
}
