'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { formatCents } from '@/lib/money';
import type { Dictionary, Locale } from '@/lib/i18n';
import { submitPublicOrder, type PublicOrderResult } from '@/app/f/[teamSlug]/[formSlug]/actions';

export interface PublicTeamData {
    _id: string;
    name: string;
    logoUrl?: string;
    brandColors?: { primary: string; secondary?: string };
}

export interface PublicFormItem {
    _id: string;
    sku: string;
    name: string;
    description?: string;
    images: string[];
    priceCents: number;
    dimensions: string[];
    sizes: Array<{ label: string; measurements: Record<string, number>; priceAdjustmentCents?: number }>;
    personalization: Array<{ key: string; label: string; type: 'text' | 'number'; required: boolean }>;
}

export interface PublicFormData {
    _id: string;
    title: string;
    message?: string;
    closesAt?: string;
    requiredMemberFields: { email: boolean; phone: boolean };
    items: PublicFormItem[];
}

interface CartLine {
    formItemId: string;
    productName: string;
    sizeLabel: string;
    quantity: number;
    unitPriceCents: number;
    personalization: Record<string, string>;
}

interface ItemSelection {
    sizeLabel: string;
    quantity: number;
    personalization: Record<string, string>;
}

function unitPrice(item: PublicFormItem, sizeLabel: string): number {
    const size = item.sizes.find(s => s.label === sizeLabel);
    return item.priceCents + (size?.priceAdjustmentCents ?? 0);
}

function defaultSize(item: PublicFormItem): string {
    return item.sizes[Math.min(2, item.sizes.length - 1)]?.label ?? '';
}

const EMAIL_RX = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

const Photo = ({ src, alt, aspect }: { src?: string; alt: string; aspect?: string }) => (
    <div
        className="grayscale-photo"
        style={{ aspectRatio: aspect, background: 'var(--color-surface)', overflow: 'hidden', height: aspect ? undefined : '100%' }}
    >
        {src && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src} alt={alt} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        )}
    </div>
);

const PublicOrderForm = ({
    team,
    form,
    locale,
    dict,
    deadline,
}: {
    team: PublicTeamData;
    form: PublicFormData;
    locale: Locale;
    dict: Dictionary;
    deadline: string | null;
}) => {
    const [view, setView] = useState<'shop' | 'detail'>('shop');
    const [detailId, setDetailId] = useState<string | null>(null);
    const [chartOpen, setChartOpen] = useState(false);
    const [selections, setSelections] = useState<Record<string, ItemSelection>>({});
    const [cart, setCart] = useState<CartLine[]>([]);
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [notes, setNotes] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitError, setSubmitError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState<{ reference: string; totalCents: number; firstName: string } | null>(null);
    const [toast, setToast] = useState('');

    const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const overlayRef = useRef<HTMLDivElement>(null);
    const summaryRef = useRef<HTMLDivElement>(null);

    const fmt = (cents: number) => formatCents(cents, locale === 'bg' ? 'bg-BG' : 'en-IE');

    const detail = form.items.find(i => i._id === detailId) ?? form.items[0] ?? null;

    useEffect(() => {
        if (view === 'detail' && overlayRef.current) overlayRef.current.scrollTop = 0;
    }, [view, detailId]);

    const totalCents = useMemo(
        () => cart.reduce((sum, l) => sum + l.unitPriceCents * l.quantity, 0),
        [cart]
    );
    const cartCount = cart.reduce((n, l) => n + l.quantity, 0);

    const getSelection = (item: PublicFormItem): ItemSelection =>
        selections[item._id] ?? { sizeLabel: defaultSize(item), quantity: 1, personalization: {} };

    const patchSelection = (item: PublicFormItem, patch: Partial<ItemSelection>) => {
        setSelections(prev => ({ ...prev, [item._id]: { ...getSelection(item), ...patch } }));
    };

    const showToast = (msg: string) => {
        clearTimeout(toastTimer.current);
        setToast(msg);
        toastTimer.current = setTimeout(() => setToast(''), 2200);
    };

    const openDetail = (item: PublicFormItem) => {
        setDetailId(item._id);
        setView('detail');
    };

    const addToCart = (item: PublicFormItem) => {
        const sel = getSelection(item);
        const fieldErrors: Record<string, string> = {};
        for (const field of item.personalization) {
            if (field.required && !(sel.personalization[field.key] ?? '').trim()) {
                fieldErrors[`${item._id}.${field.key}`] = dict.errRequired;
            }
        }
        setErrors(prev => {
            const next = { ...prev };
            for (const k of Object.keys(next)) if (k.startsWith(`${item._id}.`)) delete next[k];
            return { ...next, ...fieldErrors };
        });
        if (Object.keys(fieldErrors).length > 0) return;

        const personalization = Object.fromEntries(
            Object.entries(sel.personalization)
                .map(([k, v]) => [k, v.trim()])
                .filter(([, v]) => v)
        );

        setCart(prev => {
            const same = (a: Record<string, string>, b: Record<string, string>) =>
                JSON.stringify(a) === JSON.stringify(b);
            const idx = prev.findIndex(
                l => l.formItemId === item._id && l.sizeLabel === sel.sizeLabel && same(l.personalization, personalization)
            );
            if (idx > -1) {
                const next = [...prev];
                next[idx] = { ...next[idx], quantity: next[idx].quantity + sel.quantity };
                return next;
            }
            return [
                ...prev,
                {
                    formItemId: item._id,
                    productName: item.name,
                    sizeLabel: sel.sizeLabel,
                    quantity: sel.quantity,
                    unitPriceCents: unitPrice(item, sel.sizeLabel),
                    personalization,
                },
            ];
        });
        patchSelection(item, { personalization: {}, quantity: 1 });
        setView('shop');
        showToast(`${item.name} · ${sel.sizeLabel} × ${sel.quantity} ${dict.added}`);
    };

    const jumpToSummary = () => {
        summaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const handleSubmit = async () => {
        const nextErrors: Record<string, string> = {};
        if (!fullName.trim()) nextErrors.fullName = dict.errName;
        if (form.requiredMemberFields.phone && !phone.trim()) nextErrors.phone = dict.errPhone;
        if (form.requiredMemberFields.email && !EMAIL_RX.test(email.trim())) nextErrors.email = dict.errEmail;
        if (email.trim() && !EMAIL_RX.test(email.trim())) nextErrors.email = dict.errEmail;
        if (cart.length === 0) nextErrors.cart = dict.errCartEmpty;
        setErrors(nextErrors);
        setSubmitError('');
        if (Object.keys(nextErrors).length > 0) return;

        setSubmitting(true);
        let result: PublicOrderResult;
        try {
            result = await submitPublicOrder(form._id, {
                member: { fullName, email, phone },
                notes,
                lines: cart.map(l => ({
                    formItemId: l.formItemId,
                    sizeLabel: l.sizeLabel,
                    quantity: l.quantity,
                    personalization: l.personalization,
                })),
            });
        } catch {
            result = { ok: false, error: 'generic' };
        }
        setSubmitting(false);

        if (result.ok) {
            setSuccess({
                reference: result.reference,
                totalCents: result.totalCents,
                firstName: fullName.trim().split(' ')[0],
            });
            window.scrollTo({ top: 0 });
        } else {
            setSubmitError(
                result.error === 'rate_limited'
                    ? dict.errTooMany
                    : result.error === 'closed'
                      ? dict.formClosedBody
                      : dict.errGeneric
            );
        }
    };

    const measurementLabel = (key: string) => dict.measurementLabels[key] || key;

    // ── Success view ──
    if (success) {
        return (
            <div style={{ paddingBottom: 40 }}>
                <div className="nav">
                    <span className="nav-brand">{team.name}</span>
                </div>
                <div style={{ padding: '28px 20px' }}>
                    <h6>{dict.orderReceived}</h6>
                    <h2 style={{ marginBottom: 8 }}>
                        {dict.thankYou}, {success.firstName}.
                    </h2>
                    <p className="text-muted" style={{ fontSize: 13 }}>{dict.successBody}</p>
                    <div className="card elev-sm" style={{ margin: '16px 0' }}>
                        <span className="card-kicker">{dict.reference}</span>
                        <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 28, letterSpacing: '0.02em' }}>
                            {success.reference}
                        </span>
                        <span className="card-meta">
                            {dict.total} {fmt(success.totalCents)} · {dict.confirmationNote}
                        </span>
                    </div>
                    <button
                        type="button"
                        className="btn btn-secondary btn-block"
                        style={{ minHeight: 44 }}
                        onClick={() => {
                            setSuccess(null);
                            setCart([]);
                            setNotes('');
                        }}
                    >
                        {dict.newOrder}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* ══ Shop view (stays mounted under the detail overlay) ══ */}
            <div style={{ paddingBottom: cart.length > 0 ? 88 : 24 }}>
                <div className="nav">
                    <span className="nav-brand">{team.name}</span>
                    {deadline && (
                        <span className="tag tag-accent" style={{ whiteSpace: 'nowrap' }}>
                            {dict.closesShort} {deadline}
                        </span>
                    )}
                </div>

                {/* Intro */}
                <div style={{ padding: '20px 20px 4px' }}>
                    <h6>{dict.kicker}</h6>
                    <h3 style={{ marginBottom: 6 }}>{form.title}</h3>
                    <p className="text-muted" style={{ fontSize: 13, margin: 0 }}>
                        {form.message || dict.tapHint}
                    </p>
                </div>

                {/* Product grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 12px', padding: '16px 20px' }}>
                    {form.items.map(item => (
                        <div
                            key={item._id}
                            onClick={() => openDetail(item)}
                            style={{ cursor: 'pointer', background: 'var(--color-surface)' }}
                        >
                            <Photo src={item.images[0]} alt={item.name} aspect="3 / 4" />
                            <div style={{ padding: '10px 12px 12px' }}>
                                <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 14 }}>
                                    {item.name}
                                </span>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 2 }}>
                                    <span className="text-muted" style={{ fontSize: 11.5 }}>
                                        {item.sizes[0]?.label}–{item.sizes[item.sizes.length - 1]?.label}
                                    </span>
                                    <span style={{ fontWeight: 600, fontSize: 13 }}>{fmt(item.priceCents)}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Your order */}
                <div ref={summaryRef} style={{ padding: '8px 20px 0', scrollMarginTop: 12 }}>
                    <hr className="hr" style={{ margin: '0 0 16px' }} />
                    <h6>{dict.orderSummary}</h6>
                    {cart.length === 0 && (
                        <p className="text-muted" style={{ fontSize: 13 }}>{dict.emptyCart}</p>
                    )}
                    {cart.map((line, i) => (
                        <div
                            key={i}
                            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: '1px solid var(--color-divider)' }}
                        >
                            <div style={{ flex: 1, fontSize: 13 }}>
                                <span style={{ fontWeight: 600 }}>
                                    {line.productName} · {line.sizeLabel}
                                    {line.quantity > 1 ? ` × ${line.quantity}` : ''}
                                </span>
                                {Object.values(line.personalization).length > 0 && (
                                    <span className="text-muted" style={{ display: 'block', fontSize: 11.5 }}>
                                        {Object.values(line.personalization).join(' · ')}
                                    </span>
                                )}
                            </div>
                            <span style={{ fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap' }}>
                                {fmt(line.unitPriceCents * line.quantity)}
                            </span>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => setCart(cart.filter((_, j) => j !== i))}
                                title={dict.remove}
                                style={{ width: 30, height: 30, padding: 0, fontSize: 14, lineHeight: 1 }}
                            >
                                ×
                            </button>
                        </div>
                    ))}
                    {cart.length > 0 && (
                        <div
                            style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 16, borderBottom: '2px solid var(--color-divider)' }}
                        >
                            <span>{dict.total}</span>
                            <span>{fmt(totalCents)}</span>
                        </div>
                    )}
                    {errors.cart && <p className="field-error" style={{ margin: '8px 0 0' }}>{errors.cart}</p>}
                </div>

                {/* Contact */}
                <div style={{ padding: '20px 20px 8px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <h6 style={{ margin: 0 }}>{dict.contactDetails}</h6>
                    <div className="field">
                        <label>{dict.fullName} *</label>
                        <input className="input" value={fullName} onChange={e => setFullName(e.target.value)} autoComplete="name" />
                        {errors.fullName && <p className="field-error">{errors.fullName}</p>}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div className="field">
                            <label>
                                {dict.phone} {form.requiredMemberFields.phone ? '*' : `(${dict.optional})`}
                            </label>
                            <input className="input" value={phone} onChange={e => setPhone(e.target.value)} inputMode="tel" autoComplete="tel" />
                            {errors.phone && <p className="field-error">{errors.phone}</p>}
                        </div>
                        <div className="field">
                            <label>
                                {dict.email} {form.requiredMemberFields.email ? '*' : `(${dict.optional})`}
                            </label>
                            <input className="input" value={email} onChange={e => setEmail(e.target.value)} type="email" autoComplete="email" />
                            {errors.email && <p className="field-error">{errors.email}</p>}
                        </div>
                    </div>
                    <div className="field">
                        <label>
                            {dict.notes} ({dict.optional})
                        </label>
                        <textarea className="input" rows={2} value={notes} onChange={e => setNotes(e.target.value)} placeholder={dict.notesPlaceholder} />
                    </div>
                    {submitError && (
                        <p style={{ color: 'var(--color-accent-700)', fontSize: 13, fontWeight: 600, margin: 0 }}>{submitError}</p>
                    )}
                    <button
                        type="button"
                        className="btn btn-primary btn-block"
                        style={{ minHeight: 46 }}
                        disabled={submitting}
                        onClick={handleSubmit}
                    >
                        {submitting ? dict.submitting : `${dict.submit} — ${fmt(totalCents)}`}
                    </button>
                    <p className="text-muted" style={{ fontSize: 11, margin: '0 0 12px' }}>{dict.referenceNote}</p>
                </div>
            </div>

            {/* ══ Sticky bottom bar ══ */}
            {view === 'shop' && cart.length > 0 && (
                <div
                    style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: 'min(480px, 100vw)', zIndex: 30, background: 'var(--color-surface)', borderTop: '2px solid var(--color-divider)', padding: '10px 20px' }}
                >
                    <button
                        type="button"
                        className="btn btn-primary btn-block"
                        style={{ minHeight: 44, margin: 0, display: 'flex', justifyContent: 'space-between' }}
                        onClick={jumpToSummary}
                    >
                        <span>
                            {dict.reviewOrder} ({cartCount})
                        </span>
                        <span>{fmt(totalCents)}</span>
                    </button>
                </div>
            )}

            {/* ══ Product detail slide-in ══ */}
            <div
                ref={overlayRef}
                className="detail-overlay"
                data-open={view === 'detail'}
                aria-hidden={view !== 'detail'}
                inert={view !== 'detail'}
            >
                {detail && (
                    <>
                        <div
                            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 12px', borderBottom: '2px solid var(--color-divider)', position: 'sticky', top: 0, background: 'var(--color-bg)', zIndex: 2 }}
                        >
                            <button type="button" className="btn btn-ghost" onClick={() => setView('shop')}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M15 18l-6-6 6-6" />
                                </svg>
                                {dict.backToOrder}
                            </button>
                        </div>
                        {(() => {
                            const sel = getSelection(detail);
                            const unit = unitPrice(detail, sel.sizeLabel);
                            const thumbs = detail.images.slice(1, 3);
                            const adjustedSizes = detail.sizes.filter(s => s.priceAdjustmentCents);
                            return (
                                <div style={{ padding: '16px 20px 40px' }}>
                                    {/* Gallery */}
                                    {thumbs.length > 0 ? (
                                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 2 }}>
                                            <Photo src={detail.images[0]} alt={detail.name} aspect="3 / 4" />
                                            <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: 2 }}>
                                                {thumbs.map((src, i) => (
                                                    <Photo key={i} src={src} alt={detail.name} />
                                                ))}
                                                {thumbs.length === 1 && <div style={{ background: 'var(--color-surface)' }} />}
                                            </div>
                                        </div>
                                    ) : (
                                        <Photo src={detail.images[0]} alt={detail.name} aspect="3 / 4" />
                                    )}

                                    {/* Title + price */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10, marginTop: 16 }}>
                                        <h3 style={{ margin: 0 }}>{detail.name}</h3>
                                        <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 20, whiteSpace: 'nowrap' }}>
                                            {fmt(unit)}
                                        </span>
                                    </div>
                                    {detail.description && (
                                        <p className="text-muted" style={{ fontSize: 13, margin: '8px 0 16px' }}>{detail.description}</p>
                                    )}

                                    {/* Size */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', margin: '16px 0 8px' }}>
                                        <h6 style={{ margin: 0 }}>{dict.size}</h6>
                                        {detail.dimensions.length > 0 && (
                                            <button type="button" className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => setChartOpen(true)}>
                                                {dict.sizeChart}
                                            </button>
                                        )}
                                    </div>
                                    <div className="seg" style={{ flexWrap: 'wrap' }}>
                                        {detail.sizes.map(s => (
                                            <button
                                                key={s.label}
                                                type="button"
                                                className="seg-opt"
                                                data-selected={sel.sizeLabel === s.label}
                                                style={{ minWidth: 44, minHeight: 38 }}
                                                onClick={() => patchSelection(detail, { sizeLabel: s.label })}
                                            >
                                                {s.label}
                                            </button>
                                        ))}
                                    </div>
                                    {adjustedSizes.length > 0 && (
                                        <p className="text-muted" style={{ fontSize: 11.5, margin: '6px 0 0' }}>
                                            {adjustedSizes.map(s => `${s.label} ${dict.adds} ${fmt(s.priceAdjustmentCents!)}`).join(' · ')}
                                        </p>
                                    )}

                                    {/* Personalization */}
                                    {detail.personalization.length > 0 && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
                                            {detail.personalization.map(field => (
                                                <div className="field" key={field.key}>
                                                    <label>
                                                        {field.label} {field.required ? '*' : `(${dict.optional})`}
                                                    </label>
                                                    <input
                                                        className="input"
                                                        value={sel.personalization[field.key] ?? ''}
                                                        maxLength={field.type === 'number' ? 4 : 80}
                                                        inputMode={field.type === 'number' ? 'numeric' : 'text'}
                                                        onChange={e =>
                                                            patchSelection(detail, {
                                                                personalization: {
                                                                    ...sel.personalization,
                                                                    [field.key]:
                                                                        field.type === 'number'
                                                                            ? e.target.value.replace(/\D/g, '')
                                                                            : e.target.value,
                                                                },
                                                            })
                                                        }
                                                    />
                                                    {errors[`${detail._id}.${field.key}`] && (
                                                        <p className="field-error">{errors[`${detail._id}.${field.key}`]}</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Qty + add */}
                                    <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                                        <div className="seg">
                                            <button
                                                type="button"
                                                className="seg-opt"
                                                data-selected="false"
                                                style={{ minWidth: 40, minHeight: 44 }}
                                                onClick={() => patchSelection(detail, { quantity: Math.max(1, sel.quantity - 1) })}
                                            >
                                                −
                                            </button>
                                            <span className="seg-opt" data-selected="false" style={{ minWidth: 36, minHeight: 44, fontWeight: 700, cursor: 'default' }}>
                                                {sel.quantity}
                                            </span>
                                            <button
                                                type="button"
                                                className="seg-opt"
                                                data-selected="false"
                                                style={{ minWidth: 40, minHeight: 44 }}
                                                onClick={() => patchSelection(detail, { quantity: Math.min(10, sel.quantity + 1) })}
                                            >
                                                +
                                            </button>
                                        </div>
                                        <button
                                            type="button"
                                            className="btn btn-primary"
                                            style={{ flex: 1, minHeight: 44 }}
                                            onClick={() => addToCart(detail)}
                                        >
                                            {dict.addToOrder} — {fmt(unit * sel.quantity)}
                                        </button>
                                    </div>
                                </div>
                            );
                        })()}
                    </>
                )}
            </div>

            {/* ══ Size chart dialog ══ */}
            {chartOpen && detail && (
                <div className="dialog-backdrop" style={{ zIndex: 60 }} onClick={() => setChartOpen(false)}>
                    <div className="dialog" onClick={e => e.stopPropagation()}>
                        <span className="dialog-title">
                            {dict.sizeChart} — {detail.name}
                        </span>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>{dict.size}</th>
                                    {detail.dimensions.map(d => (
                                        <th key={d} style={{ textAlign: 'right' }}>
                                            {measurementLabel(d)} ({dict.cm})
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {detail.sizes.map(s => (
                                    <tr key={s.label}>
                                        <td style={{ fontWeight: 600 }}>{s.label}</td>
                                        {detail.dimensions.map(d => (
                                            <td key={d} style={{ textAlign: 'right' }}>
                                                {s.measurements?.[d] ?? '—'}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="dialog-actions">
                            <button type="button" className="btn btn-secondary" onClick={() => setChartOpen(false)}>
                                {dict.close}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ══ Toast ══ */}
            {toast && <div className="toast">{toast}</div>}
        </>
    );
};

export default PublicOrderForm;
