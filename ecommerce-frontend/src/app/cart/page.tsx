'use client';

import React from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { HiOutlineShoppingCart, HiOutlinePhotograph, HiOutlineArrowRight, HiOutlineShoppingBag } from 'react-icons/hi';

export default function CartPage() {
    const { cart, isLoading } = useCart();
    const { user, isLoading: authLoading } = useAuth();

    if (authLoading || isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-t-transparent" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="text-center py-16 animate-fade-in">
                <HiOutlineShoppingCart className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
                <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Please log in</h2>
                <p className="mt-2" style={{ color: 'var(--text-muted)' }}>Sign in to view your cart</p>
                <Link href="/login" className="btn-primary inline-flex items-center gap-2 mt-6">
                    Go to Login <HiOutlineArrowRight className="w-4 h-4" />
                </Link>
            </div>
        );
    }

    const subtotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            <h1 className="text-2xl sm:text-3xl font-extrabold mb-8 flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
                <HiOutlineShoppingCart className="w-7 h-7" style={{ color: 'var(--accent)' }} />
                Shopping Cart
            </h1>

            {cart.length === 0 ? (
                <div className="glass-card text-center py-16 px-4">
                    <HiOutlineShoppingBag className="w-14 h-14 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
                    <p className="text-lg font-medium" style={{ color: 'var(--text-secondary)' }}>Your cart is empty.</p>
                    <Link href="/products" className="btn-secondary inline-flex items-center gap-2 mt-6">
                        Continue Shopping <HiOutlineArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Cart Items */}
                    {cart.map((item) => (
                        <div key={item.id} className="glass-card p-4 sm:p-5 flex items-center gap-4">
                            <div
                                className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden flex items-center justify-center"
                                style={{ background: 'var(--bg-card-hover)' }}
                            >
                                {item.product.imageUrl ? (
                                    <img src={item.product.imageUrl.startsWith('http') ? item.product.imageUrl : `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000'}${item.product.imageUrl}`} alt={item.product.name} className="w-full h-full object-cover" />
                                ) : (
                                    <HiOutlinePhotograph className="w-8 h-8" style={{ color: 'var(--text-muted)' }} />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-base font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                                    {item.product.name}
                                </h3>
                                <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
                                    ${item.product.price.toFixed(2)} × {item.quantity}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-bold" style={{ color: 'var(--accent)' }}>
                                    ${(item.product.price * item.quantity).toFixed(2)}
                                </p>
                            </div>
                        </div>
                    ))}

                    {/* Summary */}
                    <div className="glass-card p-6 mt-6">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Subtotal</span>
                            <span className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>${subtotal.toFixed(2)}</span>
                        </div>
                        <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Shipping and taxes calculated at checkout.</p>
                        <Link href="/checkout" className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 text-base">
                            Proceed to Checkout <HiOutlineArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
