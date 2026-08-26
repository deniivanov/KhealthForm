'use server';

import { headers, cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db';
import OrderAccess from '@/models/OrderAccess';
import { isRateLimited } from '@/lib/rateLimit';
import {
    ORDER_ACCESS_COOKIE,
    ORDER_ACCESS_TTL_SECONDS,
    signOrderAccessToken,
} from '@/lib/orderAccessToken';

export type CodeLoginResult = { ok: true } | { ok: false; error: 'invalid' | 'rate_limited' };

export async function loginWithAccessCode(emailInput: string, codeInput: string): Promise<CodeLoginResult> {
    const hdrs = await headers();
    const ip = (hdrs.get('x-forwarded-for') || 'unknown').split(',')[0].trim();
    const email = String(emailInput ?? '').trim().toLowerCase();
    const code = String(codeInput ?? '').replace(/\D/g, '');

    if (isRateLimited('order-access', `${ip}:${email}`, 5, 15 * 60_000)) {
        return { ok: false, error: 'rate_limited' };
    }
    if (!email || code.length !== 6) return { ok: false, error: 'invalid' };

    await connectDB();
    const grants = await OrderAccess.find({ email, revoked: false }).limit(20);
    let matched = null;
    for (const grant of grants) {
        if (await bcrypt.compare(code, grant.codeHash)) {
            matched = grant;
            break;
        }
    }
    if (!matched) return { ok: false, error: 'invalid' };

    await OrderAccess.updateOne({ _id: matched._id }, { lastUsedAt: new Date() });

    const cookieStore = await cookies();
    cookieStore.set(ORDER_ACCESS_COOKIE, signOrderAccessToken(email), {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: ORDER_ACCESS_TTL_SECONDS,
        path: '/',
    });
    return { ok: true };
}

export async function logoutOrderAccess(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete(ORDER_ACCESS_COOKIE);
}
