import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'MySched Admin Dashboard',
  description: 'Admin panel for managing schedules, sections, and classes',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="bg-gray-50 text-gray-900">
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
