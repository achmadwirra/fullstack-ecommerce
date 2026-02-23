'use client';

import Link from 'next/link';
import { HiOutlineShoppingBag, HiOutlineSparkles, HiOutlineArrowRight } from 'react-icons/hi';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If the user is authenticated and we're done loading the auth state
    if (!isLoading && user) {
      router.replace('/products'); // Redirect them to the products page immediately
    }
  }, [user, isLoading, router]);

  // Optionally, show a blank or loading state while checking to avoid a flash of the landing page
  if (isLoading || user) {
    return (
        <div className="min-h-[85vh] flex justify-center items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-t-transparent border-indigo-500" />
        </div>
    );
  }
  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center px-4 animate-fade-in">
      {/* Decorative gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div
          className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full blur-[100px] opacity-30 animate-gradient"
          style={{ background: 'linear-gradient(135deg, var(--accent), #a78bfa)' }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-[120px] opacity-20 animate-gradient"
          style={{ background: 'linear-gradient(135deg, #6366f1, #ec4899)', animationDelay: '2s' }}
        />
      </div>

      <div className="max-w-3xl text-center space-y-8">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
          style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}
        >
          <HiOutlineSparkles className="w-4 h-4" />
          Premium Collection 2026
        </div>

        {/* Hero Title */}
        <h1
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight"
          style={{ color: 'var(--text-primary)' }}
        >
          Discover Products{' '}
          <span
            className="bg-clip-text text-transparent animate-gradient"
            style={{
              backgroundImage: 'linear-gradient(135deg, var(--accent), #a78bfa, #ec4899)',
              backgroundSize: '200% 200%',
            }}
          >
            You&apos;ll Love
          </span>
        </h1>

        {/* Subtitle */}
        <p
          className="text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed"
          style={{ color: 'var(--text-secondary)' }}
        >
          Curated collections of high-quality items, designed to enhance your
          lifestyle. Shop with confidence and elegance.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
          <Link href="/products" className="btn-primary flex items-center justify-center gap-2 text-base px-8 py-4">
            <HiOutlineShoppingBag className="w-5 h-5" />
            Shop Now
            <HiOutlineArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/register" className="btn-secondary flex items-center justify-center gap-2 text-base px-8 py-4">
            Create Account
          </Link>
        </div>

        {/* Trust indicators */}
        <div className="flex flex-wrap justify-center gap-6 pt-8" style={{ color: 'var(--text-muted)' }}>
          <div className="flex items-center gap-2 text-sm">
            <span>🚀</span> Fast Delivery
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span>🔒</span> Secure Payment
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span>⭐</span> Top Quality
          </div>
        </div>
      </div>
    </div>
  );
}
