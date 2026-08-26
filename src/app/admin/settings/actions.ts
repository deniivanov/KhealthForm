'use server';

import bcrypt from 'bcryptjs';
import { auth } from '@/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';

export type SettingsResult = { ok: true } | { ok: false; errors: Record<string, string> };

/** Change the logged-in user's own password (current password required). */
export async function changeOwnPassword(input: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}): Promise<SettingsResult> {
    const session = await auth();
    if (!session?.user?.email) return { ok: false, errors: { _: 'Не сте влезли в системата' } };

    const errors: Record<string, string> = {};
    const current = String(input?.currentPassword ?? '');
    const next = String(input?.newPassword ?? '');
    const confirm = String(input?.confirmPassword ?? '');

    if (!current) errors.currentPassword = 'Въведете текущата парола';
    if (next.length < 8) errors.newPassword = 'Новата парола трябва да е поне 8 знака';
    if (next !== confirm) errors.confirmPassword = 'Паролите не съвпадат';
    if (next && current && next === current) errors.newPassword = 'Новата парола е същата като текущата';
    if (Object.keys(errors).length > 0) return { ok: false, errors };

    await connectDB();
    const user = await User.findOne({ email: session.user.email });
    if (!user) return { ok: false, errors: { _: 'Профилът не е намерен' } };

    const matches = await bcrypt.compare(current, user.passwordHash);
    if (!matches) return { ok: false, errors: { currentPassword: 'Грешна текуща парола' } };

    user.passwordHash = bcrypt.hashSync(next, 12);
    await user.save();
    return { ok: true };
}

/** Update the logged-in user's display name. */
export async function changeOwnName(nameInput: string): Promise<SettingsResult> {
    const session = await auth();
    if (!session?.user?.email) return { ok: false, errors: { _: 'Не сте влезли в системата' } };

    if (typeof nameInput !== 'string') return { ok: false, errors: { name: 'Невалидни данни' } };
    const name = nameInput.trim().slice(0, 120);
    if (!name) return { ok: false, errors: { name: 'Въведете име' } };

    await connectDB();
    await User.updateOne({ email: session.user.email }, { name });
    return { ok: true };
}
