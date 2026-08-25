import crypto from 'crypto';
import { slugify } from '@/lib/slug';

export { slugify };

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
