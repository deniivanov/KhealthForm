import type { TeamData } from '@/models/Team';
import type { ValidationResult } from '@/lib/validate/product';
import { slugify } from '@/lib/slug';

export interface TeamInput {
    name: string;
    slug?: string;
    contactName?: string;
    email?: string;
    phone?: string;
    notes?: string;
    logoUrl?: string;
    brandPrimary?: string;
    brandSecondary?: string;
}

export type ValidatedTeam = Omit<TeamData, 'createdAt' | 'updatedAt'>;

const HEX_COLOR = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function validateTeam(input: TeamInput): ValidationResult<ValidatedTeam> {
    const errors: Record<string, string> = {};

    const name = String(input.name ?? '').trim();
    if (!name || name.length > 120) errors.name = 'Името е задължително (до 120 знака)';

    let slug = String(input.slug ?? '').trim().toLowerCase();
    if (!slug) slug = slugify(name);
    if (!SLUG.test(slug) || slug.length > 60) {
        errors.slug = 'Slug: само малки латински букви, цифри и тирета';
    }

    const contactName = String(input.contactName ?? '').trim().slice(0, 120) || undefined;
    const email = String(input.email ?? '').trim().toLowerCase() || undefined;
    if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) errors.email = 'Невалиден имейл';
    const phone = String(input.phone ?? '').trim().slice(0, 40) || undefined;
    const notes = String(input.notes ?? '').trim().slice(0, 2000) || undefined;

    const logoUrl = String(input.logoUrl ?? '').trim() || undefined;
    if (logoUrl && !/^(https:\/\/|\/)/.test(logoUrl)) {
        errors.logoUrl = 'Логото трябва да е https:// или / адрес';
    }

    const brandPrimary = String(input.brandPrimary ?? '').trim() || undefined;
    const brandSecondary = String(input.brandSecondary ?? '').trim() || undefined;
    if (brandPrimary && !HEX_COLOR.test(brandPrimary)) errors.brandPrimary = 'Невалиден цвят (hex, напр. #1d4ed8)';
    if (brandSecondary && !HEX_COLOR.test(brandSecondary)) errors.brandSecondary = 'Невалиден цвят (hex)';
    if (!brandPrimary && brandSecondary) errors.brandPrimary = 'Изберете основен цвят';

    if (Object.keys(errors).length > 0) return { ok: false, errors };

    return {
        ok: true,
        data: {
            name,
            slug,
            contactName,
            email,
            phone,
            notes,
            logoUrl,
            brandColors: brandPrimary ? { primary: brandPrimary, secondary: brandSecondary } : undefined,
        },
    };
}
