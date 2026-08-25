// Types for the legacy ordering flow (Shirt collection). Scheduled for
// removal at cutover to the Teams/Forms model.

export interface LegacyOrderProduct {
    id: number;
    name: string;
    color: string;
    price: number;
    size: string;
    quantity: number;
    subtotal: number;
}

export interface LegacyOrder {
    orderId: string;
    customerName: string;
    additionalInfo: string;
    products: LegacyOrderProduct[];
    total: number;
    orderDate: string;
}

export interface CartItem {
    productId: number;
    name: string;
    color: string;
    price: number;
    size: string;
    quantity: number;
}

export interface TempSelection {
    size: string;
    quantity: number;
}

export interface OrderSuccessInfo {
    orderId: string | number;
    customerName: string;
    productCount: number;
    estimatedDelivery: string;
}
