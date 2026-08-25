import connectDB from '@/lib/db';
import Team from '@/models/Team';
import Product from '@/models/Product';
import FormEditor, { type PickerProduct } from '@/components/admin/FormEditor';
import { toPlain } from '@/lib/serialize';

export const dynamic = 'force-dynamic';

export default async function NewFormPage() {
    await connectDB();
    const [teams, products] = await Promise.all([
        Team.find().sort({ name: 1 }).lean(),
        Product.find({ isActive: true }).sort({ name: 1 }).lean(),
    ]);

    return (
        <FormEditor
            teams={toPlain<Array<{ _id: string; name: string }>>(teams)}
            products={toPlain<PickerProduct[]>(products)}
        />
    );
}
