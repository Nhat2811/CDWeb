'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { CalendarDays, LayoutDashboard, LogOut, Ticket, UserRound } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '@/store/auth-store';

const nav = [
  { href: '/', label: 'Sự kiện', icon: CalendarDays },
  { href: '/my-tickets', label: 'Vé của tôi', icon: Ticket },
  { href: '/admin', label: 'Admin', icon: LayoutDashboard, admin: true },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-skywash via-white to-mintwash text-ink">
      <header className="sticky top-0 z-30 border-b border-sky-100 bg-white/90 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold">
            <span className="grid h-9 w-9 place-items-center rounded bg-moss text-white shadow-sm">
              <Ticket size={19} />
            </span>
            Event Booking
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {nav
              .filter((item) => !item.admin || user?.role === 'admin')
              .map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={clsx(
                      'flex items-center gap-2 rounded px-3 py-2 text-sm font-medium',
                      pathname === item.href ? 'bg-moss text-white shadow-sm' : 'text-slate-700 hover:bg-sky-50',
                    )}
                  >
                    <Icon size={17} />
                    {item.label}
                  </Link>
                );
              })}
          </nav>
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Link href="/profile" className="hidden items-center gap-2 rounded px-2 py-1 text-sm text-slate-700 hover:bg-sky-50 md:flex">
                  <span className="grid h-8 w-8 place-items-center rounded bg-moss text-white shadow-sm">
                    <UserRound size={16} />
                  </span>
                  {user.name}
                </Link>
                <button
                  className="rounded border border-sky-100 bg-white p-2 text-slate-700 hover:bg-sky-50"
                  title="Đăng xuất"
                  onClick={() => {
                    logout();
                    router.push('/');
                  }}
                >
                  <LogOut size={17} />
                </button>
              </>
            ) : (
              <Link className="rounded bg-coral px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#ff5959]" href="/login">
                Đăng nhập
              </Link>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
    </div>
  );
}
