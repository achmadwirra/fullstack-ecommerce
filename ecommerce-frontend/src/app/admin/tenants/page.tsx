'use client';

import React, { useState, useEffect } from 'react';
import api from '@/services/api';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';

export default function TenantsPage() {
    const [tenants, setTenants] = useState([]);
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const { user } = useAuth();

    const fetchTenants = async () => {
        try {
            const res = await api.get('/admin/tenants');
            if (res.data.success) {
                setTenants(res.data.data);
            }
        } catch (error) {
            toast.error('Failed to load tenants');
        }
    };

    useEffect(() => {
        if (user?.role === 'SUPER_ADMIN') {
            fetchTenants();
        }
    }, [user]);

    if (!user || user.role !== 'SUPER_ADMIN') {
        return <div className="text-center py-16 text-xl">Access Denied. Super Admins only.</div>;
    }

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await api.post('/admin/tenants', { name, slug });
            if (res.data.success) {
                toast.success('Tenant created');
                setName('');
                setSlug('');
                fetchTenants();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to create');
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold mb-8">Manage Tenants</h1>
            
            <div className="glass-card p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">Create New Tenant</h2>
                <form onSubmit={handleCreate} className="flex gap-4 items-end">
                    <div className="flex-1">
                        <label className="block text-sm mb-1">Name</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border rounded" required />
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm mb-1">Slug (URL)</label>
                        <input type="text" value={slug} onChange={e => setSlug(e.target.value)} className="w-full p-2 border rounded" required />
                    </div>
                    <button type="submit" className="btn-primary py-2 px-6 h-[42px]">Create</button>
                </form>
            </div>

            <div className="glass-card overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-100 dark:bg-gray-800">
                        <tr>
                            <th className="p-4">Name</th>
                            <th className="p-4">Slug</th>
                            <th className="p-4">ID</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {tenants.map((t: any) => (
                            <tr key={t.id}>
                                <td className="p-4 font-medium">{t.name}</td>
                                <td className="p-4">{t.slug}</td>
                                <td className="p-4 text-xs text-gray-500">{t.id}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
