'use client';

import React, { useEffect, useState } from 'react';
import api from '@/services/api';
import { Order } from '@/types';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import Link from 'next/link';
import {
    HiOutlineClipboardList,
    HiOutlineCheckCircle,
    HiOutlineClock,
    HiOutlineXCircle,
    HiOutlineShoppingBag,
    HiOutlineArrowRight,
    HiOutlineUser,
    HiOutlineCreditCard,
    HiOutlineBan,
} from 'react-icons/hi';

const statusConfig: Record<string, { icon: any; className: string }> = {
    PENDING: { icon: HiOutlineClock, className: 'badge-pending' },
    PAID: { icon: HiOutlineCheckCircle, className: 'badge-paid' },
    COMPLETED: { icon: HiOutlineCheckCircle, className: 'badge-paid' },
    CANCELLED: { icon: HiOutlineXCircle, className: 'badge-cancelled' },
};

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await api.get('/orders');
                if (res.data.success && res.data.data) {
                    setOrders(res.data.data);
                }
            } catch (error: any) {
                toast.error(error.response?.data?.message || 'Failed to fetch orders');
            } finally {
                setLoading(false);
            }
        };
        if (user) {
            fetchOrders();
        } else {
            setLoading(false);
        }
    }, [user]);

    const handleConfirmOrder = async (orderId: string) => {
        try {
            const res = await api.patch(`/orders/${orderId}/status`, { status: 'PAID' });
            if (res.data.success) {
                toast.success('Order confirmed!');
                setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'PAID' } : o));
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to confirm order');
        }
    };

    const handleCancelOrder = async (orderId: string) => {
        try {
            const res = await api.patch(`/orders/${orderId}/status`, { status: 'CANCELLED' });
            if (res.data.success) {
                toast.success('Order cancelled');
                setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'CANCELLED' } : o));
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to cancel order');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-t-transparent" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="text-center py-16 animate-fade-in">
                <HiOutlineClipboardList className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
                <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Access Denied</h2>
                <p className="mt-2" style={{ color: 'var(--text-muted)' }}>Please log in to view your orders.</p>
                <Link href="/login" className="btn-primary inline-flex items-center gap-2 mt-6">
                    Go to Login <HiOutlineArrowRight className="w-4 h-4" />
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto animate-fade-in">
            <h1 className="text-2xl sm:text-3xl font-extrabold mb-8 flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
                <HiOutlineClipboardList className="w-7 h-7" style={{ color: 'var(--accent)' }} />
                {user.role === 'ADMIN' ? 'All Orders' : 'My Orders'}
            </h1>

            {orders.length === 0 ? (
                <div className="glass-card text-center py-16 px-4">
                    <HiOutlineShoppingBag className="w-14 h-14 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
                    <p className="text-lg font-medium" style={{ color: 'var(--text-secondary)' }}>No orders yet.</p>
                    <Link href="/products" className="btn-secondary inline-flex items-center gap-2 mt-6">
                        Start Shopping <HiOutlineArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order, i) => {
                        const cfg = statusConfig[order.status] || statusConfig.PENDING;
                        const StatusIcon = cfg.icon;

                        return (
                            <div key={order.id} className="glass-card p-5 sm:p-6" style={{ animationDelay: `${i * 0.05}s` }}>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    {/* Left: Order Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                            <span className="text-sm font-semibold truncate" style={{ color: 'var(--accent)' }}>
                                                #{order.id.slice(0, 8)}
                                            </span>
                                            <span className={`badge ${cfg.className}`}>
                                                <StatusIcon className="w-3.5 h-3.5" />
                                                {order.status}
                                            </span>
                                            {/* Payment badge — Paid if payment SUCCESS or order status PAID */}
                                            {(order.payment?.status === 'SUCCESS' || order.status === 'PAID' || order.status === 'COMPLETED') ? (
                                                <span className="badge" style={{
                                                    background: 'rgba(16,185,129,0.15)',
                                                    color: '#10b981',
                                                    border: '1px solid rgba(16,185,129,0.35)',
                                                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                                                    fontSize: '0.7rem', fontWeight: 700,
                                                    padding: '2px 8px', borderRadius: '999px',
                                                }}>
                                                    <HiOutlineCreditCard className="w-3.5 h-3.5" />
                                                    Paid via Stripe
                                                </span>
                                            ) : (
                                                <span className="badge" style={{
                                                    background: 'rgba(239,68,68,0.10)',
                                                    color: '#f87171',
                                                    border: '1px solid rgba(239,68,68,0.3)',
                                                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                                                    fontSize: '0.7rem', fontWeight: 700,
                                                    padding: '2px 8px', borderRadius: '999px',
                                                }}>
                                                    <HiOutlineBan className="w-3.5 h-3.5" />
                                                    Unpaid
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                            {new Date(order.createdAt).toLocaleDateString('en-US', {
                                                year: 'numeric', month: 'long', day: 'numeric',
                                                hour: '2-digit', minute: '2-digit'
                                            })}
                                        </p>

                                        {/* Admin: Customer Info */}
                                        {user?.role === 'ADMIN' && order.user && (
                                            <div className="mt-3 flex items-center gap-2 text-sm px-3 py-2 rounded-lg"
                                                style={{ background: 'var(--accent-light)', color: 'var(--text-secondary)' }}>
                                                <HiOutlineUser className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                                                <span className="font-medium">{order.user.name || 'Unknown'}</span>
                                                <span style={{ color: 'var(--text-muted)' }}>• {order.user.email}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Right: Price + Actions */}
                                    <div className="flex items-center gap-4">
                                        <p className="text-xl font-bold" style={{ color: 'var(--accent)' }}>
                                            ${(order.totalAmount || 0).toFixed(2)}
                                        </p>
                                        {user?.role === 'ADMIN' && order.status === 'PENDING' && (
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleConfirmOrder(order.id)}
                                                    className="btn-success flex items-center gap-1.5"
                                                >
                                                    <HiOutlineCheckCircle className="w-4 h-4" />
                                                    Confirm
                                                </button>
                                                <button
                                                    onClick={() => handleCancelOrder(order.id)}
                                                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl text-white transition-all"
                                                    style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', boxShadow: '0 2px 8px rgba(239,68,68,0.3)' }}
                                                >
                                                    <HiOutlineXCircle className="w-4 h-4" />
                                                    Cancel
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
