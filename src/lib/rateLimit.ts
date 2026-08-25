/**
 * Basic in-memory rate limiter keyed by string (IP). Suits a
 * single-instance deployment.
 */

const buckets = new Map<string, Map<string, number[]>>();

export function isRateLimited(
    scope: string,
    key: string,
    limit: number,
    windowMs: number
): boolean {
    let scoped = buckets.get(scope);
    if (!scoped) {
        scoped = new Map();
        buckets.set(scope, scoped);
    }
    const now = Date.now();
    const hits = (scoped.get(key) || []).filter(t => now - t < windowMs);
    if (hits.length >= limit) {
        scoped.set(key, hits);
        return true;
    }
    hits.push(now);
    scoped.set(key, hits);
    if (scoped.size > 10_000) scoped.clear();
    return false;
}
