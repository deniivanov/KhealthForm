'use server';

import { revalidatePath } from 'next/cache';
import { isValidObjectId } from 'mongoose';
import { requireAdmin } from '@/lib/adminGuard';
import connectDB from '@/lib/db';
import Order, { ORDER_STATUSES, type OrderStatus, type PaymentStatus } from '@/models/Order';

export async function setOrderStatus(id: string, status: OrderStatus): Promise<void> {
    await requireAdmin();
    if (!isValidObjectId(id) || !ORDER_STATUSES.includes(status)) throw new Error('Invalid input');
    await connectDB();
    await Order.findByIdAndUpdate(id, { status });
    revalidatePath('/admin/orders');
}

export async function setOrderPaymentStatus(id: string, paymentStatus: PaymentStatus): Promise<void> {
    await requireAdmin();
    if (!isValidObjectId(id) || !['unpaid', 'paid'].includes(paymentStatus)) throw new Error('Invalid input');
    await connectDB();
    await Order.findByIdAndUpdate(id, { paymentStatus });
    revalidatePath('/admin/orders');
}

export async function setOrderAdminNotes(id: string, adminNotes: string): Promise<void> {
    await requireAdmin();
    if (!isValidObjectId(id)) throw new Error('Invalid input');
    await connectDB();
    await Order.findByIdAndUpdate(id, { adminNotes: String(adminNotes).slice(0, 2000) });
    revalidatePath('/admin/orders');
}
