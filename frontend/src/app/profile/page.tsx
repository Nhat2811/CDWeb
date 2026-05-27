'use client';

import { FormEvent, useEffect, useState } from 'react';
import { LockKeyhole, Mail, MapPin, Phone, Save, UserRound } from 'lucide-react';
import { useProtected } from '@/hooks/use-protected';
import { getErrorMessage } from '@/services/api';
import { changePassword, getProfile, updateProfile } from '@/services/profile.service';
import { useAuth } from '@/store/auth-store';
import { ProfileStats, User } from '@/types';

const emptyStats: ProfileStats = {
  totalBookings: 0,
  paidBookings: 0,
  pendingBookings: 0,
  cancelledBookings: 0,
  totalTickets: 0,
  totalSpent: 0,
};

export default function ProfilePage() {
  useProtected();
  const { updateUser } = useAuth();
  const [form, setForm] = useState<Partial<User>>({});
  const [stats, setStats] = useState<ProfileStats>(emptyStats);
  const [password, setPassword] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = await getProfile();
      setForm(data.profile);
      setStats(data.stats);
      updateUser(data.profile);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function onSaveProfile(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const updated = await updateProfile({
        name: form.name,
        email: form.email,
        phone: form.phone,
        address: form.address,
        avatar: form.avatar,
        bio: form.bio,
      });
      setForm(updated);
      updateUser(updated);
      setMessage('Đã cập nhật hồ sơ.');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function onChangePassword(event: FormEvent) {
    event.preventDefault();
    setMessage('');
    setError('');
    if (password.newPassword !== password.confirmPassword) {
      setError('Mật khẩu mới không khớp.');
      return;
    }
    try {
      await changePassword(password.currentPassword, password.newPassword);
      setPassword({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setMessage('Đã đổi mật khẩu.');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  if (loading) return <div className="h-96 animate-pulse rounded bg-white shadow-soft ring-1 ring-sky-100" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded bg-white p-5 shadow-soft ring-1 ring-sky-100 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          {form.avatar ? (
            <img className="h-20 w-20 rounded object-cover ring-2 ring-moss/20" src={form.avatar} alt={form.name ?? 'Avatar'} />
          ) : (
            <div className="grid h-20 w-20 place-items-center rounded bg-moss text-white">
              <UserRound size={34} />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold">{form.name}</h1>
            <p className="flex items-center gap-2 text-sm text-slate-600">
              <Mail size={16} />
              {form.email}
            </p>
            <span className="mt-2 inline-flex rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
              {form.role}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-3">
          <div className="rounded bg-sky-50 p-3">
            <p className="text-slate-500">Booking</p>
            <strong className="text-xl">{stats.totalBookings}</strong>
          </div>
          <div className="rounded bg-emerald-50 p-3">
            <p className="text-slate-500">Vé hợp lệ</p>
            <strong className="text-xl">{stats.totalTickets}</strong>
          </div>
          <div className="rounded bg-rose-50 p-3">
            <p className="text-slate-500">Đã chi</p>
            <strong className="text-xl">{stats.totalSpent.toLocaleString('vi-VN')}đ</strong>
          </div>
        </div>
      </div>

      {(error || message) && (
        <div className={`rounded border p-3 ${error ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
          {error || message}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <section className="rounded bg-white p-5 shadow-soft ring-1 ring-sky-100">
          <h2 className="text-lg font-bold">Thông tin cá nhân</h2>
          <form onSubmit={onSaveProfile} className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="space-y-1">
              <span className="text-sm font-medium text-slate-600">Họ tên</span>
              <input className="w-full" value={form.name ?? ''} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium text-slate-600">Email</span>
              <input className="w-full" type="email" value={form.email ?? ''} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </label>
            <label className="space-y-1">
              <span className="flex items-center gap-2 text-sm font-medium text-slate-600"><Phone size={15} />Số điện thoại</span>
              <input className="w-full" value={form.phone ?? ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </label>
            <label className="space-y-1">
              <span className="flex items-center gap-2 text-sm font-medium text-slate-600"><MapPin size={15} />Địa chỉ</span>
              <input className="w-full" value={form.address ?? ''} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </label>
            <label className="space-y-1 md:col-span-2">
              <span className="text-sm font-medium text-slate-600">Avatar URL</span>
              <input className="w-full" value={form.avatar ?? ''} onChange={(e) => setForm({ ...form, avatar: e.target.value })} />
            </label>
            <label className="space-y-1 md:col-span-2">
              <span className="text-sm font-medium text-slate-600">Giới thiệu</span>
              <textarea className="w-full" rows={4} value={form.bio ?? ''} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
            </label>
            <button disabled={saving} className="flex items-center justify-center gap-2 rounded bg-moss px-4 py-2 font-semibold text-white shadow-sm hover:bg-[#0b897b] disabled:opacity-60">
              <Save size={17} />
              {saving ? 'Đang lưu...' : 'Lưu hồ sơ'}
            </button>
          </form>
        </section>

        <aside className="space-y-6">
          <section className="rounded bg-white p-5 shadow-soft ring-1 ring-sky-100">
            <h2 className="text-lg font-bold">Đổi mật khẩu</h2>
            <form onSubmit={onChangePassword} className="mt-4 space-y-3">
              <input className="w-full" type="password" placeholder="Mật khẩu hiện tại" value={password.currentPassword} onChange={(e) => setPassword({ ...password, currentPassword: e.target.value })} />
              <input className="w-full" type="password" placeholder="Mật khẩu mới" value={password.newPassword} onChange={(e) => setPassword({ ...password, newPassword: e.target.value })} />
              <input className="w-full" type="password" placeholder="Nhập lại mật khẩu mới" value={password.confirmPassword} onChange={(e) => setPassword({ ...password, confirmPassword: e.target.value })} />
              <button className="flex w-full items-center justify-center gap-2 rounded bg-coral px-4 py-2 font-semibold text-white shadow-sm hover:bg-[#ff5959]">
                <LockKeyhole size={17} />
                Đổi mật khẩu
              </button>
            </form>
          </section>

          <section className="rounded bg-white p-5 shadow-soft ring-1 ring-sky-100">
            <h2 className="text-lg font-bold">Thống kê vé</h2>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between"><span>Đã thanh toán</span><strong>{stats.paidBookings}</strong></div>
              <div className="flex justify-between"><span>Đang chờ</span><strong>{stats.pendingBookings}</strong></div>
              <div className="flex justify-between"><span>Đã hủy</span><strong>{stats.cancelledBookings}</strong></div>
              <div className="flex justify-between border-t border-sky-100 pt-3"><span>Tổng vé</span><strong>{stats.totalTickets}</strong></div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
