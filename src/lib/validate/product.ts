import type { SizeVariant } from '@/models/Product';
import { parseEuroToCents } from '@/lib/money';

export interface ProductInput {
    sku: string;
    name: string;
    description?: string;
    category: string;
    images: string[];
    /** euro string or number, e.g. "18.50" */
    basePrice: string | number;
    dimensions: string[];
    sizes: Array<{
        label: string;
        measurements: Record<string, number | string | null>;
        /** euro string/number delta; empty = none */
        priceAdjustment?: string | number | null;
    }>;
    isActive: boolean;
}

export interface ValidatedProduct {
    sku: string;
    name: string;
    description?: string;
    category: string;
    images: string[];
    basePriceCents: number;
    dimensions: string[];
    sizes: SizeVariant[];
    isActive: boolean;
}

export type ValidationResult<T> =
    | { ok: true; data: T }
    | { ok: false; errors: Record<string, string> };

const DIMENSION_KEY = /^[a-zA-Z][a-zA-Z0-9]*$/;

export function validateProduct(input: ProductInput): ValidationResult<ValidatedProduct> {
    const errors: Record<string, string> = {};

    const sku = String(input.sku ?? '').trim().toUpperCase();
    if (!sku || sku.length > 40) errors.sku = 'SKU е задължителен (до 40 знака)';

    const name = String(input.name ?? '').trim();
    if (!name || name.length > 120) errors.name = 'Името е задължително (до 120 знака)';

    const description = String(input.description ?? '').trim().slice(0, 2000) || undefined;

    const category = String(input.category ?? '').trim().toLowerCase();
    if (!category || category.length > 40) errors.category = 'Категорията е задължителна';

    const images = (Array.isArray(input.images) ? input.images : [])
        .map(u => String(u ?? '').trim())
        .filter(Boolean)
        .slice(0, 10);
    for (const url of images) {
        if (!/^(https:\/\/|\/)/.test(url)) {
            errors.images = 'Снимките трябва да са https:// или / адреси';
            break;
        }
    }

    const basePriceCents = parseEuroToCents(input.basePrice);
    if (basePriceCents === null || basePriceCents > 100_000_00) {
        errors.basePrice = 'Невалидна цена';
    }

    const dimensions = (Array.isArray(input.dimensions) ? input.dimensions : [])
        .map(d => String(d ?? '').trim())
        .filter(Boolean)
        .slice(0, 12);
    if (new Set(dimensions).size !== dimensions.length) {
        errors.dimensions = 'Дублирано измерение';
    }
    for (const d of dimensions) {
        if (!DIMENSION_KEY.test(d)) {
            errors.dimensions = `Невалиден ключ на измерение: "${d}" (латиница, без интервали)`;
            break;
        }
    }

    const sizes: SizeVariant[] = [];
    const rawSizes = Array.isArray(input.sizes) ? input.sizes.slice(0, 40) : [];
    const seenLabels = new Set<string>();
    for (const [i, raw] of rawSizes.entries()) {
        const label = String(raw?.label ?? '').trim();
        if (!label || label.length > 20) {
            errors.sizes = `Ред ${i + 1}: невалиден размер`;
            continue;
        }
        if (seenLabels.has(label)) {
            errors.sizes = `Дублиран размер "${label}"`;
            continue;
        }
        seenLabels.add(label);

        const measurements: Record<string, number> = {};
        for (const dim of dimensions) {
            const value = raw?.measurements?.[dim];
            if (value === undefined || value === null || value === '') continue; // cells may be empty
            const num = Number(String(value).replace(',', '.'));
            if (!Number.isFinite(num) || num < 0 || num > 1000) {
                errors.sizes = `Размер "${label}": невалидна стойност за ${dim}`;
                continue;
            }
            measurements[dim] = num;
        }

        let priceAdjustmentCents: number | undefined;
        if (raw?.priceAdjustment !== undefined && raw?.priceAdjustment !== null && String(raw.priceAdjustment).trim() !== '') {
            const str = String(raw.priceAdjustment).trim().replace(',', '.');
            const sign = str.startsWith('-') ? -1 : 1;
            const cents = parseEuroToCents(str.replace(/^[+-]/, ''));
            if (cents === null || cents > 10_000_00) {
                errors.sizes = `Размер "${label}": невалидна корекция на цената`;
            } else if (cents !== 0) {
                priceAdjustmentCents = sign * cents;
            }
        }

        sizes.push({ label, measurements, priceAdjustmentCents });
    }
    if (sizes.length === 0) errors.sizes = errors.sizes || 'Добавете поне един размер';

    if (Object.keys(errors).length > 0) return { ok: false, errors };

    return {
        ok: true,
        data: {
            sku,
            name,
            description,
            category,
            images,
            basePriceCents: basePriceCents as number,
            dimensions,
            sizes,
            isActive: Boolean(input.isActive),
        },
    };
}
