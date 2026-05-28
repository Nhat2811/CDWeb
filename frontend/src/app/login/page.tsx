'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { getErrorMessage } from '@/services/api';
import { useAuth } from '@/store/auth-store';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      router.push('/');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  function fillDemo(type: 'admin' | 'customer') {
    setEmail(type === 'admin' ? 'admin@gmail.com' : 'customer@example.com');
    setPassword('123456');
    setError('');
  }

  return (
    <div className="mx-auto max-w-md rounded bg-white p-6 shadow-soft ring-1 ring-sky-100">
      <h1 className="text-2xl font-bold">Đăng nhập</h1>
      <form onSubmit={onSubmit} className="mt-5 space-y-4">
        <input className="w-full" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input
          className="w-full"
          type="password"
          placeholder="Mật khẩu"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-sm text-rose-700">{error}</p>}
        <button disabled={loading} className="w-full rounded bg-moss px-4 py-2 font-semibold text-white shadow-sm hover:bg-[#0b897b] disabled:opacity-60">
          {loading ? 'Đang xử lý...' : 'Đăng nhập'}
        </button>
      </form>
      <p className="mt-4 text-sm">
        Chưa có tài khoản? <Link className="font-semibold text-coral" href="/register">Đăng ký</Link>
      </p>
      <div className="mt-5 rounded bg-sky-50 p-3 text-sm text-slate-700">
        <p className="font-semibold text-ink">Tài khoản demo</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button type="button" className="rounded bg-white px-3 py-2 font-semibold text-moss ring-1 ring-sky-100 hover:bg-mintwash" onClick={() => fillDemo('admin')}>
            Admin
          </button>
          <button type="button" className="rounded bg-white px-3 py-2 font-semibold text-moss ring-1 ring-sky-100 hover:bg-mintwash" onClick={() => fillDemo('customer')}>
            Customer
          </button>
        </div>
        <p className="mt-2 text-xs text-slate-500">Mật khẩu demo: 123456</p>
      </div>
    </div>
  );
}
