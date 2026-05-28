'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { CreditCard, ShieldCheck, TicketCheck, X } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QuantitySelector } from './quantity-selector';
import { PaymentSummary, calculateDiscount } from './payment-summary';
import { TicketTypeSelect, getTicketBenefits } from './ticket-type-select';
import { Ticket } from '@/types';

type TicketBookingCardProps = {
  tickets: Ticket[];
  selectedTicketId: string;
  quantity: number;
  submitting: boolean;
  error?: string;
  onTicketChange: (ticketId: string) => void;
  onQuantityChange: (quantity: number) => void;
  onSubmit: () => Promise<void>;
};

export function TicketBookingCard({
  tickets,
  selectedTicketId,
  quantity,
  submitting,
  error,
  onTicketChange,
  onQuantityChange,
  onSubmit,
}: TicketBookingCardProps) {
  const [discountCode, setDiscountCode] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const selectedTicket = useMemo(
    () => tickets.find((ticket) => ticket._id === selectedTicketId),
    [selectedTicketId, tickets],
  );
  const remaining = selectedTicket ? Math.max(selectedTicket.quantity - selectedTicket.sold, 0) : 0;
  const subtotal = (selectedTicket?.price ?? 0) * quantity;
  const total = Math.max(subtotal - calculateDiscount(subtotal, discountCode), 0);
  const soldRatio = selectedTicket && selectedTicket.quantity > 0 ? selectedTicket.sold / selectedTicket.quantity : 0;
  const status =
    remaining === 0 ? { label: 'Hết vé', tone: 'rose' as const } :
    soldRatio >= 0.8 || remaining <= 10 ? { label: 'Sắp hết vé', tone: 'amber' as const } :
    { label: 'Còn vé', tone: 'teal' as const };

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!selectedTicket || remaining === 0) return;
    setConfirmOpen(true);
  }

  return (
    <>
      <motion.aside
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.35, delay: 0.08 }}
        className="lg:sticky lg:top-24 lg:self-start"
      >
        <Card className="overflow-hidden">
          <div className="border-b border-slate-200 bg-gradient-to-r from-teal-50 to-white p-5 dark:border-slate-800 dark:from-teal-950/40 dark:to-slate-900">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase text-[#14b8a6]">Đặt vé sự kiện</p>
                <h2 className="mt-1 text-2xl font-extrabold text-slate-950 dark:text-white">Chọn vé</h2>
              </div>
              <Badge tone={status.tone}>{status.label}</Badge>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 p-5">
            <TicketTypeSelect tickets={tickets} selectedId={selectedTicketId} onChange={onTicketChange} />

            {selectedTicket && (
              <div className="rounded-lg border border-teal-100 bg-teal-50 p-4 dark:border-teal-900 dark:bg-teal-950/30">
                <p className="font-semibold text-slate-950 dark:text-white">Quyền lợi vé {selectedTicket.name}</p>
                <ul className="mt-2 space-y-1 text-sm text-slate-600 dark:text-slate-300">
                  {getTicketBenefits(selectedTicket.name).map((benefit) => (
                    <li key={benefit} className="flex items-center gap-2">
                      <ShieldCheck size={15} className="text-[#14b8a6]" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Số lượng</label>
                <span className="text-sm text-slate-500">Còn {remaining} vé</span>
              </div>
              <QuantitySelector value={quantity} max={remaining} disabled={!selectedTicket || remaining === 0} onChange={onQuantityChange} />
            </div>

            <PaymentSummary
              price={selectedTicket?.price ?? 0}
              quantity={remaining === 0 ? 0 : quantity}
              discountCode={discountCode}
              onDiscountChange={setDiscountCode}
            />

            {error && <p className="rounded bg-rose-50 p-3 text-sm font-medium text-rose-700 dark:bg-rose-950 dark:text-rose-200">{error}</p>}

            <Button className="h-12 w-full text-base" disabled={submitting || !selectedTicket || remaining === 0}>
              <CreditCard size={19} />
              {submitting ? 'Đang xử lý...' : 'Đặt vé & Thanh toán'}
            </Button>
          </form>
        </Card>
      </motion.aside>

      <AnimatePresence>
        {confirmOpen && selectedTicket && (
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
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-950 dark:text-white">Xác nhận thanh toán</h3>
                  <p className="mt-1 text-sm text-slate-500">Kiểm tra thông tin trước khi tạo booking.</p>
                </div>
                <Button type="button" variant="ghost" className="h-9 w-9 p-0" onClick={() => setConfirmOpen(false)}>
                  <X size={18} />
                </Button>
              </div>
              <div className="mt-5 space-y-3 rounded-lg bg-slate-50 p-4 text-sm dark:bg-slate-800">
                <div className="flex justify-between"><span>Loại vé</span><strong>{selectedTicket.name}</strong></div>
                <div className="flex justify-between"><span>Số lượng</span><strong>{quantity}</strong></div>
                <div className="flex justify-between"><span>Tổng thanh toán</span><strong>{total.toLocaleString('vi-VN')}đ</strong></div>
              </div>
              <div className="mt-5 flex gap-3">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setConfirmOpen(false)}>
                  Hủy
                </Button>
                <Button
                  type="button"
                  className="flex-1"
                  disabled={submitting}
                  onClick={async () => {
                    setConfirmOpen(false);
                    await onSubmit();
                  }}
                >
                  <TicketCheck size={18} />
                  Thanh toán
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
