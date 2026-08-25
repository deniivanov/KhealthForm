import { Schema, model, models, type Model } from 'mongoose';
import type { ProductCategory } from '@/lib/productConstants';

export { PRODUCT_CATEGORIES, type ProductCategory } from '@/lib/productConstants';

export interface SizeVariant {
    label: string;
    /** dimension key -> value in cm; keys come from Product.dimensions */
    measurements: Record<string, number>;
    /** price delta in EUR cents, e.g. +200 for 3XL */
    priceAdjustmentCents?: number;
}

export interface ProductData {
    sku: string;
    name: string;
    description?: string;
    category: ProductCategory;
    images: string[];
    /** EUR cents */
    basePriceCents: number;
    /** ordered measurement columns used by this product, e.g. ['chestWidth','length'] */
    dimensions: string[];
    /** ordered size rows */
    sizes: SizeVariant[];
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export const SizeVariantSchema = new Schema<SizeVariant>(
    {
        label: { type: String, required: true, trim: true },
        measurements: { type: Map, of: Number, default: {} },
        priceAdjustmentCents: { type: Number },
    },
    { _id: false }
);

const ProductSchema = new Schema<ProductData>(
    {
        sku: { type: String, required: true, unique: true, trim: true, uppercase: true },
        name: { type: String, required: true, trim: true },
        description: { type: String, trim: true },
        category: { type: String, required: true, trim: true },
        images: { type: [String], default: [] },
        basePriceCents: { type: Number, required: true, min: 0 },
        dimensions: { type: [String], default: [] },
        sizes: { type: [SizeVariantSchema], default: [] },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

const Product: Model<ProductData> = models.Product || model<ProductData>('Product', ProductSchema);

export default Product;
