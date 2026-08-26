import crypto from 'crypto';

/**
 * Lightweight signed token for coach order-viewing sessions (separate from
 * the Auth.js admin session). Format: v1.<expEpoch>.<emailBase64url>.<hmac>
 */

const VERSION = 'v1';
export const ORDER_ACCESS_COOKIE = 'order_access';
export const ORDER_ACCESS_TTL_SECONDS = 30 * 24 * 60 * 60; // 30 days

function hmac(payload: string, secret: string): string {
    return crypto.createHmac('sha256', secret).update(payload).digest('base64url');
}

export function signOrderAccessToken(email: string, now: Date = new Date()): string {
    const secret = process.env.AUTH_SECRET;
    if (!secret) throw new Error('AUTH_SECRET is not set');
    const exp = Math.floor(now.getTime() / 1000) + ORDER_ACCESS_TTL_SECONDS;
    const payload = `${VERSION}.${exp}.${Buffer.from(email.toLowerCase()).toString('base64url')}`;
    return `${payload}.${hmac(payload, secret)}`;
}

export function verifyOrderAccessToken(token: string | undefined, now: Date = new Date()): string | null {
    const secret = process.env.AUTH_SECRET;
    if (!secret || !token) return null;
    const parts = token.split('.');
    if (parts.length !== 4 || parts[0] !== VERSION) return null;
    const [version, expStr, emailB64, signature] = parts;
    const payload = `${version}.${expStr}.${emailB64}`;
    const expected = hmac(payload, secret);
    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
    const exp = parseInt(expStr, 10);
    if (!Number.isFinite(exp) || now.getTime() / 1000 > exp) return null;
    try {
        return Buffer.from(emailB64, 'base64url').toString('utf8');
    } catch {
        return null;
    }
}

/** 6-digit numeric code, e.g. "482913" (no leading-zero loss). */
export function generateAccessCode(): string {
    return crypto.randomInt(0, 1_000_000).toString().padStart(6, '0');
}
