import { Schema, model, models, type Model } from 'mongoose';

export interface TeamBrandColors {
    /** hex, e.g. "#1d4ed8" — accents on the public form */
    primary: string;
    secondary?: string;
}

export interface TeamData {
    name: string;
    /** URL-safe, unique */
    slug: string;
    contactName?: string;
    email?: string;
    phone?: string;
    notes?: string;
    /** shown in the public form header */
    logoUrl?: string;
    brandColors?: TeamBrandColors;
    createdAt?: Date;
    updatedAt?: Date;
}

const HEX_COLOR = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

const TeamSchema = new Schema<TeamData>(
    {
        name: { type: String, required: true, trim: true },
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        },
        contactName: { type: String, trim: true },
        email: { type: String, trim: true, lowercase: true },
        phone: { type: String, trim: true },
        notes: { type: String, trim: true },
        logoUrl: { type: String, trim: true },
        brandColors: {
            type: new Schema<TeamBrandColors>(
                {
                    primary: { type: String, required: true, match: HEX_COLOR },
                    secondary: { type: String, match: HEX_COLOR },
                },
                { _id: false }
            ),
        },
    },
    { timestamps: true }
);

const Team: Model<TeamData> = models.Team || model<TeamData>('Team', TeamSchema);

export default Team;
