import { Schema, model, models, type Model } from 'mongoose';

export type UserRole = 'admin' | 'viewer';

export interface UserData {
    email: string;
    passwordHash: string;
    role: UserRole;
    name?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const UserSchema = new Schema<UserData>(
    {
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        passwordHash: { type: String, required: true },
        role: { type: String, enum: ['admin', 'viewer'], required: true, default: 'admin' },
        name: { type: String, trim: true },
    },
    { timestamps: true }
);

const User: Model<UserData> = models.User || model<UserData>('User', UserSchema);

export default User;
