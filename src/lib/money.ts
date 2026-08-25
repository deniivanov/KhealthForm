/** Money is stored as integer EUR cents everywhere; format only on output. */

export function formatCents(cents: number, locale: string = 'bg-BG'): string {
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'EUR',
    }).format(cents / 100);
}

/** "12.50" | "12,50" | 12.5 -> 1250; returns null for invalid input */
export function parseEuroToCents(value: string | number): number | null {
    const num = typeof value === 'number' ? value : Number(String(value).trim().replace(',', '.'));
    if (!Number.isFinite(num) || num < 0) return null;
    return Math.round(num * 100);
}

export function centsToEuroString(cents: number): string {
    return (cents / 100).toFixed(2);
}
