'use server';

import { revalidatePath } from 'next/cache';
import { isValidObjectId } from 'mongoose';
import { requireAdmin } from '@/lib/adminGuard';
import connectDB from '@/lib/db';
import Order, { ORDER_STATUSES, type OrderStatus, type PaymentStatus } from '@/models/Order';
import Form from '@/models/Form';
import { priceOrderLines, type PriceableFormItem, type SubmittedLine } from '@/lib/orders';
import { toPlain } from '@/lib/serialize';

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

/** Form-item snapshot the line editor needs to build/reprice order lines. */
export async function getOrderFormItems(orderId: string): Promise<PriceableFormItem[]> {
    await requireAdmin();
    if (!isValidObjectId(orderId)) throw new Error('Invalid input');
    await connectDB();
    const order = await Order.findById(orderId).select('formId').lean();
    if (!order) throw new Error('Order not found');
    const form = await Form.findById(order.formId).lean();
    if (!form) throw new Error('Form not found');
    return toPlain<PriceableFormItem[]>(
        form.items.map(item => ({
            _id: String(item._id),
            sku: item.sku,
            name: item.name,
            priceCents: item.priceCents,
            sizes: item.sizes.map(s => ({ label: s.label, priceAdjustmentCents: s.priceAdjustmentCents })),
            personalization: item.personalization,
        }))
    );
}

export type UpdateOrderLinesResult =
    | { ok: true; totalCents: number }
    | { ok: false; error: string };

/**
 * Replace an order's lines. Prices are recomputed server-side from the form
 * snapshot (same logic as public submission) — never trusted from the client.
 */
export async function updateOrderLines(
    orderId: string,
    lines: SubmittedLine[]
): Promise<UpdateOrderLinesResult> {
    await requireAdmin();
    if (!isValidObjectId(orderId)) return { ok: false, error: 'generic' };
    await connectDB();
    const order = await Order.findById(orderId);
    if (!order) return { ok: false, error: 'generic' };
    const form = await Form.findById(order.formId).lean();
    if (!form) return { ok: false, error: 'generic' };

    const priced = priceOrderLines(
        form.items.map(item => ({
            _id: String(item._id),
            sku: item.sku,
            name: item.name,
            priceCents: item.priceCents,
            sizes: item.sizes,
            personalization: item.personalization,
        })),
        Array.isArray(lines) ? lines : []
    );
    if (!priced.ok) return { ok: false, error: priced.error };

    order.set('lines', priced.lines);
    order.totalCents = priced.totalCents;
    await order.save();

    revalidatePath('/admin/orders');
    revalidatePath(`/admin/forms/${order.formId}/orders`);
    return { ok: true, totalCents: priced.totalCents };
}
