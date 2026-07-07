'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { getErrorMessage } from '@/services/api';
import { useAuth } from '@/store/auth-store';
import { GoogleLogin } from '@react-oauth/google';

export default function LoginPage() {
  const router = useRouter();
  const { login, loginWithGoogle, loginWithFacebook } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = await login(email, password);
      if (user.role === 'admin' || user.role === 'staff') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md rounded bg-white p-6 shadow-soft ring-1 ring-sky-100">
      <h1 className="text-2xl font-bold">Đăng nhập</h1>
      <form onSubmit={onSubmit} className="mt-5 space-y-4">
        <input className="w-full" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input
          className="w-full rounded border-slate-300"
          type="password"
          placeholder="Mật khẩu"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="flex justify-end">
          <Link href="/auth/forgot-password" className="text-sm font-semibold text-[#14b8a6] hover:underline">
            Quên mật khẩu?
          </Link>
        </div>
        {error && <p className="text-sm text-rose-700">{error}</p>}
        <button disabled={loading} className="w-full rounded bg-moss px-4 py-2 font-semibold text-white shadow-sm hover:bg-[#0b897b] disabled:opacity-60">
          {loading ? 'Đang xử lý...' : 'Đăng nhập'}
        </button>
      </form>

      <div className="my-5 flex items-center before:mt-0.5 before:flex-1 before:border-t before:border-slate-200 after:mt-0.5 after:flex-1 after:border-t after:border-slate-200">
        <p className="mx-4 mb-0 text-center text-sm font-medium text-slate-500">Hoặc</p>
      </div>
      <div className="flex flex-col items-center justify-center space-y-3">
        <GoogleLogin
          onSuccess={async (credentialResponse) => {
            if (credentialResponse.credential) {
              setLoading(true);
              setError('');
              try {
                const user = await loginWithGoogle(credentialResponse.credential);
                if (user.role === 'admin' || user.role === 'staff') {
                  router.push('/admin');
                } else {
                  router.push('/');
                }
              } catch (err) {
                setError(getErrorMessage(err));
              } finally {
                setLoading(false);
              }
            }
          }}
          onError={() => setError('Đăng nhập Google thất bại')}
        />
        <button
          type="button"
          onClick={() => {
            const clientId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || 'YOUR_FACEBOOK_APP_ID';
            const redirectUri = encodeURIComponent(`${window.location.origin}/login/facebook`);
            window.location.href = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token&scope=email,public_profile`;
          }}
          className="w-full max-w-[200px] rounded bg-[#1877F2] px-4 py-2 font-semibold text-white shadow-sm hover:bg-[#166FE5]"
        >
          Đăng nhập Facebook
        </button>
      </div>

      <p className="mt-6 text-sm">
        Chưa có tài khoản? <Link className="font-semibold text-coral" href="/register">Đăng ký</Link>
      </p>
    </div>
  );
}
