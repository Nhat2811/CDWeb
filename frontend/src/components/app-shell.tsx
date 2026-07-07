'use client';
import { useEffect } from 'react';

import clsx from 'clsx';
import { CalendarDays, Facebook, Instagram, LayoutDashboard, LogOut, Mail, MapPin, Phone, Ticket, UserRound } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/store/auth-store';

const nav = [
  { href: '/', label: 'Sự kiện', icon: CalendarDays },
  { href: '/my-tickets', label: 'Vé của tôi', icon: Ticket },
  { href: '/admin', label: 'Admin', icon: LayoutDashboard, admin: true },
];

const footerLinks = [
  { href: '/', label: 'Khám phá sự kiện' },
  { href: '/my-tickets', label: 'Vé của tôi' },
  { href: '/profile', label: 'Tài khoản' },
];

const supportLinks = [
  { href: '/', label: 'Hướng dẫn đặt vé' },
  { href: '/payments/result', label: 'Tra cứu thanh toán' },
  { href: '/login', label: 'Đăng nhập' },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, ready } = useAuth();
  const year = new Date().getFullYear();

  useEffect(() => {
    if (ready && (user?.role === 'admin' || user?.role === 'staff') && !pathname.startsWith('/admin')) {
      router.replace('/admin');
    }
  }, [ready, user, pathname, router]);

  if (pathname.startsWith('/admin')) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 md:p-8">
        <main className="mx-auto w-full max-w-[1400px]">{children}</main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-skywash via-white to-mintwash text-ink dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-200">
      <header className="sticky top-0 z-30 border-b border-sky-100 bg-white/90 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold">
            <span className="grid h-9 w-9 place-items-center rounded bg-moss text-white shadow-sm">
              <Ticket size={19} />
            </span>
            Event Booking
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {nav
              .filter((item) => !item.admin || user?.role === 'admin' || user?.role === 'staff')
              .map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={clsx(
                      'flex items-center gap-2 rounded px-3 py-2 text-sm font-medium',
                      pathname === item.href ? 'bg-moss text-white shadow-sm' : 'text-slate-700 hover:bg-sky-50 dark:text-slate-300 dark:hover:bg-slate-800',
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

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6">{children}</main>

      <footer className="mt-8 border-t border-teal-100 bg-white/92 backdrop-blur dark:border-slate-800 dark:bg-slate-950/92">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-[1.4fr_0.8fr_0.8fr_1fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-lg font-extrabold text-slate-950 dark:text-white">
              <span className="grid h-10 w-10 place-items-center rounded bg-[#14b8a6] text-white shadow-sm">
                <Ticket size={20} />
              </span>
              Event Booking
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-6 text-slate-500">
              Nền tảng đặt vé sự kiện, quản lý booking, thanh toán và check-in QR cho hệ thống bán vé trực tuyến.
            </p>
            <div className="mt-5 flex items-center gap-2">
              <FooterIconButton label="Facebook">
                <Facebook size={17} />
              </FooterIconButton>
              <FooterIconButton label="Instagram">
                <Instagram size={17} />
              </FooterIconButton>
              <FooterIconButton label="Email">
                <Mail size={17} />
              </FooterIconButton>
            </div>
          </div>

          <FooterLinkGroup title="Điều hướng" links={footerLinks} />
          <FooterLinkGroup title="Hỗ trợ" links={supportLinks} />

          <div>
            <h2 className="text-sm font-extrabold uppercase tracking-wide text-slate-950 dark:text-white">Liên hệ</h2>
            <div className="mt-4 space-y-3 text-sm text-slate-500 dark:text-slate-400">
              <ContactLine icon={<MapPin size={17} />} text="TP. Hồ Chí Minh, Việt Nam" />
              <ContactLine icon={<Phone size={17} />} text="0900 000 000" />
              <ContactLine icon={<Mail size={17} />} text="support@eventbooking.local" />
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 dark:border-slate-800">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 text-sm text-slate-500 dark:text-slate-400 sm:flex-row sm:items-center sm:justify-between">
            <p>© {year} Event Booking System. All rights reserved.</p>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              <span>Thanh toán an toàn</span>
              <span>QR check-in</span>
              <span>Hỗ trợ mọi thiết bị</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FooterLinkGroup({ title, links }: { title: string; links: Array<{ href: string; label: string }> }) {
  return (
    <div>
      <h2 className="text-sm font-extrabold uppercase tracking-wide text-slate-950 dark:text-white">{title}</h2>
      <div className="mt-4 grid gap-3 text-sm">
        {links.map((link) => (
          <Link key={`${title}-${link.label}`} href={link.href} className="text-slate-500 transition hover:text-[#14b8a6]">
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

function ContactLine({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[#14b8a6]">{icon}</span>
      <span>{text}</span>
    </div>
  );
}

function FooterIconButton({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      title={label}
      className="grid h-9 w-9 place-items-center rounded border border-teal-100 bg-teal-50 text-[#14b8a6] transition hover:bg-[#14b8a6] hover:text-white"
    >
      {children}
    </button>
  );
}
