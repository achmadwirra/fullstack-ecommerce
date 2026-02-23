'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { HiOutlineDownload } from 'react-icons/hi';

export default function ReportsPage() {
    const { user } = useAuth();

    if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN')) {
        return <div className="text-center py-16 text-xl">Access Denied. Admins only.</div>;
    }

    const downloadReport = (type: string) => {
        const token = localStorage.getItem('token');
        const tenant = localStorage.getItem('tenant') || 'default';
        const url = `http://localhost:5000/api/export/${type}`;
        
        // Simple way to download with auth headers
        fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'x-tenant-id': tenant
            }
        })
        .then(res => res.blob())
        .then(blob => {
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `${type}-report.csv`;
            a.click();
        })
        .catch(err => console.error("Download failed", err));
    };

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold mb-8">Export Reports (CSV)</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6 flex flex-col items-center justify-center text-center">
                    <h2 className="text-xl font-semibold mb-4">Products Report</h2>
                    <p className="text-sm text-gray-500 mb-6">Complete list of all products</p>
                    <button onClick={() => downloadReport('products')} className="btn-primary flex items-center gap-2">
                        <HiOutlineDownload className="w-5 h-5" /> Download CSV
                    </button>
                </div>
                
                <div className="glass-card p-6 flex flex-col items-center justify-center text-center">
                    <h2 className="text-xl font-semibold mb-4">Orders Report</h2>
                    <p className="text-sm text-gray-500 mb-6">All transactions and order data</p>
                    <button onClick={() => downloadReport('orders')} className="btn-primary flex items-center gap-2">
                        <HiOutlineDownload className="w-5 h-5" /> Download CSV
                    </button>
                </div>

                <div className="glass-card p-6 flex flex-col items-center justify-center text-center">
                    <h2 className="text-xl font-semibold mb-4">Inventory Report</h2>
                    <p className="text-sm text-gray-500 mb-6">Current stock levels and adjustments</p>
                    <button onClick={() => downloadReport('inventory')} className="btn-primary flex items-center gap-2">
                        <HiOutlineDownload className="w-5 h-5" /> Download CSV
                    </button>
                </div>
            </div>
        </div>
    );
}
