'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineUserAdd, HiOutlineUser } from 'react-icons/hi';

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/auth/register', { name, email, password });
            toast.success('Registration successful! Please login.');
            router.push('/login');
        } catch (error: any) {
            toast.error(error.response?.data?.message || error.message || 'Registration failed.');
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
                        <HiOutlineUserAdd className="w-7 h-7" style={{ color: 'var(--accent)' }} />
                    </div>
                    <h2 className="text-2xl font-extrabold" style={{ color: 'var(--text-primary)' }}>Create Account</h2>
                    <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>Join us and start shopping</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Full Name</label>
                        <div className="relative">
                            <HiOutlineUser className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                            <input type="text" required className="input-field" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Email Address</label>
                        <div className="relative">
                            <HiOutlineMail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                            <input type="email" required className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Password</label>
                        <div className="relative">
                            <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                            <input type="password" required className="input-field" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
                        </div>
                    </div>
                    <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3">
                        {loading ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                        ) : (
                            <>
                                <HiOutlineUserAdd className="w-5 h-5" />
                                Sign Up
                            </>
                        )}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                    Already have an account?{' '}
                    <Link href="/login" className="font-semibold" style={{ color: 'var(--accent)' }}>Sign in</Link>
                </p>
            </div>
        </div>
    );
}
