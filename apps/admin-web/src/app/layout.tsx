import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toast';
import { cn } from '@/lib/utils/cn';

export const metadata: Metadata = {
  title: 'One Recycle Admin',
  description: 'Admin dashboard for One Recycle platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" className="dark">
      <body className={cn('bg-background font-sans antialiased')}>
        <Toaster>{children}</Toaster>
      </body>
    </html>
  );
}
