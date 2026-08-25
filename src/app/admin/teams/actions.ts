'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/adminGuard';
import connectDB from '@/lib/db';
import Team from '@/models/Team';
import { validateTeam, type TeamInput } from '@/lib/validate/team';
import type { ActionResult } from '@/app/admin/products/actions';

function isDuplicateKeyError(err: unknown): boolean {
    return (err as { code?: number })?.code === 11000;
}

export async function createTeam(input: TeamInput): Promise<ActionResult> {
    await requireAdmin();
    const result = validateTeam(input);
    if (!result.ok) return result;

    await connectDB();
    try {
        const team = await Team.create(result.data);
        revalidatePath('/admin/teams');
        return { ok: true, id: String(team._id) };
    } catch (err) {
        if (isDuplicateKeyError(err)) {
            return { ok: false, errors: { slug: 'Отбор с този slug вече съществува' } };
        }
        throw err;
    }
}

export async function updateTeam(id: string, input: TeamInput): Promise<ActionResult> {
    await requireAdmin();
    const result = validateTeam(input);
    if (!result.ok) return result;

    await connectDB();
    try {
        // $set + $unset so cleared optional fields actually go away
        const { brandColors, ...rest } = result.data;
        const update: Record<string, unknown> = { $set: { ...rest, brandColors } };
        const updated = await Team.findByIdAndUpdate(id, update, { new: true });
        if (!updated) return { ok: false, errors: { _: 'Отборът не е намерен' } };
        revalidatePath('/admin/teams');
        return { ok: true, id };
    } catch (err) {
        if (isDuplicateKeyError(err)) {
            return { ok: false, errors: { slug: 'Отбор с този slug вече съществува' } };
        }
        throw err;
    }
}
