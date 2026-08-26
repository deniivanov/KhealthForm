'use server';

import bcrypt from 'bcryptjs';
import { isValidObjectId } from 'mongoose';
import { requireAdmin } from '@/lib/adminGuard';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import OrderAccess from '@/models/OrderAccess';
import { generateAccessCode } from '@/lib/orderAccessToken';

export interface AccessGrant {
    _id: string;
    email: string;
    revoked: boolean;
    lastUsedAt?: string;
    createdAt: string;
}

export type GrantResult =
    | { ok: true; email: string; code: string }
    | { ok: false; message: string };

const EMAIL_RX = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export async function listOrderAccess(orderId: string): Promise<AccessGrant[]> {
    await requireAdmin();
    if (!isValidObjectId(orderId)) return [];
    await connectDB();
    const grants = await OrderAccess.find({ orderId }).sort({ createdAt: -1 }).lean();
    return grants.map(g => ({
        _id: String(g._id),
        email: g.email,
        revoked: g.revoked,
        lastUsedAt: g.lastUsedAt ? new Date(g.lastUsedAt).toISOString() : undefined,
        createdAt: new Date(g.createdAt as Date).toISOString(),
    }));
}

/**
 * Create (or regenerate) a 6-digit access code for email + order. The plain
 * code is returned exactly once — the admin sends it to the person by
 * Viber/phone; only its hash is stored.
 */
export async function grantOrderAccess(orderId: string, emailInput: string): Promise<GrantResult> {
    await requireAdmin();
    if (!isValidObjectId(orderId)) return { ok: false, message: 'Невалидна поръчка' };
    const email = String(emailInput ?? '').trim().toLowerCase();
    if (!EMAIL_RX.test(email)) return { ok: false, message: 'Невалиден имейл' };

    await connectDB();
    const order = await Order.findById(orderId).lean();
    if (!order) return { ok: false, message: 'Поръчката не е намерена' };

    const code = generateAccessCode();
    await OrderAccess.findOneAndUpdate(
        { orderId, email },
        { codeHash: bcrypt.hashSync(code, 10), revoked: false },
        { upsert: true }
    );
    return { ok: true, email, code };
}

export async function revokeOrderAccess(grantId: string): Promise<void> {
    await requireAdmin();
    if (!isValidObjectId(grantId)) return;
    await connectDB();
    await OrderAccess.findByIdAndUpdate(grantId, { revoked: true });
}

/** Remove a grant entirely (the email + code pair disappears from the list). */
export async function deleteOrderAccess(grantId: string): Promise<void> {
    await requireAdmin();
    if (!isValidObjectId(grantId)) return;
    await connectDB();
    await OrderAccess.deleteOne({ _id: grantId });
}
