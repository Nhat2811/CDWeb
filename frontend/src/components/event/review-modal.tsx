'use client';

import { Star, Loader2, MessageSquareText, X } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { getErrorMessage } from '@/services/api';
import { createReview } from '@/services/reviews.service';
import clsx from 'clsx';

type ReviewModalProps = {
  bookingId: string;
  eventTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export function ReviewModal({ bookingId, eventTitle, isOpen, onClose, onSuccess }: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (rating === 0) {
      setError('Vui lòng chọn số sao đánh giá');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await createReview(bookingId, rating, comment);
      onSuccess();
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md animate-in zoom-in-95 rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Đánh giá sự kiện</h2>
          <button onClick={onClose} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition">
            <X size={20} />
          </button>
        </div>

        <div className="mb-6 rounded-lg bg-slate-50 p-4 dark:bg-slate-800/50">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Sự kiện</p>
          <p className="font-semibold text-slate-900 dark:text-white">{eventTitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center">
            <p className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Bạn đánh giá sự kiện này mấy sao?</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110 focus:outline-none"
                >
                  <Star
                    size={36}
                    className={clsx(
                      'transition-colors',
                      star <= (hoverRating || rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'fill-transparent text-slate-300 dark:text-slate-700',
                    )}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
              <MessageSquareText size={16} /> Chia sẻ cảm nhận của bạn
            </label>
            <textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Sự kiện này thật tuyệt vời..."
              className="w-full resize-none rounded-lg border border-slate-300 bg-transparent p-3 text-sm focus:border-[#14b8a6] focus:outline-none focus:ring-1 focus:ring-[#14b8a6] dark:border-slate-700 dark:text-white"
            />
          </div>

          {error && (
            <p className="rounded border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200">
              {error}
            </p>
          )}

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Hủy
            </Button>
            <Button type="submit" disabled={submitting} className="flex-1">
              {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Gửi đánh giá
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
