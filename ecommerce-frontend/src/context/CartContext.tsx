'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { CartItem } from '@/types';
import api from '@/services/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

interface CartContextType {
    cart: CartItem[];
    fetchCart: () => Promise<void>;
    addToCart: (productId: string, quantity: number) => Promise<void>;
    isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { token, user } = useAuth();

    const fetchCart = useCallback(async () => {
        if (!token) return;
        try {
            setIsLoading(true);
            const res = await api.get('/cart');
            if (res.data.success && res.data.data) {
                setCart(res.data.data.items || []);
            }
        } catch (error) {
            console.error('Failed to fetch cart', error);
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    const addToCart = async (productId: string, quantity: number) => {
        if (!token) {
            toast.error('Please log in first');
            return;
        }
        try {
            setIsLoading(true);
            const res = await api.post('/cart/add', { productId, quantity });
            if (res.data.success) {
                toast.success('Added to cart');
                fetchCart();
            } else {
                toast.error(res.data.message || 'Failed to add to cart');
            }
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Error adding to cart';
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchCart();
        } else {
            setCart([]);
        }
    }, [token, fetchCart]);

    return (
        <CartContext.Provider value={{ cart, fetchCart, addToCart, isLoading }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
