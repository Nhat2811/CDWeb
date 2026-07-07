'use client';

import { ArrowLeft, CheckCircle2, Loader2, Mail } from 'lucide-react';
import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { getErrorMessage } from '@/services/api';
import { forgotPassword } from '@/services/auth.service';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!email) return;

    setSubmitting(true);
    setError('');
    
    try {
      await forgotPassword(email);
      setSuccess(true);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-slate-50 p-4 dark:bg-slate-950">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl dark:bg-slate-900">
        <Link href="/login" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#14b8a6]">
          <ArrowLeft size={16} />
          Quay lại Đăng nhập
        </Link>
        
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-teal-50 text-[#14b8a6] dark:bg-teal-900/30">
            <Mail size={24} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Quên mật khẩu?</h2>
          <p className="mt-2 text-sm text-slate-500">
            Nhập email của bạn và chúng tôi sẽ gửi liên kết để đặt lại mật khẩu.
          </p>
        </div>

        {success ? (
          <div className="rounded-lg border border-teal-200 bg-teal-50 p-6 text-center dark:border-teal-900/50 dark:bg-teal-900/20">
            <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-[#14b8a6]" />
            <p className="font-semibold text-teal-800 dark:text-teal-200">
              Đã gửi liên kết khôi phục!
            </p>
            <p className="mt-2 text-sm text-teal-700/80 dark:text-teal-300/80">
              Vui lòng kiểm tra hộp thư đến (và mục thư rác) của {email}.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full rounded-lg border border-slate-300 bg-transparent px-4 py-3 text-sm focus:border-[#14b8a6] focus:outline-none focus:ring-1 focus:ring-[#14b8a6] dark:border-slate-700 dark:text-white"
              />
            </div>

            {error && (
              <p className="rounded border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200">
                {error}
              </p>
            )}

            <Button type="submit" className="h-12 w-full text-base" disabled={submitting || !email}>
              {submitting ? <Loader2 className="animate-spin" size={19} /> : null}
              {submitting ? 'Đang gửi...' : 'Gửi liên kết khôi phục'}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
