'use server';

import { headers } from 'next/headers';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { isRateLimited } from '@/lib/rateLimit';

export type RegisterResult = { ok: true } | { ok: false; errors: Record<string, string> };

const EMAIL_RX = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export async function registerUser(input: {
    name: string;
    email: string;
    password: string;
}): Promise<RegisterResult> {
    const hdrs = await headers();
    const ip = (hdrs.get('x-forwarded-for') || 'unknown').split(',')[0].trim();
    if (isRateLimited('register', ip, 5, 60 * 60_000)) {
        return { ok: false, errors: { _: 'Твърде много опити. Опитайте отново по-късно.' } };
    }

    const errors: Record<string, string> = {};
    const name = String(input?.name ?? '').trim().slice(0, 120);
    const email = String(input?.email ?? '').trim().toLowerCase();
    const password = String(input?.password ?? '');

    if (!name) errors.name = 'Моля, въведете име';
    if (!EMAIL_RX.test(email)) errors.email = 'Невалиден имейл';
    if (password.length < 8) errors.password = 'Паролата трябва да е поне 8 знака';
    if (Object.keys(errors).length > 0) return { ok: false, errors };

    await connectDB();
    try {
        // New registrations get the base 'user' role — an admin grants
        // production (or admin) access from Потребители.
        await User.create({
            name,
            email,
            passwordHash: bcrypt.hashSync(password, 12),
            role: 'user',
        });
    } catch (err) {
        if ((err as { code?: number })?.code === 11000) {
            return { ok: false, errors: { email: 'Вече има профил с този имейл' } };
        }
        throw err;
    }
    return { ok: true };
}
