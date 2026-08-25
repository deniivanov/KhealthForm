/**
 * Pure order logic — no I/O, covered by tests.
 */

export interface AcceptingWindow {
    status: string;
    opensAt?: Date | string | null;
    closesAt?: Date | string | null;
}

/** A form accepts orders only when open AND inside its opens/closes window. */
export function isFormAcceptingOrders(form: AcceptingWindow, now: Date = new Date()): boolean {
    if (form.status !== 'open') return false;
    if (form.opensAt && now < new Date(form.opensAt)) return false;
    if (form.closesAt && now > new Date(form.closesAt)) return false;
    return true;
}

export interface PriceableFormItem {
    _id: string;
    sku: string;
    name: string;
    priceCents: number;
    sizes: Array<{ label: string; priceAdjustmentCents?: number | null }>;
    personalization: Array<{ key: string; label: string; type: 'text' | 'number'; required: boolean }>;
}

export interface SubmittedLine {
    formItemId: string;
    sizeLabel: string;
    quantity: number;
    personalization?: Record<string, unknown>;
}

export interface PricedLine {
    formItemId: string;
    productSku: string;
    productName: string;
    sizeLabel: string;
    quantity: number;
    unitPriceCents: number;
    personalization: Record<string, string>;
}

export type PricingResult =
    | { ok: true; lines: PricedLine[]; totalCents: number }
    | { ok: false; error: string };

export const MAX_LINE_QUANTITY = 20;
export const MAX_LINES = 50;

/**
 * Rebuild and price order lines strictly from the form snapshot; the client
 * only chooses item, size, quantity and personalization values.
 */
export function priceOrderLines(
    formItems: PriceableFormItem[],
    submitted: SubmittedLine[]
): PricingResult {
    if (!Array.isArray(submitted) || submitted.length === 0) return { ok: false, error: 'empty' };
    if (submitted.length > MAX_LINES) return { ok: false, error: 'too_many_lines' };

    const itemById = new Map(formItems.map(i => [String(i._id), i]));
    const lines: PricedLine[] = [];

    for (const line of submitted) {
        const item = itemById.get(String(line.formItemId));
        if (!item) return { ok: false, error: 'unknown_item' };

        const size = item.sizes.find(s => s.label === line.sizeLabel);
        if (!size) return { ok: false, error: 'unknown_size' };

        const quantity = Number(line.quantity);
        if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_LINE_QUANTITY) {
            return { ok: false, error: 'invalid_quantity' };
        }

        const personalization: Record<string, string> = {};
        for (const field of item.personalization) {
            const raw = line.personalization?.[field.key];
            const value = raw === undefined || raw === null ? '' : String(raw).trim().slice(0, 80);
            if (field.required && !value) return { ok: false, error: `missing_${field.key}` };
            if (value && field.type === 'number' && !/^\d{1,4}$/.test(value)) {
                return { ok: false, error: `invalid_${field.key}` };
            }
            if (value) personalization[field.key] = value;
        }
        // ignore submitted keys that are not defined on the item

        const unitPriceCents = item.priceCents + (size.priceAdjustmentCents ?? 0);
        lines.push({
            formItemId: String(item._id),
            productSku: item.sku,
            productName: item.name,
            sizeLabel: size.label,
            quantity,
            unitPriceCents,
            personalization,
        });
    }

    const totalCents = lines.reduce((sum, l) => sum + l.unitPriceCents * l.quantity, 0);
    return { ok: true, lines, totalCents };
}
