'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { HiOutlineCloudUpload, HiOutlineCheck } from 'react-icons/hi';
import api from '@/services/api';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { HiOutlineShoppingCart, HiOutlinePlusCircle, HiOutlinePhotograph, HiOutlinePencil, HiOutlineTrash, HiOutlineX } from 'react-icons/hi';

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
    return centerCrop(
        makeAspectCrop({ unit: '%', width: 90 }, aspect, mediaWidth, mediaHeight),
        mediaWidth,
        mediaHeight
    );
}

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [newImageFile, setNewImageFile] = useState<File | null>(null);
    const [newImagePreview, setNewImagePreview] = useState<string | null>(null);
    const [imgSrc, setImgSrc] = useState('');
    const imgRef = React.useRef<HTMLImageElement>(null);
    const [crop, setCrop] = useState<Crop>();
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);
    const { addToCart } = useCart();
    const { user } = useAuth();
    const { data, isLoading, error } = useQuery({
        queryKey: ["products"],
        queryFn: async () => {
            const res = await api.get('/products');
            return res.data.data;
        }
    });


    const handleQuickEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setCrop(undefined);
            setCompletedCrop(undefined);
            
            const file = e.target.files[0];
            if (file.size > 5 * 1024 * 1024) return toast.error('File too large (max 5MB)');
            
            const reader = new FileReader();
            reader.addEventListener('load', () => setImgSrc(reader.result?.toString() || ''));
            reader.readAsDataURL(file);
        }
    };

    const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const { width, height } = e.currentTarget;
        setCrop(centerAspectCrop(width, height, 1));
    };

    const handleCropComplete = async () => {
        if (!completedCrop || !imgRef.current) return;

        const canvas = document.createElement('canvas');
        const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
        const scaleY = imgRef.current.naturalHeight / imgRef.current.height;

        canvas.width = completedCrop.width;
        canvas.height = completedCrop.height;
        const ctx = canvas.getContext('2d');

        if (!ctx) return;
        ctx.imageSmoothingQuality = 'high';

        ctx.drawImage(
            imgRef.current,
            completedCrop.x * scaleX, completedCrop.y * scaleY, completedCrop.width * scaleX, completedCrop.height * scaleY,
            0, 0, completedCrop.width, completedCrop.height
        );

        canvas.toBlob((blob) => {
            if (!blob) return;
            const croppedFile = new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' });
            setNewImageFile(croppedFile);
            setNewImagePreview(URL.createObjectURL(blob));
            setImgSrc(''); // Hide cropper
        }, 'image/jpeg', 0.9);
    };

    const cancelCrop = () => {
        setImgSrc('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleUpdateProduct = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!editingProduct) return;
        
        try {
            const formData = new FormData(e.currentTarget);
            const payload: any = {
                name: formData.get('name') as string,
                description: formData.get('description') as string,
                price: parseFloat(formData.get('price') as string),
                stock: parseInt(formData.get('stock') as string, 10),
            };

            // Upload new image if selected
            if (newImageFile) {
                const uploadData = new FormData();
                uploadData.append('image', newImageFile);
                const uploadRes = await api.post('/upload', uploadData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                if (uploadRes.data.success) {
                    payload.imageUrl = uploadRes.data.data.url;
                }
            }

            const res = await api.put(`/products/${editingProduct.id}`, payload);
            if (res.data.success) {
                toast.success('Product updated successfully!');
                setProducts(products.map(p => p.id === editingProduct.id ? { ...p, ...payload } : p));
                setEditingProduct(null); setNewImageFile(null); setNewImagePreview(null); setImgSrc("");
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update product');
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
            try {
                const res = await api.delete(`/products/${id}`);
                if (res.data.success) {
                    toast.success('Product deleted successfully');
                    setProducts(products.filter(p => p.id !== id));
                }
            } catch (error: any) {
                toast.error(error.response?.data?.message || 'Failed to delete product');
            }
        }
    };

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await api.get('/products');
                if (res.data.success && res.data.data) {
                    setProducts(res.data.data);
                }
            } catch (error) {
                toast.error('Failed to load products');
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-t-transparent" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold" style={{ color: 'var(--text-primary)' }}>
                        Our Products
                    </h1>
                    <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
                        Discover top quality items tailored for you.
                    </p>
                </div>
                {user?.role === 'ADMIN' && (
                    <Link href="/admin/products/create" className="btn-primary flex items-center gap-2 text-sm whitespace-nowrap">
                        <HiOutlinePlusCircle className="w-5 h-5" />
                        Add New Product
                    </Link>
                )}
            </div>

            {/* Product Grid */}
            {products.length === 0 ? (
                <div className="glass-card text-center py-16 px-4">
                    <HiOutlineShoppingCart className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
                    <p className="text-lg font-medium" style={{ color: 'var(--text-secondary)' }}>No products available.</p>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Check back soon for new items.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map((product, i) => (
                        <div
                            key={product.id}
                            className="glass-card overflow-hidden group"
                            style={{ animationDelay: `${i * 0.05}s` }}
                        >
                            <div
        className="relative w-full h-52 overflow-hidden flex items-center justify-center"
        style={{ background: 'var(--bg-card-hover)' }}
    >
        {user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' ? (
            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-[60] pointer-events-auto">
                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setEditingProduct(product); }} type="button" className="p-2 bg-white/90 dark:bg-gray-800/90 rounded-lg shadow hover:scale-110 transition-transform text-blue-600 dark:text-blue-400 cursor-pointer">
        <HiOutlinePencil className="w-5 h-5" />
    </button>
                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(product.id, product.name); }} type="button" className="p-2 bg-white/90 dark:bg-gray-800/90 rounded-lg shadow hover:scale-110 transition-transform text-red-600 dark:text-red-400 cursor-pointer">
                    <HiOutlineTrash className="w-5 h-5" />
                </button>
            </div>
        ) : null}
                                {product.imageUrl ? (
                                    <img
                                        src={product.imageUrl.startsWith('http') ? product.imageUrl : `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000'}${product.imageUrl}`}
                                        alt={product.name}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                ) : (
                                    <HiOutlinePhotograph className="w-12 h-12" style={{ color: 'var(--text-muted)' }} />
                                )}
                            </div>

                            {/* Info */}
                            <div className="p-5 flex flex-col justify-between" style={{ minHeight: '180px' }}>
                                <div>
                                    <h3 className="text-base font-semibold leading-snug" style={{ color: 'var(--text-primary)' }}>
                                        {product.name}
                                    </h3>
                                    <p className="mt-1 text-sm line-clamp-2" style={{ color: 'var(--text-muted)' }}>
                                        {product.description}
                                    </p>
                                    <p className="mt-3 text-xl font-bold" style={{ color: 'var(--accent)' }}>
                                        ${product.price.toFixed(2)}
                                    </p>
                                </div>
                                <div className="mt-4 flex items-center justify-between">
                                    <span className="text-xs font-medium px-2 py-1 rounded-full"
                                        style={{
                                            background: product.stock > 0 ? 'var(--success-bg)' : 'var(--danger-bg)',
                                            color: product.stock > 0 ? 'var(--success)' : 'var(--danger)'
                                        }}
                                    >
                                        {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                                    </span>
                                    {user?.role !== 'ADMIN' && (
                                        <button
                                            onClick={() => addToCart(product.id, 1)}
                                            disabled={product.stock <= 0}
                                            className="btn-primary flex items-center gap-1.5 text-xs !py-2 !px-3 !rounded-lg"
                                        >
                                            <HiOutlineShoppingCart className="w-4 h-4" />
                                            Add
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

                        {/* Quick Edit Modal */}
            {mounted && editingProduct && createPortal(
                <div className="fixed inset-0 !z-[999999] bg-black/80 backdrop-blur-md animate-fade-in flex justify-center p-4 sm:p-6" style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}>
                    <div className="w-full max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl relative flex flex-col my-auto max-h-full overflow-hidden animate-slide-down">
                        {/* Header Fixed */}
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-800">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Quick Edit Product</h2>
                            <button 
                                onClick={() => { setEditingProduct(null); setNewImageFile(null); setNewImagePreview(null); setImgSrc(""); setNewImageFile(null); setNewImagePreview(null); }} 
                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
                                type="button"
                            >
                                <HiOutlineX className="w-5 h-5" />
                            </button>
                        </div>
                        
                        {/* Body Scrollable */}
                        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                            <form id="editProductForm" onSubmit={handleUpdateProduct} className="space-y-5">

                                
                                {/* Image Cropper Tool (Only shows when imgSrc is loaded) */}
                                {!!imgSrc && (
                                    <div className="mb-5 flex justify-center">
                                        <div className="glass-card p-4 rounded-xl flex flex-col items-center gap-4 w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">Crop your image (1:1 Ratio)</p>
                                            <ReactCrop 
                                                crop={crop} 
                                                onChange={(_, percentCrop) => setCrop(percentCrop)} 
                                                onComplete={(c) => setCompletedCrop(c)} 
                                                aspect={1} 
                                                className="max-h-[300px] rounded-lg overflow-hidden bg-black/10"
                                            >
                                                <img ref={imgRef} alt="Crop preview" src={imgSrc} onLoad={onImageLoad} className="max-h-[300px] w-auto object-contain" />
                                            </ReactCrop>
                                            <div className="flex gap-3 w-full mt-2">
                                                <button type="button" onClick={cancelCrop} className="flex-1 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg font-medium text-gray-700 dark:text-gray-300">Cancel Crop</button>
                                                <button type="button" onClick={handleCropComplete} className="flex-1 py-2 text-sm flex items-center justify-center gap-1 bg-indigo-600 text-white rounded-lg font-medium"><HiOutlineCheck className="w-4 h-4" /> Save Crop</button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {/* Image Preview (Hidden during crop) */}
                                {!imgSrc && (
                                <div className="mb-5 flex justify-center">
                                    <div 
                                        className="relative w-32 h-32 rounded-xl overflow-hidden shadow-md border-2 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 flex items-center justify-center cursor-pointer group"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        {newImagePreview ? (
                                            <img src={newImagePreview} alt="New Preview" className="w-full h-full object-cover" />
                                        ) : editingProduct.imageUrl ? (
                                            <img 
                                                src={editingProduct.imageUrl.startsWith('http') ? editingProduct.imageUrl : `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000'}${editingProduct.imageUrl}`} 
                                                alt={editingProduct.name} 
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex flex-col items-center text-gray-400">
                                                <HiOutlinePhotograph className="w-8 h-8 mb-1 opacity-50" />
                                                <span className="text-[10px] font-medium uppercase tracking-wider">No Image</span>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                                            <HiOutlineCloudUpload className="w-6 h-6 mb-1" />
                                            <span className="text-[10px] font-bold uppercase tracking-wider">Change</span>
                                        </div>
                                        <input 
                                            type="file" 
                                            ref={fileInputRef}
                                            onChange={handleQuickEditFileChange}
                                            className="hidden" 
                                            accept="image/jpeg,image/png,image/webp"
                                        />
                                    </div>
                                </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Name</label>
                                    <input name="name" defaultValue={editingProduct.name} required className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-700 focus:border-indigo-500 outline-none" />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Description</label>
                                    <textarea name="description" defaultValue={editingProduct.description} required rows={4} className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-700 focus:border-indigo-500 outline-none" />
                                </div>
                                
                                <div className="grid grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Price ($)</label>
                                        <input type="number" name="price" step="0.01" defaultValue={editingProduct.price} required className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-700 focus:border-indigo-500 outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Stock</label>
                                        <input type="number" name="stock" defaultValue={editingProduct.stock} required className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-700 focus:border-indigo-500 outline-none" />
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Footer Fixed */}
                        <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex gap-3">
                            <button type="button" onClick={() => { setEditingProduct(null); setNewImageFile(null); setNewImagePreview(null); setImgSrc(""); setNewImageFile(null); setNewImagePreview(null); }} className="flex-1 py-3 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 font-medium transition-colors bg-white dark:bg-gray-900">Cancel</button>
                            <button type="submit" form="editProductForm" className="flex-1 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors shadow-lg shadow-indigo-500/30">Save Changes</button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}