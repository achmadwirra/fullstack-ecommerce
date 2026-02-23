'use client';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { HiOutlineCheckCircle, HiOutlineShoppingBag, HiOutlineClipboardList } from 'react-icons/hi';
import { useCart } from '@/context/CartContext';

export default function CheckoutSuccess() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const sessionId = searchParams.get('session_id');
    const orderId = searchParams.get('order_id');
    const { fetchCart } = useCart();

    useEffect(() => {
        // Force refresh cart to 0
        fetchCart();
    }, [fetchCart]);

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            <div className="glass-card max-w-md w-full p-8 text-center relative overflow-hidden animate-fade-in">
                {/* Decorative background blur */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-green-500/20 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl"></div>
                
                <div className="relative z-10">
                    <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6 shadow-inner">
                        <HiOutlineCheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
                    </div>
                    
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Payment Successful!</h1>
                    <p className="text-gray-500 dark:text-gray-400 mb-8">
                        Thank you for your purchase. Your order has been confirmed and is now being processed.
                    </p>
                    
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 mb-8 border border-gray-100 dark:border-gray-700 text-left">
                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Order Reference:</div>
                        <div className="font-mono text-sm text-gray-900 dark:text-gray-300 break-all">{orderId || 'ORD-' + Math.random().toString(36).substr(2, 9)}</div>
                    </div>
                    
                    <div className="space-y-3">
                        <Link 
                            href="/orders" 
                            className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-indigo-500/30"
                        >
                            <HiOutlineClipboardList className="w-5 h-5" />
                            View Order Details
                        </Link>
                        <Link 
                            href="/products" 
                            className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl font-medium transition-all"
                        >
                            <HiOutlineShoppingBag className="w-5 h-5" />
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}