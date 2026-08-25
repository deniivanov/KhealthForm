import { notFound } from 'next/navigation';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import ProductEditor, { type SerializedProduct } from '@/components/admin/ProductEditor';
import { toPlain } from '@/lib/serialize';
import { isValidObjectId } from 'mongoose';

export const dynamic = 'force-dynamic';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    if (!isValidObjectId(id)) notFound();

    await connectDB();
    const product = await Product.findById(id).lean();
    if (!product) notFound();

    return <ProductEditor initial={toPlain<SerializedProduct>(product)} />;
}
