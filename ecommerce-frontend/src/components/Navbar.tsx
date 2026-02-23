'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useTheme } from '@/providers/ThemeProvider';
import { useState } from 'react';
import {
    HiOutlineShoppingBag,
    HiOutlineClipboardList,
    HiOutlinePlusCircle,
    HiOutlineLogin,
    HiOutlineUserAdd,
    HiOutlineLogout,
    HiOutlineMenu,
    HiOutlineX,
    HiOutlineMoon,
    HiOutlineSun,
    HiOutlineUser,
} from 'react-icons/hi';

export default function Navbar() {
    const { user, logout } = useAuth();
    const { cart } = useCart();
    const { theme, toggleTheme } = useTheme();
    const [mobileOpen, setMobileOpen] = useState(false);

    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

    const closeMobile = () => setMobileOpen(false);

    return (
        <nav className="glass-navbar sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo + Desktop Links */}
                    <div className="flex items-center gap-6">
                        <Link href="/" className="flex items-center gap-2" onClick={closeMobile}>
                            <span className="text-2xl">🛍️</span>
                            <span className="text-xl font-extrabold" style={{ color: 'var(--accent)' }}>
                                E-Shop
                            </span>
                        </Link>

                        <div className="hidden md:flex items-center gap-1">
                            <Link
                                href="/products"
                                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:bg-[var(--accent-light)]"
                                style={{ color: 'var(--text-secondary)' }}
                            >
                                <HiOutlineShoppingBag className="w-4 h-4" />
                                Products
                            </Link>
                        </div>
                    </div>

                    {/* Desktop Right Side */}
                    <div className="hidden md:flex items-center gap-2">
                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-lg transition-all hover:bg-[var(--accent-light)]"
                            style={{ color: 'var(--text-secondary)' }}
                            aria-label="Toggle theme"
                        >
                            {theme === 'dark' ? (
                                <HiOutlineSun className="w-5 h-5" />
                            ) : (
                                <HiOutlineMoon className="w-5 h-5" />
                            )}
                        </button>

                        {user ? (
                            <>
                                {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && (
                                    <Link
                                        href="/admin"
                                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:bg-[var(--accent-light)]"
                                        style={{ color: 'var(--accent)' }}
                                    >
                                        <HiOutlineClipboardList className="w-4 h-4" />
                                        Admin Panel
                                    </Link>
                                )}
                                <Link
                                    href="/orders"
                                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:bg-[var(--accent-light)]"
                                    style={{ color: 'var(--text-secondary)' }}
                                >
                                    <HiOutlineClipboardList className="w-4 h-4" />
                                    Orders
                                </Link>
                                {(!user || user.role === 'CUSTOMER') && (
                                    <Link
                                        href="/cart"
                                        className="relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:bg-[var(--accent-light)]"
                                        style={{ color: 'var(--text-secondary)' }}
                                    >
                                        <HiOutlineShoppingBag className="w-5 h-5" />
                                        Cart
                                        {cartCount > 0 && (
                                            <span
                                                className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white rounded-full"
                                                style={{ background: 'var(--danger)' }}
                                            >
                                                {cartCount}
                                            </span>
                                        )}
                                    </Link>
                                )}
                                <div
                                    className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium"
                                    style={{ color: 'var(--text-muted)' }}
                                >
                                    <HiOutlineUser className="w-4 h-4" />
                                    {user.name || user.email}
                                </div>
                                <button
                                    onClick={logout}
                                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:bg-[var(--danger-bg)]"
                                    style={{ color: 'var(--danger)' }}
                                >
                                    <HiOutlineLogout className="w-4 h-4" />
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:bg-[var(--accent-light)]"
                                    style={{ color: 'var(--text-secondary)' }}
                                >
                                    <HiOutlineLogin className="w-4 h-4" />
                                    Login
                                </Link>
                                <Link href="/register" className="btn-primary flex items-center gap-1.5 text-sm">
                                    <HiOutlineUserAdd className="w-4 h-4" />
                                    Register
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile: Theme + Hamburger */}
                    <div className="flex md:hidden items-center gap-2">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-lg"
                            style={{ color: 'var(--text-secondary)' }}
                        >
                            {theme === 'dark' ? <HiOutlineSun className="w-5 h-5" /> : <HiOutlineMoon className="w-5 h-5" />}
                        </button>

                        {(!user || user?.role === 'CUSTOMER') && (
                            <Link href="/cart" className="relative p-2" style={{ color: 'var(--text-secondary)' }}>
                                <HiOutlineShoppingBag className="w-5 h-5" />
                                {cartCount > 0 && (
                                    <span
                                        className="absolute -top-0.5 -right-0.5 flex items-center justify-center w-4 h-4 text-[9px] font-bold text-white rounded-full"
                                        style={{ background: 'var(--danger)' }}
                                    >
                                        {cartCount}
                                    </span>
                                )}
                            </Link>
                        )}

                        <button
                            onClick={() => setMobileOpen(!mobileOpen)}
                            className="p-2 rounded-lg"
                            style={{ color: 'var(--text-primary)' }}
                        >
                            {mobileOpen ? <HiOutlineX className="w-6 h-6" /> : <HiOutlineMenu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileOpen && (
                <div
                    className="md:hidden animate-slide-down border-t"
                    style={{ borderColor: 'var(--border-color)', background: 'var(--bg-secondary)' }}
                >
                    <div className="px-4 py-3 space-y-1">
                        <Link
                            href="/products"
                            onClick={closeMobile}
                            className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all"
                            style={{ color: 'var(--text-secondary)' }}
                        >
                            <HiOutlineShoppingBag className="w-5 h-5" />
                            Products
                        </Link>

                        {user ? (
                            <>
                                {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && (
                                    <Link
                                        href="/admin"
                                        onClick={closeMobile}
                                        className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all"
                                        style={{ color: 'var(--accent)' }}
                                    >
                                        <HiOutlineClipboardList className="w-5 h-5" />
                                        Admin Panel
                                    </Link>
                                )}
                                <Link
                                    href="/orders"
                                    onClick={closeMobile}
                                    className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all"
                                    style={{ color: 'var(--text-secondary)' }}
                                >
                                    <HiOutlineClipboardList className="w-5 h-5" />
                                    My Orders
                                </Link>
                                {(!user || user.role === 'CUSTOMER') && (
                                    <Link
                                        href="/cart"
                                        onClick={closeMobile}
                                        className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all"
                                        style={{ color: 'var(--text-secondary)' }}
                                    >
                                        <HiOutlineShoppingBag className="w-5 h-5" />
                                        Cart {cartCount > 0 && `(${cartCount})`}
                                    </Link>
                                )}

                                <div
                                    className="flex items-center gap-3 px-3 py-3 text-sm"
                                    style={{ color: 'var(--text-muted)' }}
                                >
                                    <HiOutlineUser className="w-5 h-5" />
                                    {user.name || user.email}
                                </div>

                                <button
                                    onClick={() => { logout(); closeMobile(); }}
                                    className="flex items-center gap-3 w-full px-3 py-3 rounded-lg text-sm font-medium transition-all"
                                    style={{ color: 'var(--danger)' }}
                                >
                                    <HiOutlineLogout className="w-5 h-5" />
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    onClick={closeMobile}
                                    className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all"
                                    style={{ color: 'var(--text-secondary)' }}
                                >
                                    <HiOutlineLogin className="w-5 h-5" />
                                    Login
                                </Link>
                                <Link
                                    href="/register"
                                    onClick={closeMobile}
                                    className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all"
                                    style={{ color: 'var(--accent)' }}
                                >
                                    <HiOutlineUserAdd className="w-5 h-5" />
                                    Register
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
