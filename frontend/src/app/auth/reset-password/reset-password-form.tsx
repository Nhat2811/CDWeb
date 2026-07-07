'use client';

import { CheckCircle2, KeyRound, Loader2, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { getErrorMessage } from '@/services/api';
import { resetPassword } from '@/services/auth.service';

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-slate-950">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl dark:bg-slate-900">
          <XCircle className="mx-auto mb-4 h-16 w-16 text-rose-500" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Lỗi liên kết</h2>
          <p className="mt-2 text-rose-600">Không tìm thấy token đặt lại mật khẩu.</p>
          <Link href="/" className="mt-6 flex h-10 w-full items-center justify-center rounded border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-800 hover:bg-slate-50 transition dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800">
            Về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (password !== confirmPassword) {
      setStatus('error');
      setMessage('Mật khẩu xác nhận không khớp.');
      return;
    }
    if (password.length < 6) {
      setStatus('error');
      setMessage('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    setStatus('loading');
    setMessage('');
    
    try {
      await resetPassword(token as string, password);
      setStatus('success');
      setMessage('Mật khẩu của bạn đã được thay đổi thành công.');
    } catch (err) {
      setStatus('error');
      setMessage(getErrorMessage(err));
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-slate-50 p-4 dark:bg-slate-950">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl dark:bg-slate-900">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-teal-50 text-[#14b8a6] dark:bg-teal-900/30">
            <KeyRound size={24} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Đặt lại mật khẩu</h2>
          <p className="mt-2 text-sm text-slate-500">
            Nhập mật khẩu mới của bạn bên dưới.
          </p>
        </div>

        {status === 'success' ? (
          <div className="text-center">
            <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-[#14b8a6]" />
            <p className="font-semibold text-slate-900 dark:text-white">Thành công!</p>
            <p className="mt-2 text-sm text-slate-500">{message}</p>
            <Link href="/login" className="mt-6 flex h-10 w-full items-center justify-center rounded bg-[#14b8a6] px-4 py-2 font-semibold text-white shadow-sm hover:bg-teal-600 transition">
              Đến trang đăng nhập
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Mật khẩu mới
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-slate-300 bg-transparent px-4 py-3 text-sm focus:border-[#14b8a6] focus:outline-none focus:ring-1 focus:ring-[#14b8a6] dark:border-slate-700 dark:text-white"
              />
            </div>
            
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Xác nhận mật khẩu mới
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-slate-300 bg-transparent px-4 py-3 text-sm focus:border-[#14b8a6] focus:outline-none focus:ring-1 focus:ring-[#14b8a6] dark:border-slate-700 dark:text-white"
              />
            </div>

            {status === 'error' && (
              <p className="rounded border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200">
                {message}
              </p>
            )}

            <Button type="submit" className="h-12 w-full text-base" disabled={status === 'loading' || !password || !confirmPassword}>
              {status === 'loading' ? <Loader2 className="animate-spin" size={19} /> : null}
              {status === 'loading' ? 'Đang xử lý...' : 'Đổi mật khẩu'}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
