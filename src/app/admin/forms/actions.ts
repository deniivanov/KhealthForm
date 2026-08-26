'use server';

import { revalidatePath } from 'next/cache';
import { Types } from 'mongoose';
import { requireAdmin } from '@/lib/adminGuard';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import Team from '@/models/Team';
import Form, { type FormItemData, type FormStatus } from '@/models/Form';
import { validateForm, type FormInput, type ValidatedFormInput } from '@/lib/validate/form';
import { formSlug, randomToken } from '@/lib/ids';
import type { ActionResult } from '@/app/admin/products/actions';

/**
 * Build snapshot items from the catalog: copies name/price/sizes so later
 * catalog edits never change this form.
 */
async function buildSnapshotItems(data: ValidatedFormInput): Promise<FormItemData[] | string> {
    const products = await Product.find({
        _id: { $in: data.items.map(i => new Types.ObjectId(i.productId)) },
    }).lean();
    const byId = new Map(products.map(p => [String(p._id), p]));

    const items: FormItemData[] = [];
    for (const item of data.items) {
        const product = byId.get(item.productId);
        if (!product) return `Продуктът не е намерен (${item.productId})`;

        const offered = item.sizeLabels.length
            ? product.sizes.filter(s => item.sizeLabels.includes(s.label))
            : product.sizes;
        if (offered.length === 0) return `„${product.name}“: няма нито един предлаган размер`;

        items.push({
            productId: product._id as Types.ObjectId,
            sku: product.sku,
            name: product.name,
            description: product.description,
            images: item.images.length ? item.images : product.images,
            priceCents: item.priceOverrideCents ?? product.basePriceCents,
            dimensions: product.dimensions,
            sizes: offered,
            personalization: item.personalization,
        });
    }
    return items;
}

export async function createForm(input: FormInput): Promise<ActionResult> {
    await requireAdmin();
    const result = validateForm(input);
    if (!result.ok) return result;

    await connectDB();
    const team = await Team.findById(result.data.teamId).lean();
    if (!team) return { ok: false, errors: { teamId: 'Отборът не е намерен' } };

    const items = await buildSnapshotItems(result.data);
    if (typeof items === 'string') return { ok: false, errors: { items } };

    const form = await Form.create({
        teamId: result.data.teamId,
        title: result.data.title,
        slug: formSlug(result.data.title),
        status: 'draft',
        opensAt: result.data.opensAt,
        closesAt: result.data.closesAt,
        message: result.data.message,
        hidePrices: result.data.hidePrices,
        requiredMemberFields: result.data.requiredMemberFields,
        items,
    });
    revalidatePath('/admin/forms');
    return { ok: true, id: String(form._id) };
}

export async function updateForm(id: string, input: FormInput): Promise<ActionResult> {
    await requireAdmin();
    const result = validateForm(input);
    if (!result.ok) return result;

    await connectDB();
    const form = await Form.findById(id);
    if (!form) return { ok: false, errors: { _: 'Формата не е намерена' } };

    const items = await buildSnapshotItems(result.data);
    if (typeof items === 'string') return { ok: false, errors: { items } };

    form.set({
        teamId: result.data.teamId,
        title: result.data.title,
        opensAt: result.data.opensAt ?? null,
        closesAt: result.data.closesAt ?? null,
        message: result.data.message ?? '',
        hidePrices: result.data.hidePrices,
        requiredMemberFields: result.data.requiredMemberFields,
        items,
    });
    await form.save();
    revalidatePath('/admin/forms');
    return { ok: true, id };
}

export async function setFormStatus(id: string, status: FormStatus): Promise<void> {
    await requireAdmin();
    if (!['draft', 'open', 'closed'].includes(status)) throw new Error('Invalid status');
    await connectDB();
    await Form.findByIdAndUpdate(id, { status });
    revalidatePath('/admin/forms');
    revalidatePath(`/admin/forms/${id}`);
}

export async function duplicateForm(id: string): Promise<ActionResult> {
    await requireAdmin();
    await connectDB();
    const source = await Form.findById(id).lean();
    if (!source) return { ok: false, errors: { _: 'Формата не е намерена' } };

    const copy = await Form.create({
        teamId: source.teamId,
        title: `${source.title} (копие)`,
        slug: `${source.slug.replace(/-[a-z0-9]{6}$/, '')}-${randomToken()}`,
        status: 'draft',
        opensAt: undefined,
        closesAt: undefined,
        message: source.message,
        hidePrices: source.hidePrices,
        requiredMemberFields: source.requiredMemberFields,
        items: source.items.map(({ _id, ...item }) => item),
    });
    revalidatePath('/admin/forms');
    return { ok: true, id: String(copy._id) };
}
