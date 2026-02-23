'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import toast from 'react-hot-toast';

export default function InventoryPage() {
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [adjustments, setAdjustments] = useState<Record<string, number>>({});
    
    const fetchProducts = async () => {
        try {
            const res = await api.get('/products');
            if (res.data.success) {
                setProducts(res.data.data);
            }
        } catch (error) {
            toast.error('Failed to load products');
        }
    };

    useEffect(() => {
        if (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') {
            fetchProducts();
        }
    }, [user]);

    if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN')) {
        return <div className="text-center py-16 text-xl">Access Denied. Admins only.</div>;
    }

    const handleAdjust = async (productId: string) => {
        const qty = adjustments[productId];
        if (!qty) return;

        try {
            const res = await api.post('/inventory/adjust', {
                productId,
                quantity: qty,
                type: qty > 0 ? 'RESTOCK' : 'DAMAGE', // basic assumption
                reason: 'Manual adjustment'
            });
            if (res.data.success) {
                toast.success('Stock adjusted');
                setAdjustments(prev => ({ ...prev, [productId]: 0 }));
                fetchProducts();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to adjust stock');
        }
    };

    return (
        <div className="max-w-5xl mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold mb-8">Inventory Management</h1>

            <div className="glass-card overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-100 dark:bg-gray-800 uppercase text-xs">
                        <tr>
                            <th className="p-4">Product</th>
                            <th className="p-4 text-center">Current Stock</th>
                            <th className="p-4">Adjust Stock (+/-)</th>
                            <th className="p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {products.map((p: any) => (
                            <tr key={p.id}>
                                <td className="p-4 font-medium">{p.name}</td>
                                <td className="p-4 text-center text-lg font-bold" style={{ color: p.stock < (p.lowStockThreshold || 5) ? 'red' : 'inherit' }}>
                                    {p.stock}
                                </td>
                                <td className="p-4">
                                    <input 
                                        type="number" 
                                        value={adjustments[p.id] || ''}
                                        onChange={e => setAdjustments({...adjustments, [p.id]: parseInt(e.target.value) || 0})}
                                        className="w-24 p-2 border rounded"
                                        placeholder="e.g. 5, -2"
                                    />
                                </td>
                                <td className="p-4">
                                    <button 
                                        onClick={() => handleAdjust(p.id)}
                                        className="btn-primary py-1 px-4 text-xs"
                                        disabled={!adjustments[p.id]}
                                    >
                                        Update
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
