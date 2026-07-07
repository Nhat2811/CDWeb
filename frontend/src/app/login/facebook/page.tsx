'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/store/auth-store';

export default function FacebookCallbackPage() {
  const router = useRouter();
  const { loginWithFacebook } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      // Facebook returns the access token in the URL hash, e.g. #access_token=...
      const hash = window.location.hash;
      if (!hash) {
        setError('Không tìm thấy thông tin đăng nhập từ Facebook.');
        return;
      }

      const params = new URLSearchParams(hash.substring(1)); // remove the #
      const accessToken = params.get('access_token');
      const errorReason = params.get('error');

      if (errorReason) {
        setError('Đăng nhập Facebook bị từ chối hoặc có lỗi: ' + errorReason);
        return;
      }

      if (accessToken) {
        try {
          const user = await loginWithFacebook(accessToken);
          if (user.role === 'admin' || user.role === 'staff') {
            router.push('/admin');
          } else {
            router.push('/');
          }
        } catch (err) {
          setError('Đăng nhập thất bại. Vui lòng thử lại.');
        }
      }
    };

    handleCallback();
  }, [loginWithFacebook, router]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="rounded bg-white p-8 text-center shadow-soft">
          <p className="text-rose-600 mb-4">{error}</p>
          <button onClick={() => router.push('/login')} className="rounded bg-moss px-4 py-2 text-white">
            Quay lại Đăng nhập
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-moss border-t-transparent"></div>
        <p className="mt-4 text-slate-500">Đang xử lý đăng nhập Facebook...</p>
      </div>
    </div>
  );
}
