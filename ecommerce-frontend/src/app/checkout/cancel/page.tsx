'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { HiOutlineXCircle, HiOutlineArrowLeft, HiOutlineShoppingBag } from 'react-icons/hi';

export default function CheckoutCancel() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const orderId = searchParams.get('order_id');

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            <div className="glass-card max-w-md w-full p-8 text-center relative overflow-hidden animate-fade-in">
                {/* Decorative background blur */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-red-500/20 rounded-full blur-3xl"></div>
                
                <div className="relative z-10">
                    <div className="mx-auto w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6 shadow-inner">
                        <HiOutlineXCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
                    </div>
                    
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Payment Cancelled</h1>
                    <p className="text-gray-500 dark:text-gray-400 mb-8">
                        Your payment process was interrupted. Don't worry, no charges were made to your card.
                    </p>
                    
                    <div className="space-y-3">
                        <Link 
                            href="/cart" 
                            className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-indigo-500/30"
                        >
                            <HiOutlineArrowLeft className="w-5 h-5" />
                            Return to Cart
                        </Link>
                        <Link 
                            href="/products" 
                            className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl font-medium transition-all"
                        >
                            <HiOutlineShoppingBag className="w-5 h-5" />
                            Browse Products
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}