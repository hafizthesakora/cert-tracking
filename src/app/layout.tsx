import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import AuthProvider from './providers'; // We will create this file next

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Certification Tracking Portal',
  description: 'Manage and track employee certifications efficiently.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-gray-50">
      <body className={`${inter.className} h-full`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
