import { Schema, model, models, type Model, type Types } from 'mongoose';

export type OrderStatus = 'submitted' | 'confirmed' | 'in_production' | 'delivered' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'paid';

export const ORDER_STATUSES: OrderStatus[] = [
    'submitted',
    'confirmed',
    'in_production',
    'delivered',
    'cancelled',
];

export interface OrderMember {
    fullName: string;
    email?: string;
    phone?: string;
}

export interface OrderLineData {
    /** _id of the FormItem this line was ordered from */
    formItemId: Types.ObjectId;
    productSku: string;
    productName: string;
    sizeLabel: string;
    quantity: number;
    /** EUR cents, incl. size price adjustment; computed server-side */
    unitPriceCents: number;
    /** personalization key -> value, keys from FormItem.personalization */
    personalization: Record<string, string>;
}

export interface OrderData {
    formId: Types.ObjectId;
    /** denormalized from the form for easy querying */
    teamId: Types.ObjectId;
    /** human-facing reference, e.g. "ORD-20260825-4831" */
    reference: string;
    member: OrderMember;
    lines: OrderLineData[];
    /** EUR cents; computed server-side, never trusted from the client */
    totalCents: number;
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    /** free-text note from the member */
    notes?: string;
    adminNotes?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const OrderLineSchema = new Schema<OrderLineData>(
    {
        formItemId: { type: Schema.Types.ObjectId, required: true },
        productSku: { type: String, required: true, trim: true },
        productName: { type: String, required: true, trim: true },
        sizeLabel: { type: String, required: true, trim: true },
        quantity: { type: Number, required: true, min: 1 },
        unitPriceCents: { type: Number, required: true, min: 0 },
        personalization: { type: Map, of: String, default: {} },
    },
    { _id: false }
);

const OrderSchema = new Schema<OrderData>(
    {
        formId: { type: Schema.Types.ObjectId, ref: 'Form', required: true, index: true },
        teamId: { type: Schema.Types.ObjectId, ref: 'Team', required: true, index: true },
        reference: { type: String, required: true, unique: true },
        member: {
            type: new Schema<OrderMember>(
                {
                    fullName: { type: String, required: true, trim: true },
                    email: { type: String, trim: true, lowercase: true },
                    phone: { type: String, trim: true },
                },
                { _id: false }
            ),
            required: true,
        },
        lines: {
            type: [OrderLineSchema],
            required: true,
            validate: [(v: unknown[]) => v.length > 0, 'Order must have at least one line'],
        },
        totalCents: { type: Number, required: true, min: 0 },
        status: {
            type: String,
            enum: ORDER_STATUSES,
            required: true,
            default: 'submitted',
        },
        paymentStatus: { type: String, enum: ['unpaid', 'paid'], required: true, default: 'unpaid' },
        notes: { type: String, trim: true },
        adminNotes: { type: String, trim: true },
    },
    { timestamps: true }
);

OrderSchema.index({ formId: 1, status: 1 });

const Order: Model<OrderData> = models.Order || model<OrderData>('Order', OrderSchema);

export default Order;
