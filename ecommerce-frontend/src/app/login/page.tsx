'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineLogin } from 'react-icons/hi';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { login } = useAuth();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/auth/login', { email, password });
            if (res.data?.data?.token) {
                const token = res.data.data.token;
                const base64Url = token.split('.')[1];
                let userPayload = { id: 'temp-id', email, role: 'CUSTOMER' as const };
                if (base64Url) {
                    try {
                        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
                            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                        }).join(''));
                        userPayload = JSON.parse(jsonPayload);
                    } catch (e) { }
                }

                login(token, {
                    id: userPayload.id || 'temp-id',
                    email: userPayload.email || email,
                    role: (userPayload.role as any) || 'CUSTOMER',
                });
                toast.success('Login successful!');
                router.push('/products');
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || error.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[75vh] animate-fade-in px-4">
            <div className="glass-card w-full max-w-md p-8 sm:p-10">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
                        style={{ background: 'var(--accent-light)' }}>
                        <HiOutlineLogin className="w-7 h-7" style={{ color: 'var(--accent)' }} />
                    </div>
                    <h2 className="text-2xl font-extrabold" style={{ color: 'var(--text-primary)' }}>Welcome Back</h2>
                    <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>Sign in to continue shopping</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                            Email Address
                        </label>
                        <div className="relative">
                            <HiOutlineMail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                            <input
                                type="email"
                                required
                                className="input-field"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                            Password
                        </label>
                        <div className="relative">
                            <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                            <input
                                type="password"
                                required
                                className="input-field"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                            />
                        </div>
                    </div>
                    <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3">
                        {loading ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                        ) : (
                            <>
                                <HiOutlineLogin className="w-5 h-5" />
                                Sign In
                            </>
                        )}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                    Don&apos;t have an account?{' '}
                    <Link href="/register" className="font-semibold" style={{ color: 'var(--accent)' }}>
                        Sign up now
                    </Link>
                </p>
            </div>
        </div>
    );
}
