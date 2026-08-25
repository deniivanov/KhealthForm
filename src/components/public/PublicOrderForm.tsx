'use client';
import React, { useMemo, useState } from 'react';
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

const PublicOrderForm = ({
    team,
    form,
    locale,
    dict,
}: {
    team: PublicTeamData;
    form: PublicFormData;
    locale: Locale;
    dict: Dictionary;
}) => {
    const [selections, setSelections] = useState<Record<string, ItemSelection>>({});
    const [cart, setCart] = useState<CartLine[]>([]);
    const [chartItem, setChartItem] = useState<PublicFormItem | null>(null);
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [notes, setNotes] = useState('');
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [submitError, setSubmitError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState<{ reference: string; totalCents: number } | null>(null);
    const [toast, setToast] = useState('');

    const totalCents = useMemo(
        () => cart.reduce((sum, l) => sum + l.unitPriceCents * l.quantity, 0),
        [cart]
    );

    const getSelection = (item: PublicFormItem): ItemSelection =>
        selections[item._id] ?? { sizeLabel: item.sizes[0]?.label ?? '', quantity: 1, personalization: {} };

    const patchSelection = (item: PublicFormItem, patch: Partial<ItemSelection>) => {
        setSelections(prev => ({ ...prev, [item._id]: { ...getSelection(item), ...patch } }));
    };

    const addToCart = (item: PublicFormItem) => {
        const sel = getSelection(item);
        const errors: Record<string, string> = {};
        for (const field of item.personalization) {
            if (field.required && !(sel.personalization[field.key] ?? '').trim()) {
                errors[`${item._id}.${field.key}`] = dict.errRequired;
            }
        }
        setFieldErrors(prev => {
            const next = { ...prev };
            for (const k of Object.keys(next)) if (k.startsWith(`${item._id}.`)) delete next[k];
            return { ...next, ...errors };
        });
        if (Object.keys(errors).length > 0) return;

        const personalization = Object.fromEntries(
            Object.entries(sel.personalization)
                .map(([k, v]) => [k, v.trim()])
                .filter(([, v]) => v)
        );

        setCart(prev => {
            const samePers = (a: Record<string, string>, b: Record<string, string>) =>
                JSON.stringify(a) === JSON.stringify(b);
            const idx = prev.findIndex(
                l =>
                    l.formItemId === item._id &&
                    l.sizeLabel === sel.sizeLabel &&
                    samePers(l.personalization, personalization)
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
        patchSelection(item, { personalization: {} });
        setToast(`${item.name} · ${sel.sizeLabel} × ${sel.quantity} ${dict.added}`);
        setTimeout(() => setToast(''), 2000);
    };

    const handleSubmit = async () => {
        const errors: Record<string, string> = {};
        if (!fullName.trim()) errors.fullName = dict.errName;
        if (form.requiredMemberFields.phone && !phone.trim()) errors.phone = dict.errPhone;
        if (form.requiredMemberFields.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) {
            errors.email = dict.errEmail;
        }
        if (email.trim() && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) errors.email = dict.errEmail;
        if (cart.length === 0) errors.cart = dict.errCartEmpty;
        setFieldErrors(errors);
        setSubmitError('');
        if (Object.keys(errors).length > 0) return;

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
            setSuccess({ reference: result.reference, totalCents: result.totalCents });
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
            <div className="max-w-lg mx-auto p-6 pt-16">
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 text-center">
                    <div
                        className="w-16 h-16 mx-auto rounded-full flex items-center justify-center text-white text-3xl mb-4"
                        style={{ backgroundColor: 'var(--brand)' }}
                    >
                        ✓
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800 mb-1">{dict.orderReceived}</h1>
                    <p className="text-slate-600 mb-6">
                        {dict.thankYou}, <strong>{fullName}</strong>!
                    </p>
                    <div className="rounded-xl bg-slate-100 p-4 mb-2">
                        <p className="text-sm text-slate-500">{dict.reference}</p>
                        <p className="font-mono text-xl font-bold text-slate-800">{success.reference}</p>
                    </div>
                    <p className="text-sm text-slate-500 mb-1">{dict.keepReference}</p>
                    <p className="font-semibold text-slate-700 mb-6">
                        {dict.total}: {formatCents(success.totalCents, locale === 'bg' ? 'bg-BG' : 'en-IE')}
                    </p>
                    <button
                        onClick={() => {
                            setSuccess(null);
                            setCart([]);
                            setNotes('');
                        }}
                        className="px-6 py-3 rounded-xl font-bold text-slate-800"
                        style={{ backgroundColor: 'var(--brand-2)' }}
                    >
                        {dict.newOrder}
                    </button>
                </div>
            </div>
        );
    }

    const fmt = (cents: number) => formatCents(cents, locale === 'bg' ? 'bg-BG' : 'en-IE');

    return (
        <div className="max-w-5xl mx-auto p-4 sm:p-6 pb-40">
            {/* ── Header ── */}
            <header className="text-center py-6">
                {team.logoUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={team.logoUrl}
                        alt={team.name}
                        className="w-20 h-20 rounded-full object-cover mx-auto mb-3 border-4"
                        style={{ borderColor: 'var(--brand)' }}
                    />
                )}
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800">{team.name}</h1>
                <p className="text-lg font-semibold text-slate-600 mt-1">{form.title}</p>
                {form.message && (
                    <p className="max-w-xl mx-auto mt-3 text-sm text-slate-600 bg-white border border-slate-200 rounded-xl px-4 py-3">
                        {form.message}
                    </p>
                )}
                {form.closesAt && (
                    <p className="mt-2 text-sm font-semibold" style={{ color: 'var(--brand)' }}>
                        {dict.deadline}: {new Date(form.closesAt).toLocaleDateString(locale === 'bg' ? 'bg-BG' : 'en-GB')}
                    </p>
                )}
            </header>

            {/* ── Product cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {form.items.map(item => {
                    const sel = getSelection(item);
                    return (
                        <div key={item._id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                            {item.images[0] && (
                                <div className="bg-slate-100 aspect-square">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                                </div>
                            )}
                            <div className="p-4 flex flex-col gap-3 flex-1">
                                <div className="flex items-start justify-between gap-2">
                                    <h3 className="font-bold text-slate-800">{item.name}</h3>
                                    <span className="font-bold whitespace-nowrap" style={{ color: 'var(--brand)' }}>
                                        {fmt(unitPrice(item, sel.sizeLabel))}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 mb-1">{dict.size}</label>
                                        <select
                                            value={sel.sizeLabel}
                                            onChange={e => patchSelection(item, { sizeLabel: e.target.value })}
                                            className="w-full border-2 border-slate-300 rounded-lg px-2 py-2 text-sm font-semibold text-slate-800"
                                        >
                                            {item.sizes.map(s => (
                                                <option key={s.label} value={s.label}>
                                                    {s.label}
                                                    {s.priceAdjustmentCents ? ` (+${fmt(s.priceAdjustmentCents)})` : ''}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 mb-1">{dict.quantity}</label>
                                        <select
                                            value={sel.quantity}
                                            onChange={e => patchSelection(item, { quantity: parseInt(e.target.value, 10) })}
                                            className="w-full border-2 border-slate-300 rounded-lg px-2 py-2 text-sm font-semibold text-slate-800"
                                        >
                                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                                                <option key={n} value={n}>{n}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {item.dimensions.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => setChartItem(item)}
                                        className="text-sm font-semibold underline text-left"
                                        style={{ color: 'var(--brand)' }}
                                    >
                                        📏 {dict.sizeChart}
                                    </button>
                                )}

                                {item.personalization.map(field => (
                                    <div key={field.key}>
                                        <label className="block text-xs font-bold text-slate-600 mb-1">
                                            {field.label}
                                            {!field.required && <span className="font-normal text-slate-400"> ({dict.optional})</span>}
                                        </label>
                                        <input
                                            value={sel.personalization[field.key] ?? ''}
                                            onChange={e =>
                                                patchSelection(item, {
                                                    personalization: { ...sel.personalization, [field.key]: e.target.value },
                                                })
                                            }
                                            inputMode={field.type === 'number' ? 'numeric' : 'text'}
                                            maxLength={field.type === 'number' ? 4 : 80}
                                            className="w-full border-2 border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800"
                                        />
                                        {fieldErrors[`${item._id}.${field.key}`] && (
                                            <p className="text-xs text-red-600 mt-1">{fieldErrors[`${item._id}.${field.key}`]}</p>
                                        )}
                                    </div>
                                ))}

                                <button
                                    type="button"
                                    onClick={() => addToCart(item)}
                                    className="mt-auto w-full py-2.5 rounded-xl font-bold text-slate-800 hover:opacity-90 transition-opacity"
                                    style={{ backgroundColor: 'var(--brand-2)' }}
                                >
                                    {dict.addToOrder}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* ── Cart + contact ── */}
            <div id="order-summary" className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 mt-6">
                <h2 className="text-xl font-bold text-slate-800 border-b-4 pb-2 mb-4" style={{ borderColor: 'var(--brand)' }}>
                    {dict.orderSummary}
                </h2>

                {cart.length === 0 ? (
                    <p className="text-slate-500 text-sm">{dict.emptyCart}</p>
                ) : (
                    <div className="space-y-2">
                        {cart.map((line, i) => (
                            <div key={i} className="flex items-center justify-between gap-2 bg-slate-50 rounded-lg px-3 py-2">
                                <div className="text-sm text-slate-700">
                                    <span className="font-semibold">{line.productName}</span> — {line.sizeLabel} × {line.quantity}
                                    {Object.entries(line.personalization).length > 0 && (
                                        <span className="block text-xs text-slate-500">
                                            {Object.values(line.personalization).join(' · ')}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 whitespace-nowrap">
                                    <span className="text-sm font-semibold text-slate-800">{fmt(line.unitPriceCents * line.quantity)}</span>
                                    <button
                                        type="button"
                                        onClick={() => setCart(cart.filter((_, j) => j !== i))}
                                        className="text-slate-400 hover:text-red-500"
                                        title={dict.remove}
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>
                        ))}
                        <div className="flex justify-between items-center pt-3 text-lg font-bold text-slate-800">
                            <span>{dict.total}:</span>
                            <span>{fmt(totalCents)}</span>
                        </div>
                    </div>
                )}
                {fieldErrors.cart && <p className="text-sm text-red-600 mt-2">{fieldErrors.cart}</p>}

                <h3 className="text-lg font-bold text-slate-800 mt-6 mb-3">{dict.contactDetails}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">{dict.fullName} *</label>
                        <input
                            value={fullName}
                            onChange={e => setFullName(e.target.value)}
                            className="w-full border-2 border-slate-300 rounded-lg px-3 py-2.5 text-slate-800"
                            autoComplete="name"
                        />
                        {fieldErrors.fullName && <p className="text-xs text-red-600 mt-1">{fieldErrors.fullName}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">
                            {dict.phone} {form.requiredMemberFields.phone ? '*' : `(${dict.optional})`}
                        </label>
                        <input
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                            className="w-full border-2 border-slate-300 rounded-lg px-3 py-2.5 text-slate-800"
                            inputMode="tel"
                            autoComplete="tel"
                        />
                        {fieldErrors.phone && <p className="text-xs text-red-600 mt-1">{fieldErrors.phone}</p>}
                    </div>
                    <div className="sm:col-span-2">
                        <label className="block text-sm font-bold text-slate-700 mb-1">
                            {dict.email} {form.requiredMemberFields.email ? '*' : `(${dict.optional})`}
                        </label>
                        <input
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="w-full border-2 border-slate-300 rounded-lg px-3 py-2.5 text-slate-800"
                            type="email"
                            autoComplete="email"
                        />
                        {fieldErrors.email && <p className="text-xs text-red-600 mt-1">{fieldErrors.email}</p>}
                    </div>
                    <div className="sm:col-span-2">
                        <label className="block text-sm font-bold text-slate-700 mb-1">
                            {dict.notes} ({dict.optional})
                        </label>
                        <textarea
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            rows={2}
                            placeholder={dict.notesPlaceholder}
                            className="w-full border-2 border-slate-300 rounded-lg px-3 py-2.5 text-slate-800"
                        />
                    </div>
                </div>

                {submitError && <p className="text-red-600 font-medium mt-4">{submitError}</p>}

                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="mt-5 w-full py-3.5 rounded-xl font-bold text-lg text-slate-800 hover:opacity-90 disabled:opacity-60 transition-opacity"
                    style={{ backgroundColor: 'var(--brand-2)' }}
                >
                    {submitting ? dict.submitting : dict.submit}
                </button>
            </div>

            {/* ── Sticky total bar (mobile) ── */}
            {cart.length > 0 && (
                <div className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 shadow-lg p-3 sm:hidden">
                    <a
                        href="#order-summary"
                        className="flex items-center justify-between px-4 py-2.5 rounded-xl font-bold text-slate-800"
                        style={{ backgroundColor: 'var(--brand-2)' }}
                    >
                        <span>{dict.orderSummary} ({cart.reduce((n, l) => n + l.quantity, 0)})</span>
                        <span>{fmt(totalCents)}</span>
                    </a>
                </div>
            )}

            {/* ── Size chart modal ── */}
            {chartItem && (
                <div
                    className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center"
                    onClick={() => setChartItem(null)}
                >
                    <div
                        className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl p-5 max-h-[80vh] overflow-y-auto"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-bold text-slate-800">
                                {dict.sizeChart} — {chartItem.name}
                            </h3>
                            <button onClick={() => setChartItem(null)} className="text-slate-400 hover:text-slate-700 text-xl px-2">
                                ✕
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b-2" style={{ borderColor: 'var(--brand)' }}>
                                        <th className="text-left py-2 pr-3 font-bold text-slate-700">{dict.size}</th>
                                        {chartItem.dimensions.map(d => (
                                            <th key={d} className="text-right py-2 px-3 font-bold text-slate-700 whitespace-nowrap">
                                                {measurementLabel(d)} ({dict.cm})
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {chartItem.sizes.map(s => (
                                        <tr key={s.label} className="border-b border-slate-100">
                                            <td className="py-2 pr-3 font-semibold text-slate-800">{s.label}</td>
                                            {chartItem.dimensions.map(d => (
                                                <td key={d} className="py-2 px-3 text-right text-slate-600">
                                                    {s.measurements?.[d] ?? '—'}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <button
                            onClick={() => setChartItem(null)}
                            className="mt-4 w-full py-2.5 rounded-xl font-bold text-slate-800"
                            style={{ backgroundColor: 'var(--brand-2)' }}
                        >
                            {dict.close}
                        </button>
                    </div>
                </div>
            )}

            {/* ── Toast ── */}
            {toast && (
                <div className="fixed bottom-20 sm:bottom-6 right-4 left-4 sm:left-auto bg-slate-800 text-white text-sm px-4 py-3 rounded-xl shadow-lg z-40">
                    {toast}
                </div>
            )}
        </div>
    );
};

export default PublicOrderForm;
