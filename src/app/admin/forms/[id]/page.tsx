import { notFound } from 'next/navigation';
import { isValidObjectId, Types } from 'mongoose';
import connectDB from '@/lib/db';
import Team from '@/models/Team';
import Product from '@/models/Product';
import Form from '@/models/Form';
import FormEditor, { type PickerProduct, type SerializedFormForEdit } from '@/components/admin/FormEditor';
import { toPlain } from '@/lib/serialize';

export const dynamic = 'force-dynamic';

export default async function EditFormPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    if (!isValidObjectId(id)) notFound();

    await connectDB();
    const form = await Form.findById(id).lean();
    if (!form) notFound();

    const referencedIds = form.items.map(i => i.productId as Types.ObjectId);
    const [teams, products] = await Promise.all([
        Team.find().sort({ name: 1 }).lean(),
        // active products + anything this form already references (even archived)
        Product.find({ $or: [{ isActive: true }, { _id: { $in: referencedIds } }] })
            .sort({ name: 1 })
            .lean(),
    ]);

    return (
        <FormEditor
            teams={toPlain<Array<{ _id: string; name: string }>>(teams)}
            products={toPlain<PickerProduct[]>(products)}
            initial={toPlain<SerializedFormForEdit>(form)}
        />
    );
}
