'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { getErrorMessage } from '@/services/api';
import { useAuth } from '@/store/auth-store';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await register(form.name, form.email, form.password);
      router.push('/');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md rounded bg-white p-6 shadow-soft ring-1 ring-sky-100">
      <h1 className="text-2xl font-bold">Đăng ký</h1>
      <form onSubmit={onSubmit} className="mt-5 space-y-4">
        <input className="w-full" placeholder="Họ tên" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className="w-full" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input
          className="w-full"
          type="password"
          placeholder="Mật khẩu"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        {error && <p className="text-sm text-rose-700">{error}</p>}
        <button disabled={loading} className="w-full rounded bg-moss px-4 py-2 font-semibold text-white shadow-sm hover:bg-[#0b897b] disabled:opacity-60">
          {loading ? 'Đang xử lý...' : 'Tạo tài khoản'}
        </button>
      </form>
      <p className="mt-4 text-sm">
        Đã có tài khoản? <Link className="font-semibold text-coral" href="/login">Đăng nhập</Link>
      </p>
    </div>
  );
}
