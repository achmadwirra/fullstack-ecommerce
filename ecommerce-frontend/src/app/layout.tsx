import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import Navbar from '@/components/Navbar';
import { Toaster } from 'react-hot-toast';
import QueryProvider from '@/providers/QueryProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';

const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'] });

export const metadata: Metadata = {
  title: 'E-Shop — Premium E-Commerce',
  description: 'Your premium shopping destination with curated collections',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen flex flex-col`} suppressHydrationWarning>
        <ThemeProvider>
          <QueryProvider>
            <AuthProvider>
              <CartProvider>
                <Navbar />
                <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                  {children}
                </main>
                <Toaster
                  position="bottom-right"
                  toastOptions={{
                    style: {
                      background: 'var(--bg-card)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '0.75rem',
                    },
                  }}
                />
              </CartProvider>
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
