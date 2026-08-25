'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/adminGuard';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import { validateProduct, type ProductInput } from '@/lib/validate/product';

export type ActionResult =
    | { ok: true; id: string }
    | { ok: false; errors: Record<string, string> };

function isDuplicateKeyError(err: unknown): boolean {
    return (err as { code?: number })?.code === 11000;
}

export async function createProduct(input: ProductInput): Promise<ActionResult> {
    await requireAdmin();
    const result = validateProduct(input);
    if (!result.ok) return result;

    await connectDB();
    try {
        const product = await Product.create(result.data);
        revalidatePath('/admin/products');
        return { ok: true, id: String(product._id) };
    } catch (err) {
        if (isDuplicateKeyError(err)) {
            return { ok: false, errors: { sku: 'Продукт с този SKU вече съществува' } };
        }
        throw err;
    }
}

export async function updateProduct(id: string, input: ProductInput): Promise<ActionResult> {
    await requireAdmin();
    const result = validateProduct(input);
    if (!result.ok) return result;

    await connectDB();
    try {
        const updated = await Product.findByIdAndUpdate(id, result.data, { new: true });
        if (!updated) return { ok: false, errors: { _: 'Продуктът не е намерен' } };
        revalidatePath('/admin/products');
        return { ok: true, id };
    } catch (err) {
        if (isDuplicateKeyError(err)) {
            return { ok: false, errors: { sku: 'Продукт с този SKU вече съществува' } };
        }
        throw err;
    }
}

export async function setProductActive(id: string, isActive: boolean): Promise<void> {
    await requireAdmin();
    await connectDB();
    await Product.findByIdAndUpdate(id, { isActive });
    revalidatePath('/admin/products');
}
