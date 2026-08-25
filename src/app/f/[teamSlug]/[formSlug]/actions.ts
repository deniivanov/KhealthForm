'use server';

import { headers } from 'next/headers';
import { isValidObjectId } from 'mongoose';
import connectDB from '@/lib/db';
import Form from '@/models/Form';
import Order from '@/models/Order';
import { isFormAcceptingOrders, priceOrderLines, type SubmittedLine } from '@/lib/orders';
import { orderReference } from '@/lib/ids';
import { isRateLimited } from '@/lib/rateLimit';
import { getMailer } from '@/lib/email';

export interface PublicOrderInput {
    member: { fullName?: string; email?: string; phone?: string };
    lines: SubmittedLine[];
    notes?: string;
}

export type PublicOrderResult =
    | { ok: true; reference: string; totalCents: number }
    | { ok: false; error: 'rate_limited' | 'closed' | 'member' | 'lines' | 'generic' };

const EMAIL_RX = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function clean(value: unknown, max: number): string {
    return String(value ?? '')
        .replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, '')
        .trim()
        .slice(0, max);
}

export async function submitPublicOrder(
    formId: string,
    input: PublicOrderInput
): Promise<PublicOrderResult> {
    const hdrs = await headers();
    const ip = (hdrs.get('x-forwarded-for') || 'unknown').split(',')[0].trim();
    if (isRateLimited('public-order', ip, 5, 60_000)) {
        return { ok: false, error: 'rate_limited' };
    }

    if (!isValidObjectId(formId)) return { ok: false, error: 'generic' };

    await connectDB();
    const form = await Form.findById(formId).lean();
    if (!form) return { ok: false, error: 'generic' };
    if (!isFormAcceptingOrders(form)) return { ok: false, error: 'closed' };

    // member details per form config; fullName always required
    const fullName = clean(input?.member?.fullName, 120);
    const email = clean(input?.member?.email, 160).toLowerCase();
    const phone = clean(input?.member?.phone, 40);
    if (!fullName) return { ok: false, error: 'member' };
    if (form.requiredMemberFields.phone && !phone) return { ok: false, error: 'member' };
    if (form.requiredMemberFields.email && !email) return { ok: false, error: 'member' };
    if (email && !EMAIL_RX.test(email)) return { ok: false, error: 'member' };

    const priced = priceOrderLines(
        form.items.map(item => ({
            _id: String(item._id),
            sku: item.sku,
            name: item.name,
            priceCents: item.priceCents,
            sizes: item.sizes,
            personalization: item.personalization,
        })),
        Array.isArray(input?.lines) ? input.lines : []
    );
    if (!priced.ok) return { ok: false, error: 'lines' };

    const notes = clean(input?.notes, 1000) || undefined;

    try {
        let order = null;
        for (let attempt = 0; attempt < 5 && !order; attempt++) {
            try {
                order = await Order.create({
                    formId: form._id,
                    teamId: form.teamId,
                    reference: orderReference(),
                    member: { fullName, email: email || undefined, phone: phone || undefined },
                    lines: priced.lines,
                    totalCents: priced.totalCents,
                    status: 'submitted',
                    paymentStatus: 'unpaid',
                    notes,
                });
            } catch (err) {
                if ((err as { code?: number })?.code !== 11000) throw err; // duplicate reference → retry
            }
        }
        if (!order) throw new Error('could not allocate order reference');

        if (email) {
            // fire-and-forget stub; a real mailer can be plugged in via getMailer()
            getMailer()
                .sendOrderConfirmation({
                    to: email,
                    reference: order.reference,
                    memberName: fullName,
                    teamName: '',
                    formTitle: form.title,
                    totalCents: priced.totalCents,
                    lines: priced.lines,
                })
                .catch(() => {});
        }

        return { ok: true, reference: order.reference, totalCents: priced.totalCents };
    } catch (err) {
        console.error('public order failed:', err);
        return { ok: false, error: 'generic' };
    }
}
