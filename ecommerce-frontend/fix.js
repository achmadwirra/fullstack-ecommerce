const fs = require('fs');
fs.writeFileSync('src/app/admin/products/edit/[id]/page.tsx', `'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/services/api';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import {
    HiOutlinePencil,
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

export default function EditProductPage() {
    const params = useParams();
    const productId = params.id as string;

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState('');

    const [imgSrc, setImgSrc] = useState('');
    const imgRef = useRef<HTMLImageElement>(null);
    const [crop, setCrop] = useState<Crop>();
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
    const [croppedImage, setCroppedImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [existingImage, setExistingImage] = useState<string | null>(null);

    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();
    const { user, isLoading: authLoading } = useAuth();

    useEffect(() => {
        if (!productId) return;
        const fetchProduct = async () => {
            try {
                const res = await api.get(\`/api/products/\${productId}\`);
                if (res.data.success && res.data.data) {
                    const p = res.data.data;
                    setName(p.name);
                    setDescription(p.description);
                    setPrice(p.price.toString());
                    setStock(p.stock.toString());
                    if (p.imageUrl) {
                        setExistingImage(p.imageUrl.startsWith('http') ? p.imageUrl : \`\${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000'}\${p.imageUrl}\`);
                    }
                }
            } catch (error) {
                toast.error('Failed to fetch product details');
                router.push('/products');
            } finally {
                setFetching(false);
            }
        };
        fetchProduct();
    }, [productId, router]);

    if (authLoading || fetching) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-t-transparent" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
            </div>
        );
    }

    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
        return (
            <div className="text-center py-16 animate-fade-in">
                <HiOutlineLockClosed className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
                <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Access Denied</h2>
                <p className="mt-2" style={{ color: 'var(--text-muted)' }}>You must be an administrator.</p>
            </div>
        );
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setCrop(undefined);
            setCroppedImage(null);
            setPreviewUrl(null);
            setExistingImage(null);

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
            setCroppedImage(croppedFile);
            setPreviewUrl(URL.createObjectURL(blob));
            setImgSrc('');
        }, 'image/jpeg', 0.9);
    };

    const removeImage = () => {
        setImgSrc('');
        setCroppedImage(null);
        setPreviewUrl(null);
        setExistingImage(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            let newImageUrl;

            if (croppedImage) {
                setUploading(true);
                const formData = new FormData();
                formData.append('image', croppedImage);
                const uploadRes = await api.post('/api/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                if (uploadRes.data.success) {
                    newImageUrl = uploadRes.data.data.url;
                }
                setUploading(false);
            }

            const payload: any = {
                name, description,
                price: parseFloat(price),
                stock: parseInt(stock, 10),
            };
            
            if (newImageUrl !== undefined) {
                payload.imageUrl = newImageUrl;
            } else if (!existingImage && !previewUrl && !imgSrc) {
                payload.imageUrl = null;
            }

            const res = await api.put(\`/api/products/\${productId}\`, payload);
            if (res.data.success) {
                toast.success('Product updated successfully!');
                router.push('/products');
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update product');
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
                        <HiOutlinePencil className="w-7 h-7" style={{ color: 'var(--accent)' }} />
                    </div>
                    <h1 className="text-2xl font-extrabold" style={{ color: 'var(--text-primary)' }}>Edit Product</h1>
          
