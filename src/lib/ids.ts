import crypto from 'crypto';

/** "FC Example — Autumn 2026" -> "fc-example-autumn-2026" */
export function slugify(input: string): string {
    return input
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '') // strip diacritics
        .replace(/[а-яА-Я]/g, transliterateCyrillic)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 60) || 'item';
}

const CYRILLIC_MAP: Record<string, string> = {
    а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ж: 'zh', з: 'z', и: 'i',
    й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's',
    т: 't', у: 'u', ф: 'f', х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sht',
    ъ: 'a', ь: 'y', ю: 'yu', я: 'ya',
};

function transliterateCyrillic(ch: string): string {
    const lower = ch.toLowerCase();
    return CYRILLIC_MAP[lower] ?? '';
}

/** Unguessable lowercase token for public form URLs. */
export function randomToken(length = 6): string {
    const alphabet = 'abcdefghjkmnpqrstuvwxyz23456789'; // no 0/o, 1/l/i
    let out = '';
    for (let i = 0; i < length; i++) {
        out += alphabet[crypto.randomInt(alphabet.length)];
    }
    return out;
}

/** "autumn-2026-kit" -> "autumn-2026-kit-k7f3q9" */
export function formSlug(base: string): string {
    return `${slugify(base)}-${randomToken()}`;
}

/** Human-facing order reference, e.g. "ORD-20260825-4831". */
export function orderReference(now: Date = new Date()): string {
    const ymd = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    return `ORD-${ymd}-${crypto.randomInt(0, 10_000).toString().padStart(4, '0')}`;
}
