'use client';
import React, { useEffect, useState } from 'react';
import {
    listOrderAccess,
    grantOrderAccess,
    revokeOrderAccess,
    deleteOrderAccess,
    type AccessGrant,
} from '@/app/admin/orders/accessActions';

/**
 * "Достъп за преглед" block inside an expanded order row: assign an email,
 * get a 6-digit code (shown once) to send via Viber/phone, revoke grants.
 */
const OrderAccessManager = ({ orderId }: { orderId: string }) => {
    const [grants, setGrants] = useState<AccessGrant[] | null>(null);
    const [email, setEmail] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [issued, setIssued] = useState<{ email: string; code: string } | null>(null);

    const reload = async () => {
        try {
            setGrants(await listOrderAccess(orderId));
        } catch {
            setGrants([]);
        }
    };

    useEffect(() => {
        reload();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [orderId]);

    const grant = async () => {
        setBusy(true);
        setError('');
        setIssued(null);
        try {
            const res = await grantOrderAccess(orderId, email);
            if (!res.ok) {
                setError(res.message);
                return;
            }
            setIssued({ email: res.email, code: res.code });
            setEmail('');
            await reload();
        } catch {
            setError('Възникна грешка.');
        } finally {
            setBusy(false);
        }
    };

    const revoke = async (grantId: string) => {
        setBusy(true);
        try {
            await revokeOrderAccess(grantId);
            await reload();
        } finally {
            setBusy(false);
        }
    };

    const remove = async (grant: AccessGrant) => {
        if (!window.confirm(`Изтриване на достъпа за ${grant.email}? Кодът спира да работи.`)) return;
        setBusy(true);
        try {
            await deleteOrderAccess(grant._id);
            await reload();
        } finally {
            setBusy(false);
        }
    };

    return (
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--color-divider)' }}>
            <p style={{ fontSize: 12, fontWeight: 700, margin: '0 0 6px', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--color-accent-700)' }}>
                Достъп за преглед (треньори)
            </p>

            <div className="flex flex-wrap items-center gap-2">
                <input
                    className="input"
                    style={{ width: 240, minHeight: 32, fontSize: 13 }}
                    type="email"
                    placeholder="имейл на треньора"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); grant(); } }}
                />
                <button type="button" onClick={grant} disabled={busy || !email.trim()} className="btn btn-secondary" style={{ fontSize: 13, padding: '5px 12px' }}>
                    Генерирай код
                </button>
                {error && <span className="field-error" style={{ margin: 0 }}>{error}</span>}
            </div>

            {issued && (
                <div
                    className="flex flex-wrap items-center gap-3"
                    style={{ marginTop: 8, padding: '8px 12px', background: 'color-mix(in oklab, var(--color-accent), white 88%)' }}
                >
                    <span style={{ fontSize: 13 }}>
                        Код за <strong>{issued.email}</strong>:
                    </span>
                    <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 20, letterSpacing: '0.15em' }}>
                        {issued.code}
                    </span>
                    <button
                        type="button"
                        className="btn btn-ghost"
                        style={{ fontSize: 12 }}
                        onClick={() => navigator.clipboard?.writeText(
                            `Преглед на поръчката: ${window.location.origin}/order-access · Имейл: ${issued.email} · Код: ${issued.code}`
                        )}
                    >
                        Копирай съобщение
                    </button>
                    <span className="text-muted" style={{ fontSize: 11.5 }}>
                        Показва се само веднъж — изпратете го по Viber.
                    </span>
                </div>
            )}

            {grants && grants.length > 0 && (
                <div style={{ marginTop: 8 }}>
                    {grants.map(g => (
                        <div key={g._id} className="flex flex-wrap items-center gap-2" style={{ fontSize: 12.5, padding: '4px 0' }}>
                            <span style={{ fontWeight: 600, textDecoration: g.revoked ? 'line-through' : 'none' }}>{g.email}</span>
                            {g.revoked ? (
                                <span className="tag tag-ink">спрян</span>
                            ) : (
                                <span className="tag tag-good">активен</span>
                            )}
                            {g.lastUsedAt && (
                                <span className="text-muted">последно ползван {new Date(g.lastUsedAt).toLocaleDateString('bg-BG')}</span>
                            )}
                            {!g.revoked && (
                                <button type="button" onClick={() => revoke(g._id)} disabled={busy} className="btn btn-ghost" style={{ fontSize: 12 }}>
                                    спри достъпа
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => remove(g)}
                                disabled={busy}
                                className="btn btn-ghost"
                                style={{ fontSize: 12, color: 'var(--status-cancelled)' }}
                                title="Изтрий записа — кодът спира да работи и редът изчезва"
                            >
                                ✕ изтрий
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OrderAccessManager;
