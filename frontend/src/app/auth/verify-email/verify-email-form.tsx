'use client';

import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { getErrorMessage } from '@/services/api';
import { verifyEmail } from '@/services/auth.service';

export function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Không tìm thấy token xác thực.');
      return;
    }

    verifyEmail(token)
      .then(() => {
        setStatus('success');
        setMessage('Xác thực email thành công! Bạn có thể đăng nhập ngay bây giờ.');
      })
      .catch((err) => {
        setStatus('error');
        setMessage(getErrorMessage(err));
      });
  }, [token]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-slate-950">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl dark:bg-slate-900">
        <div className="flex flex-col items-center text-center">
          {status === 'loading' && (
            <>
              <Loader2 className="mb-4 h-12 w-12 animate-spin text-[#14b8a6]" />
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Đang xác thực...</h2>
              <p className="mt-2 text-slate-500">Vui lòng đợi trong giây lát.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle2 className="mb-4 h-16 w-16 text-[#14b8a6]" />
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Thành công!</h2>
              <p className="mt-2 text-slate-500">{message}</p>
              <Link href="/login" className="mt-6 flex h-10 w-full items-center justify-center rounded bg-[#14b8a6] px-4 py-2 font-semibold text-white shadow-sm hover:bg-teal-600 transition">
                Đến trang đăng nhập
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="mb-4 h-16 w-16 text-rose-500" />
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Xác thực thất bại</h2>
              <p className="mt-2 text-rose-600">{message}</p>
              <Link href="/" className="mt-6 flex h-10 w-full items-center justify-center rounded border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-800 hover:bg-slate-50 transition dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800">
                Về trang chủ
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
