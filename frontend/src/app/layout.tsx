import type { Metadata } from 'next';
import './globals.css';
import { AppShell } from '@/components/app-shell';
import { Providers } from '@/components/providers';

import { ThemeProvider } from '@/components/theme-provider';

export const metadata: Metadata = {
  title: 'Event Booking System',
  description: 'Hệ thống đặt chỗ và quản lý vé sự kiện',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <Providers>
            <AppShell>{children}</AppShell>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
