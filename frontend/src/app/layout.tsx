import type { Metadata } from 'next';
import './globals.css';
import { AppShell } from '@/components/app-shell';
import { Providers } from '@/components/providers';

export const metadata: Metadata = {
  title: 'Event Booking System',
  description: 'Hệ thống đặt chỗ và quản lý vé sự kiện',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
