import type { ValidationResult } from '@/lib/validate/product';
import type { PersonalizationField } from '@/models/Form';

export interface FormItemInput {
    productId: string;
    /** euro string; empty = use catalog base price */
    priceOverride?: string | number | null;
    /** size labels to offer; empty array = all catalog sizes */
    sizeLabels: string[];
    personalization: Array<{ key: string; label: string; type: string; required: boolean }>;
}

export interface FormInput {
    teamId: string;
    title: string;
    message?: string;
    opensAt?: string | null;
    closesAt?: string | null;
    requireEmail: boolean;
    requirePhone: boolean;
    items: FormItemInput[];
}

export interface ValidatedFormInput {
    teamId: string;
    title: string;
    message?: string;
    opensAt?: Date;
    closesAt?: Date;
    requiredMemberFields: { email: boolean; phone: boolean };
    items: Array<{
        productId: string;
        priceOverrideCents: number | null;
        sizeLabels: string[];
        personalization: PersonalizationField[];
    }>;
}

const OBJECT_ID = /^[0-9a-f]{24}$/;
const FIELD_KEY = /^[a-zA-Z][a-zA-Z0-9]*$/;

import { parseEuroToCents } from '@/lib/money';

export function validateForm(input: FormInput): ValidationResult<ValidatedFormInput> {
    const errors: Record<string, string> = {};

    const teamId = String(input.teamId ?? '').trim();
    if (!OBJECT_ID.test(teamId)) errors.teamId = 'Изберете отбор';

    const title = String(input.title ?? '').trim();
    if (!title || title.length > 160) errors.title = 'Заглавието е задължително (до 160 знака)';

    const message = String(input.message ?? '').trim().slice(0, 2000) || undefined;

    let opensAt: Date | undefined;
    let closesAt: Date | undefined;
    if (input.opensAt) {
        const d = new Date(input.opensAt);
        if (Number.isNaN(d.getTime())) errors.opensAt = 'Невалидна дата';
        else opensAt = d;
    }
    if (input.closesAt) {
        const d = new Date(input.closesAt);
        if (Number.isNaN(d.getTime())) errors.closesAt = 'Невалидна дата';
        else closesAt = d;
    }
    if (opensAt && closesAt && closesAt <= opensAt) {
        errors.closesAt = 'Крайната дата трябва да е след началната';
    }

    const rawItems = Array.isArray(input.items) ? input.items.slice(0, 50) : [];
    if (rawItems.length === 0) errors.items = 'Добавете поне един продукт';

    const items: ValidatedFormInput['items'] = [];
    const seenProducts = new Set<string>();
    for (const [i, raw] of rawItems.entries()) {
        const productId = String(raw?.productId ?? '').trim();
        if (!OBJECT_ID.test(productId)) {
            errors.items = `Продукт ${i + 1}: невалиден идентификатор`;
            continue;
        }
        if (seenProducts.has(productId)) {
            errors.items = `Продукт ${i + 1}: дублиран продукт`;
            continue;
        }
        seenProducts.add(productId);

        let priceOverrideCents: number | null = null;
        const rawPrice = raw?.priceOverride;
        if (rawPrice !== undefined && rawPrice !== null && String(rawPrice).trim() !== '') {
            const cents = parseEuroToCents(String(rawPrice));
            if (cents === null || cents > 100_000_00) {
                errors.items = `Продукт ${i + 1}: невалидна цена`;
            } else {
                priceOverrideCents = cents;
            }
        }

        const sizeLabels = (Array.isArray(raw?.sizeLabels) ? raw.sizeLabels : [])
            .map(s => String(s ?? '').trim())
            .filter(Boolean)
            .slice(0, 40);

        const personalization: PersonalizationField[] = [];
        const seenKeys = new Set<string>();
        for (const field of (Array.isArray(raw?.personalization) ? raw.personalization : []).slice(0, 10)) {
            const key = String(field?.key ?? '').trim();
            const label = String(field?.label ?? '').trim();
            const type = field?.type === 'number' ? 'number' : 'text';
            if (!FIELD_KEY.test(key) || !label || label.length > 60) {
                errors.items = `Продукт ${i + 1}: невалидно поле за персонализация`;
                continue;
            }
            if (seenKeys.has(key)) {
                errors.items = `Продукт ${i + 1}: дублиран ключ "${key}"`;
                continue;
            }
            seenKeys.add(key);
            personalization.push({ key, label, type, required: Boolean(field?.required) });
        }

        items.push({ productId, priceOverrideCents, sizeLabels, personalization });
    }

    if (Object.keys(errors).length > 0) return { ok: false, errors };

    return {
        ok: true,
        data: {
            teamId,
            title,
            message,
            opensAt,
            closesAt,
            requiredMemberFields: { email: Boolean(input.requireEmail), phone: Boolean(input.requirePhone) },
            items,
        },
    };
}
