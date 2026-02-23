'use client';

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'next/navigation';
import { HiOutlineShieldCheck, HiOutlineLockClosed, HiOutlineCreditCard } from 'react-icons/hi';

export default function CheckoutPage() {
    const { cart, isLoading, fetchCart } = useCart();
    const { user } = useAuth();
    const [processing, setProcessing] = useState(false);
    const router = useRouter();

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-t-transparent" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="text-center py-16 animate-fade-in">
                <HiOutlineLockClosed className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
                <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Access Denied</h2>
                <p className="mt-2" style={{ color: 'var(--text-muted)' }}>Please log in to proceed.</p>
            </div>
        );
    }

    const subtotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

    const handleCheckout = async () => {
        if (cart.length === 0) {
            toast.error('Your cart is empty');
            return;
        }

        setProcessing(true);
        try {
            const idempotencyKey = uuidv4();
            const res = await api.post('orders/checkout', {}, {
                headers: { 'Idempotency-Key': idempotencyKey }
            });

            if (res.data.success) {
                const orderId = res.data.data.id;
                
                try {
                    const paymentRes = await api.post('payment/create-checkout', { orderId });
                    if (paymentRes.data.success && paymentRes.data.data.url) {
                        toast.loading('Redirecting to Stripe...', { duration: 2000 });
                        await fetchCart();
                        window.location.href = paymentRes.data.data.url;
                        return;
                    }
                } catch (paymentErr: any) {
                    console.error("Payment setup failed. Raw Error:", paymentErr);
                    console.error("Response data:", paymentErr.response?.data);
                    toast.error(paymentErr.response?.data?.message || "Order created but payment setup failed.");
                }

                toast.success(res.data.message || 'Order created successfully');
                await fetchCart();
                router.push('/orders');
            } else {
                toast.error(res.data.message);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Checkout failed');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-4 animate-fade-in">
            <h1 className="text-2xl sm:text-3xl font-extrabold mb-8 text-center flex items-center justify-center gap-3" style={{ color: 'var(--text-primary)' }}>
                <HiOutlineCreditCard className="w-7 h-7" style={{ color: 'var(--accent)' }} />
                Checkout
            </h1>

            <div className="glass-card overflow-hidden">
                <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--bg-card-hover)' }}>
                    <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                        Order Summary
                    </h2>
                </div>

                <ul className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
                    {cart.map((item) => (
                        <li key={item.id} className="px-6 py-4 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <span className="flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold"
                                    style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
                                    {item.quantity}×
                                </span>
                                <span className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                                    {item.product.name}
                                </span>
                            </div>
                            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                                ${(item.product.price * item.quantity).toFixed(2)}
                            </span>
                        </li>
                    ))}
                </ul>

                <div className="p-6" style={{ borderTop: '1px solid var(--border-color)', background: 'var(--bg-card-hover)' }}>
                    <div className="flex justify-between items-center mb-6">
                        <span className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Total</span>
                        <span className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>${subtotal.toFixed(2)}</span>
                    </div>
                    <button
                        type="button"
                        onClick={handleCheckout}
                        disabled={processing || cart.length === 0}
                        className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 text-base"
                    >
                        {processing ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                        ) : (
                            <>
                                <HiOutlineShieldCheck className="w-5 h-5" />
                                Confirm Order & Pay
                            </>
                        )}
                    </button>
                    <div className="flex items-center justify-center gap-2 mt-4" style={{ color: 'var(--text-muted)' }}>
                        <HiOutlineLockClosed className="w-3.5 h-3.5" />
                        <span className="text-xs">Secured with 256-bit encryption by Stripe</span>
                    </div>
                </div>
            </div>
        </div>
    );
}