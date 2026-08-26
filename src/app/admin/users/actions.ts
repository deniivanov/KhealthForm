'use server';

import { revalidatePath } from 'next/cache';
import { isValidObjectId } from 'mongoose';
import { requireAdmin } from '@/lib/adminGuard';
import connectDB from '@/lib/db';
import User, { type UserRole } from '@/models/User';

const ROLES: UserRole[] = ['admin', 'production', 'user'];

export type UserActionResult = { ok: true } | { ok: false; message: string };

export async function setUserRole(id: string, role: UserRole): Promise<UserActionResult> {
    const session = await requireAdmin();
    if (!isValidObjectId(id) || !ROLES.includes(role)) {
        return { ok: false, message: 'Невалидни данни' };
    }

    await connectDB();
    const target = await User.findById(id);
    if (!target) return { ok: false, message: 'Потребителят не е намерен' };

    if (target.email === session.user?.email && role !== 'admin') {
        return { ok: false, message: 'Не може да махнете собствения си администраторски достъп' };
    }
    if (target.role === 'admin' && role !== 'admin') {
        const adminCount = await User.countDocuments({ role: 'admin' });
        if (adminCount <= 1) return { ok: false, message: 'Не може да остане системата без администратор' };
    }

    target.role = role;
    await target.save();
    revalidatePath('/admin/users');
    return { ok: true };
}

export async function deleteUser(id: string): Promise<UserActionResult> {
    const session = await requireAdmin();
    if (!isValidObjectId(id)) return { ok: false, message: 'Невалидни данни' };

    await connectDB();
    const target = await User.findById(id);
    if (!target) return { ok: false, message: 'Потребителят не е намерен' };
    if (target.email === session.user?.email) {
        return { ok: false, message: 'Не може да изтриете собствения си профил' };
    }
    if (target.role === 'admin') {
        const adminCount = await User.countDocuments({ role: 'admin' });
        if (adminCount <= 1) return { ok: false, message: 'Не може да остане системата без администратор' };
    }

    await User.deleteOne({ _id: target._id });
    revalidatePath('/admin/users');
    return { ok: true };
}
