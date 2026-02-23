export interface User {
    id: string;
    email: string;
    name?: string;
    role: 'ADMIN' | 'CUSTOMER';
}

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    imageUrl?: string;
    stock: number;
}

export interface CartItem {
    id: string;
    productId: string;
    product: Product;
    quantity: number;
}

export interface Payment {
    id: string;
    orderId: string;
    provider: string;
    status: 'PENDING' | 'SUCCESS' | 'FAILED';
    paymentUrl?: string;
    stripeCheckoutSessionId?: string;
    createdAt: string;
}

export interface Order {
    id: string;
    totalAmount: number;
    status: 'PENDING' | 'PAID' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED';
    createdAt: string;
    payment?: Payment | null;
    user?: {
        name?: string;
        email: string;
    };
}

export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    error?: {
        code: string;
    };
}
