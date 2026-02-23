'use client';

import React, { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import {
    HiOutlinePlusCircle,
    HiOutlineCube,
    HiOutlineCurrencyDollar,
    HiOutlineTag,
    HiOutlineDocumentText,
    HiOutlineLockClosed,
    HiOutlineCloudUpload,
    HiOutlineX,
    HiOutlineCheck,
} from 'react-icons/hi';

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
    return centerCrop(
        makeAspectCrop({ unit: '%', width: 90 }, aspect, mediaWidth, mediaHeight),
        mediaWidth,
        mediaHeight
    );
}

export default function CreateProductPage() {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState('');

    // Image & Cropping states
    const [imgSrc, setImgSrc] = useState('');
    const imgRef = useRef<HTMLImageElement>(null);
    const [crop, setCrop] = useState<Crop>();
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
    const [croppedImage, setCroppedImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();
    const { user, isLoading: authLoading } = useAuth();

    if (authLoading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-t-transparent" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
            </div>
        );
    }

    if (!user || user.role !== 'ADMIN') {
        return (
            <div className="text-center py-16 animate-fade-in">
                <HiOutlineLockClosed className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
                <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Access Denied</h2>
                <p className="mt-2" style={{ color: 'var(--text-muted)' }}>You must be an administrator.</p>
            </div>
        );
    }

    // --- File Selection ---
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setCrop(undefined); // Reset crop
            setCroppedImage(null);
            setPreviewUrl(null);

            const file = e.target.files[0];
            if (file.size > 5 * 1024 * 1024) {
                toast.error('File size must be less than 5MB');
                return;
            }

            const reader = new FileReader();
            reader.addEventListener('load', () => setImgSrc(reader.result?.toString() || ''));
            reader.readAsDataURL(file);
        }
    };

    // --- Image Loaded for Cropping ---
    const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const { width, height } = e.currentTarget;
        setCrop(centerAspectCrop(width, height, 1));
    };

    // --- Generate Cropped Image ---
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

        const cropX = completedCrop.x * scaleX;
        const cropY = completedCrop.y * scaleY;
        const cropWidth = completedCrop.width * scaleX;
        const cropHeight = completedCrop.height * scaleY;

        ctx.drawImage(
            imgRef.current,
            cropX, cropY, cropWidth, cropHeight,
            0, 0, completedCrop.width, completedCrop.height
        );

        // Convert canvas to Blob
        canvas.toBlob((blob) => {
            if (!blob) return;
            const croppedFile = new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' });
            setCroppedImage(croppedFile);
            setPreviewUrl(URL.createObjectURL(blob));
            setImgSrc(''); // Hide cropping tool
        }, 'image/jpeg', 0.9);
    };

    const removeImage = () => {
        setImgSrc('');
        setCroppedImage(null);
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            let imageUrl = '';

            // Upload cropped image
            if (croppedImage) {
                setUploading(true);
                const formData = new FormData();
                formData.append('image', croppedImage);
                const uploadRes = await api.post('/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                if (uploadRes.data.success) {
                    imageUrl = uploadRes.data.data.url;
                }
                setUploading(false);
            }

            const res = await api.post('/products', {
                name, description,
                price: parseFloat(price),
                stock: parseInt(stock, 10),
                imageUrl
            });
            if (res.data.success) {
                toast.success('Product created successfully!');
                router.push('/products');
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to create product');
        } finally {
            setLoading(false);
            setUploading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-4 animate-fade-in">
            <div className="glass-card p-8 sm:p-10">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
                        style={{ background: 'var(--accent-light)' }}>
                        <HiOutlinePlusCircle className="w-7 h-7" style={{ color: 'var(--accent)' }} />
                    </div>
                    <h1 className="text-2xl font-extrabold" style={{ color: 'var(--text-primary)' }}>Create Product</h1>
                    <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>Add a new item to your store</p>
                </div>

                <form onSubmit={handleCreate} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Product Name</label>
                        <div className="relative">
                            <HiOutlineTag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                            <input type="text" required className="input-field" value={name} onChange={(e) => setName(e.target.value)} placeholder="Premium Wireless Headphones" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Description</label>
                        <div className="relative">
                            <HiOutlineDocumentText className="absolute left-3 top-3 w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                            <textarea
                                required
                                rows={4}
                                className="input-field resize-none"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Detailed product description..."
                                style={{ paddingLeft: '2.75rem' }}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Price ($)</label>
                            <div className="relative">
                                <HiOutlineCurrencyDollar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                                <input type="number" step="0.01" min="0" required className="input-field" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Stock</label>
                            <div className="relative">
                                <HiOutlineCube className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                                <input type="number" min="0" required className="input-field" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="10" />
                            </div>
                        </div>
                    </div>

                    {/* Image Upload & Crop */}
                    <div>
                        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Product Image (1:1 Ratio)</label>

                        {/* Step 1: Cropping Tool */}
                        {!!imgSrc && (
                            <div className="glass-card p-4 rounded-xl flex flex-col items-center gap-4 animate-fade-in" style={{ background: 'var(--bg-card-hover)' }}>
                                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Adjust your image</p>
                                <ReactCrop
                                    crop={crop}
                                    onChange={(_, percentCrop) => setCrop(percentCrop)}
                                    onComplete={(c) => setCompletedCrop(c)}
                                    aspect={1}
                                    className="max-h-80 rounded-lg overflow-hidden"
                                >
                                    <img
                                        ref={imgRef}
                                        alt="Crop me"
                                        src={imgSrc}
                                        onLoad={onImageLoad}
                                        className="max-h-80 w-auto object-contain"
                                    />
                                </ReactCrop>
                                <div className="flex gap-3 w-full max-w-xs">
                                    <button type="button" onClick={removeImage} className="btn-secondary flex-1 py-2 text-sm">Cancel</button>
                                    <button type="button" onClick={handleCropComplete} className="btn-primary flex-1 py-2 text-sm flex items-center justify-center gap-1">
                                        <HiOutlineCheck className="w-4 h-4" /> Save Crop
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Final Preview */}
                        {!imgSrc && previewUrl && (
                            <div className="relative w-48 h-48 mx-auto rounded-2xl overflow-hidden shadow-lg border-2" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-card-hover)' }}>
                                <img src={previewUrl} alt="Final Cropped" className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={removeImage}
                                    className="absolute top-2 right-2 p-1.5 rounded-lg text-white transition-all hover:scale-110"
                                    style={{ background: 'rgba(239, 68, 68, 0.9)' }}
                                    title="Remove Image"
                                >
                                    <HiOutlineX className="w-4 h-4" />
                                </button>
                            </div>
                        )}

                        {/* Step 0: Upload Button */}
                        {!imgSrc && !previewUrl && (
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full flex flex-col items-center justify-center gap-2 py-10 rounded-xl border-2 border-dashed transition-all cursor-pointer hover:bg-[var(--bg-card-hover)]"
                                style={{
                                    borderColor: 'var(--border-color)',
                                    color: 'var(--text-muted)',
                                    background: 'var(--bg-input)',
                                }}
                            >
                                <HiOutlineCloudUpload className="w-10 h-10" style={{ color: 'var(--accent)' }} />
                                <span className="text-sm font-medium">Click to upload image</span>
                                <span className="text-xs">PNG, JPG, WebP up to 5MB</span>
                            </button>
                        )}

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                    </div>

                    <button type="submit" disabled={loading || uploading || !!imgSrc} className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-6">
                        {loading ? (
                            <div className="flex items-center gap-2">
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                                {uploading ? 'Uploading image...' : 'Creating product...'}
                            </div>
                        ) : (
                            <>
                                <HiOutlinePlusCircle className="w-5 h-5" />
                                Create Product
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
