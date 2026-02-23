'use client';

import React, { useState, useEffect } from 'react';
import api from '@/services/api';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';

export default function UsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [tenants, setTenants] = useState<any[]>([]);
    const { user: currentUser } = useAuth();
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [usersRes, tenantsRes] = await Promise.all([
                api.get('/admin/users'),
                currentUser?.role === 'SUPER_ADMIN' ? api.get('/admin/tenants') : Promise.resolve({ data: { data: [] } })
            ]);
            
            if (usersRes.data.success) {
                setUsers(usersRes.data.data);
            }
            if (tenantsRes.data?.success) {
                setTenants(tenantsRes.data.data);
            }
        } catch (error) {
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'ADMIN') {
            fetchData();
        }
    }, [currentUser]);

    const handleUpdateUser = async (userId: string, field: string, value: string) => {
        try {
            const res = await api.put(`/admin/users/${userId}`, { [field]: value });
            if (res.data.success) {
                toast.success('User updated successfully');
                fetchData();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update user');
        }
    };

    const handleEditName = (u: any) => {
        const newName = window.prompt("Edit User's Full Name:", u.name);
        if (newName && newName.trim() !== "" && newName !== u.name) {
            handleUpdateUser(u.id, 'name', newName.trim());
        }
    };

    const handleDeleteUser = async (u: any) => {
        if (u.id === currentUser?.id) {
            toast.error("You cannot delete yourself.");
            return;
        }
        
        if (window.confirm(`Are you sure you want to completely delete the user "${u.name}" (${u.email})? This action cannot be undone.`)) {
            try {
                const res = await api.delete(`/admin/users/${u.id}`);
                if (res.data.success) {
                    toast.success('User deleted successfully');
                    fetchData();
                }
            } catch (error: any) {
                toast.error(error.response?.data?.message || 'Failed to delete user');
            }
        }
    };

    if (!currentUser || (currentUser.role !== 'SUPER_ADMIN' && currentUser.role !== 'ADMIN')) {
        return <div className="text-center py-16 text-xl">Access Denied. Admins only.</div>;
    }

    return (
        <div className="max-w-6xl mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold mb-8">User Management</h1>

            <div className="glass-card overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading users...</div>
                ) : (
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-100 dark:bg-gray-800 uppercase text-xs">
                            <tr>
                                <th className="p-4">Name</th>
                                <th className="p-4">Email</th>
                                <th className="p-4">Role</th>
                                {currentUser.role === 'SUPER_ADMIN' && <th className="p-4">Tenant (Store)</th>}
                                <th className="p-4">Joined</th>
                                <th className="p-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {users.map((u: any) => (
                                <tr key={u.id}>
                                            <td className="p-4 font-medium">{u.name}</td>
                                            <td className="p-4 text-gray-500">{u.email}</td>
                                            <td className="p-4">
                                                <select 
                                                    value={u.role} 
                                                    onChange={(e) => handleUpdateUser(u.id, 'role', e.target.value)}
                                                    className="custom-select"
                                                    disabled={u.id === currentUser.id} // Prevent self-demotion
                                                >
                                            <option value="CUSTOMER">Customer</option>
                                            <option value="ADMIN">Admin</option>
                                            {currentUser.role === 'SUPER_ADMIN' && <option value="SUPER_ADMIN">Super Admin</option>}
                                        </select>
                                    </td>
                                    {currentUser.role === 'SUPER_ADMIN' && (
                                        <td className="p-4">
                                            <select 
                                                value={u.tenantId || ''} 
                                                onChange={(e) => handleUpdateUser(u.id, 'tenantId', e.target.value)}
                                                className="custom-select w-[160px]"
                                                disabled={u.id === currentUser.id} // Prevent self-moving
                                            >
                                                <option value="" disabled>Select Store</option>
                                                {tenants.map(t => (
                                                    <option key={t.id} value={t.id}>{t.name}</option>
                                                ))}
                                            </select>
                                        </td>
                                    )}
                                    <td className="p-4 text-xs text-gray-400">
                                        {new Date(u.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center justify-center gap-3">
                                            <button 
                                                onClick={() => handleEditName(u)} 
                                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                                                title="Edit Name"
                                                type="button"
                                            >
                                                <HiOutlinePencil className="w-5 h-5" />
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteUser(u)} 
                                                disabled={u.id === currentUser.id}
                                                className={`p-1.5 rounded ${u.id === currentUser.id ? 'text-gray-300' : 'text-red-600 hover:bg-red-50'}`}
                                                title={u.id === currentUser.id ? "Cannot delete yourself" : "Delete User"}
                                                type="button"
                                            >
                                                <HiOutlineTrash className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
