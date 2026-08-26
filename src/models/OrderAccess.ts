import { Schema, model, models, type Model, type Types } from 'mongoose';

/**
 * A grant that lets an external person (coach, club contact) view one order
 * with their email + a 6-digit code. The code is stored bcrypt-hashed;
 * the plain code is shown to the admin exactly once at creation.
 */
export interface OrderAccessData {
    orderId: Types.ObjectId;
    email: string;
    codeHash: string;
    revoked: boolean;
    lastUsedAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

const OrderAccessSchema = new Schema<OrderAccessData>(
    {
        orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
        email: { type: String, required: true, lowercase: true, trim: true, index: true },
        codeHash: { type: String, required: true },
        revoked: { type: Boolean, required: true, default: false },
        lastUsedAt: { type: Date },
    },
    { timestamps: true }
);

OrderAccessSchema.index({ orderId: 1, email: 1 }, { unique: true });

const OrderAccess: Model<OrderAccessData> =
    models.OrderAccess || model<OrderAccessData>('OrderAccess', OrderAccessSchema);

export default OrderAccess;
