import { Schema, model, models, type Model, type Types } from 'mongoose';
import { SizeVariantSchema, type SizeVariant } from '@/models/Product';

export type FormStatus = 'draft' | 'open' | 'closed';
export type PersonalizationFieldType = 'text' | 'number';

export interface PersonalizationField {
    /** stable key stored on order lines, e.g. "playerName" */
    key: string;
    label: string;
    type: PersonalizationFieldType;
    required: boolean;
}

/**
 * A product included in a form. Copies the order-relevant fields from the
 * catalog product so later catalog edits never change an open/closed form.
 */
export interface FormItemData {
    _id?: Types.ObjectId;
    /** provenance only — never read at order time */
    productId: Types.ObjectId;
    sku: string;
    name: string;
    description?: string;
    images: string[];
    /** EUR cents; catalog base price or per-team override */
    priceCents: number;
    /** ordered measurement columns (snapshot of Product.dimensions) */
    dimensions: string[];
    /** snapshot, possibly a restricted subset of the catalog sizes */
    sizes: SizeVariant[];
    personalization: PersonalizationField[];
}

export interface RequiredMemberFields {
    email: boolean;
    phone: boolean;
}

export interface FormData {
    teamId: Types.ObjectId;
    title: string;
    /** unique URL part incl. random token, e.g. "autumn-2026-k7f3q9" */
    slug: string;
    status: FormStatus;
    opensAt?: Date;
    closesAt?: Date;
    /** shown at the top of the public form (deadline, pickup info, …) */
    message?: string;
    /** when true the public form shows no prices (per-item or totals) */
    hidePrices: boolean;
    /** fullName is always required */
    requiredMemberFields: RequiredMemberFields;
    items: FormItemData[];
    createdAt?: Date;
    updatedAt?: Date;
}

const PersonalizationFieldSchema = new Schema<PersonalizationField>(
    {
        key: { type: String, required: true, trim: true },
        label: { type: String, required: true, trim: true },
        type: { type: String, enum: ['text', 'number'], required: true, default: 'text' },
        required: { type: Boolean, required: true, default: false },
    },
    { _id: false }
);

const FormItemSchema = new Schema<FormItemData>(
    {
        productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        sku: { type: String, required: true, trim: true },
        name: { type: String, required: true, trim: true },
        description: { type: String, trim: true },
        images: { type: [String], default: [] },
        priceCents: { type: Number, required: true, min: 0 },
        dimensions: { type: [String], default: [] },
        sizes: { type: [SizeVariantSchema], default: [] },
        personalization: { type: [PersonalizationFieldSchema], default: [] },
    },
    { _id: true }
);

const FormSchema = new Schema<FormData>(
    {
        teamId: { type: Schema.Types.ObjectId, ref: 'Team', required: true, index: true },
        title: { type: String, required: true, trim: true },
        slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
        status: { type: String, enum: ['draft', 'open', 'closed'], required: true, default: 'draft' },
        opensAt: { type: Date },
        closesAt: { type: Date },
        message: { type: String, trim: true },
        hidePrices: { type: Boolean, required: true, default: false },
        requiredMemberFields: {
            type: new Schema<RequiredMemberFields>(
                {
                    email: { type: Boolean, required: true, default: false },
                    phone: { type: Boolean, required: true, default: true },
                },
                { _id: false }
            ),
            required: true,
            default: () => ({ email: false, phone: true }),
        },
        items: { type: [FormItemSchema], default: [] },
    },
    { timestamps: true }
);

const Form: Model<FormData> = models.Form || model<FormData>('Form', FormSchema);

export default Form;
