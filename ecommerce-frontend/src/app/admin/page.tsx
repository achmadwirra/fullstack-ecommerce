'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { HiOutlineUserGroup, HiOutlineArchive, HiOutlineChartBar, HiOutlineDocumentReport } from 'react-icons/hi';

export default function AdminDashboard() {
    const { user } = useAuth();

    if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN')) {
        return <div className="text-center py-16 text-xl">Access Denied. Admins only.</div>;
    }

    return (
        <div className="max-w-5xl mx-auto py-8 px-4 animate-fade-in">
            <h1 className="text-3xl font-bold mb-8 text-center">Admin Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Link href="/admin/users" className="glass-card p-6 flex flex-col items-center justify-center hover:scale-105 transition-transform cursor-pointer">
                    <div className="p-4 rounded-full bg-indigo-100 text-indigo-600 mb-4">
                        <HiOutlineUserGroup className="w-8 h-8" />
                    </div>
                    <h2 className="text-lg font-semibold">Users</h2>
                    <p className="text-sm text-gray-500 mt-2 text-center">Manage roles and access</p>
                </Link>

                {user.role === 'SUPER_ADMIN' && (
                    <Link href="/admin/tenants" className="glass-card p-6 flex flex-col items-center justify-center hover:scale-105 transition-transform cursor-pointer">
                        <div className="p-4 rounded-full bg-blue-100 text-blue-600 mb-4">
                            <HiOutlineUserGroup className="w-8 h-8" />
                        </div>
                        <h2 className="text-lg font-semibold">Tenants</h2>
                        <p className="text-sm text-gray-500 mt-2 text-center">Manage stores & accounts</p>
                    </Link>
                )}

                <Link href="/admin/products/create" className="glass-card p-6 flex flex-col items-center justify-center hover:scale-105 transition-transform cursor-pointer">
                    <div className="p-4 rounded-full bg-green-100 text-green-600 mb-4">
                        <HiOutlineArchive className="w-8 h-8" />
                    </div>
                    <h2 className="text-lg font-semibold">Products</h2>
                    <p className="text-sm text-gray-500 mt-2 text-center">Create and edit products</p>
                </Link>

                <Link href="/admin/inventory" className="glass-card p-6 flex flex-col items-center justify-center hover:scale-105 transition-transform cursor-pointer">
                    <div className="p-4 rounded-full bg-purple-100 text-purple-600 mb-4">
                        <HiOutlineChartBar className="w-8 h-8" />
                    </div>
                    <h2 className="text-lg font-semibold">Inventory</h2>
                    <p className="text-sm text-gray-500 mt-2 text-center">Track and adjust stock</p>
                </Link>

                <Link href="/admin/reports" className="glass-card p-6 flex flex-col items-center justify-center hover:scale-105 transition-transform cursor-pointer">
                    <div className="p-4 rounded-full bg-orange-100 text-orange-600 mb-4">
                        <HiOutlineDocumentReport className="w-8 h-8" />
                    </div>
                    <h2 className="text-lg font-semibold">Reports</h2>
                    <p className="text-sm text-gray-500 mt-2 text-center">Export CSV data</p>
                </Link>
            </div>
        </div>
    );
}
