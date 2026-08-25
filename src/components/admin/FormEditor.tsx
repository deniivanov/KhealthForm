'use client';
import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { centsToEuroString, formatCents } from '@/lib/money';
import { slugify } from '@/lib/slug';
import type { FormInput } from '@/lib/validate/form';
import { createForm, updateForm } from '@/app/admin/forms/actions';
import type { ActionResult } from '@/app/admin/products/actions';

export interface PickerProduct {
    _id: string;
    sku: string;
    name: string;
    category: string;
    basePriceCents: number;
    images: string[];
    sizes: Array<{ label: string }>;
    isActive: boolean;
}

export interface EditorPersonalization {
    key: string;
    label: string;
    type: 'text' | 'number';
    required: boolean;
}

export interface EditorItem {
    productId: string;
    priceOverride: string;
    sizeLabels: string[];
    personalization: EditorPersonalization[];
}

export interface SerializedFormForEdit {
    _id: string;
    teamId: string;
    title: string;
    status: string;
    message?: string;
    opensAt?: string;
    closesAt?: string;
    requiredMemberFields: { email: boolean; phone: boolean };
    items: Array<{
        productId: string;
        priceCents: number;
        sizes: Array<{ label: string }>;
        personalization: EditorPersonalization[];
    }>;
}

function toLocalInput(iso?: string): string {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** "Име на гърба" -> "imeNaGarba" */
function labelToKey(label: string): string {
    const parts = slugify(label).split('-').filter(Boolean);
    return parts.map((p, i) => (i === 0 ? p : p[0].toUpperCase() + p.slice(1))).join('') || 'field';
}

const FormEditor = ({
    teams,
    products,
    initial,
}: {
    teams: Array<{ _id: string; name: string }>;
    products: PickerProduct[];
    initial?: SerializedFormForEdit;
}) => {
    const router = useRouter();
    const productById = useMemo(() => new Map(products.map(p => [p._id, p])), [products]);

    const [teamId, setTeamId] = useState(initial?.teamId ?? teams[0]?._id ?? '');
    const [title, setTitle] = useState(initial?.title ?? '');
    const [message, setMessage] = useState(initial?.message ?? '');
    const [opensAt, setOpensAt] = useState(toLocalInput(initial?.opensAt));
    const [closesAt, setClosesAt] = useState(toLocalInput(initial?.closesAt));
    const [requireEmail, setRequireEmail] = useState(initial?.requiredMemberFields?.email ?? false);
    const [requirePhone, setRequirePhone] = useState(initial?.requiredMemberFields?.phone ?? true);

    const [items, setItems] = useState<EditorItem[]>(
        initial?.items.map(item => ({
            productId: item.productId,
            priceOverride: centsToEuroString(item.priceCents),
            sizeLabels: item.sizes.map(s => s.label),
            personalization: item.personalization ?? [],
        })) ?? []
    );

    const [search, setSearch] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);

    const selectedIds = new Set(items.map(i => i.productId));
    const pickerResults = products.filter(p => {
        if (selectedIds.has(p._id)) return false;
        if (!p.isActive) return false;
        const q = search.trim().toLowerCase();
        if (!q) return true;
        return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.category.includes(q);
    });

    const addItem = (product: PickerProduct) => {
        setItems([
            ...items,
            {
                productId: product._id,
                priceOverride: '',
                sizeLabels: product.sizes.map(s => s.label), // all offered by default
                personalization: [],
            },
        ]);
    };

    const patchItem = (index: number, patch: Partial<EditorItem>) => {
        setItems(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
    };

    const toggleSize = (index: number, label: string) => {
        const item = items[index];
        const next = item.sizeLabels.includes(label)
            ? item.sizeLabels.filter(l => l !== label)
            : [...item.sizeLabels, label];
        patchItem(index, { sizeLabels: next });
    };

    const addPersonalization = (index: number, preset?: EditorPersonalization) => {
        const item = items[index];
        patchItem(index, {
            personalization: [
                ...item.personalization,
                preset ?? { key: '', label: '', type: 'text', required: false },
            ],
        });
    };

    const patchPersonalization = (
        itemIndex: number,
        fieldIndex: number,
        patch: Partial<EditorPersonalization>
    ) => {
        const item = items[itemIndex];
        patchItem(itemIndex, {
            personalization: item.personalization.map((f, i) => {
                if (i !== fieldIndex) return f;
                const next = { ...f, ...patch };
                if (patch.label !== undefined && (!f.key || f.key === labelToKey(f.label))) {
                    next.key = labelToKey(patch.label);
                }
                return next;
            }),
        });
    };

    const handleSave = async () => {
        setSaving(true);
        setErrors({});
        const payload: FormInput = {
            teamId,
            title,
            message,
            opensAt: opensAt || null,
            closesAt: closesAt || null,
            requireEmail,
            requirePhone,
            items: items.map(item => {
                const product = productById.get(item.productId);
                const allSelected = product && item.sizeLabels.length === product.sizes.length;
                return {
                    productId: item.productId,
                    priceOverride: item.priceOverride,
                    sizeLabels: allSelected ? [] : item.sizeLabels,
                    personalization: item.personalization,
                };
            }),
        };
        let result: ActionResult;
        try {
            result = initial ? await updateForm(initial._id, payload) : await createForm(payload);
        } catch {
            setErrors({ _: 'Възникна грешка при запазването.' });
            setSaving(false);
            return;
        }
        if (result.ok) {
            router.push('/admin/forms');
            router.refresh();
        } else {
            setErrors(result.errors);
            setSaving(false);
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h6>{initial ? 'Редакция на форма' : 'Нова форма'}</h6>
                <h3 style={{ margin: 0 }}>{initial ? initial.title : 'Създаване на форма'}</h3>
            </div>

            {errors._ && <p className="field-error" style={{ fontSize: 13 }}>{errors._}</p>}

            {/* ── 1 · Basics ── */}
            <div className="panel">
                <div className="panel-head">
                    <h6>1 · Основни данни</h6>
                </div>
                <div className="flex flex-col gap-4" style={{ padding: 16 }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="field">
                            <label>Отбор *</label>
                            <select value={teamId} onChange={e => setTeamId(e.target.value)} className="input">
                                {teams.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                            </select>
                            {errors.teamId && <p className="field-error">{errors.teamId}</p>}
                        </div>
                        <div className="field">
                            <label>Заглавие *</label>
                            <input value={title} onChange={e => setTitle(e.target.value)} className="input" placeholder="FC Example — Есен 2026" />
                            {errors.title && <p className="field-error">{errors.title}</p>}
                        </div>
                    </div>

                    <div className="field">
                        <label>Съобщение към формата</label>
                        <textarea
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            rows={2}
                            className="input"
                            placeholder="Поръчки до 15 септември. Получаване от треньора."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="field">
                            <label>Отваря се на</label>
                            <input type="datetime-local" value={opensAt} onChange={e => setOpensAt(e.target.value)} className="input" />
                            {errors.opensAt && <p className="field-error">{errors.opensAt}</p>}
                        </div>
                        <div className="field">
                            <label>Затваря се на</label>
                            <input type="datetime-local" value={closesAt} onChange={e => setClosesAt(e.target.value)} className="input" />
                            {errors.closesAt && <p className="field-error">{errors.closesAt}</p>}
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        <span className="text-muted" style={{ fontSize: 12 }}>Задължителни данни на клиента:</span>
                        <label className="flex items-center gap-2" style={{ fontSize: 13 }}>
                            <input type="checkbox" checked disabled style={{ accentColor: 'var(--color-accent)' }} /> Име (винаги)
                        </label>
                        <label className="flex items-center gap-2" style={{ fontSize: 13, cursor: 'pointer' }}>
                            <input type="checkbox" checked={requirePhone} onChange={e => setRequirePhone(e.target.checked)} style={{ accentColor: 'var(--color-accent)' }} /> Телефон
                        </label>
                        <label className="flex items-center gap-2" style={{ fontSize: 13, cursor: 'pointer' }}>
                            <input type="checkbox" checked={requireEmail} onChange={e => setRequireEmail(e.target.checked)} style={{ accentColor: 'var(--color-accent)' }} /> Имейл
                        </label>
                    </div>
                </div>
            </div>

            {/* ── 2 · Products ── */}
            <div className="panel">
                <div className="panel-head">
                    <h6>2 · Продукти</h6>
                    <span className="text-muted" style={{ fontSize: 12 }}>{items.length} във формата</span>
                </div>
                <div className="flex flex-col gap-4" style={{ padding: 16 }}>
                    {errors.items && <p className="field-error">{errors.items}</p>}

                    {items.map((item, i) => {
                        const product = productById.get(item.productId);
                        if (!product) return null;
                        return (
                            <div key={item.productId} style={{ border: '1px solid var(--color-divider)', padding: 14 }}>
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        {product.images[0] && (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={product.images[0]}
                                                alt=""
                                                style={{ width: 48, height: 48, objectFit: 'cover', border: '1px solid var(--color-divider)' }}
                                            />
                                        )}
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: 14 }}>{product.name}</div>
                                            <div className="text-muted" style={{ fontSize: 11, fontFamily: 'monospace' }}>
                                                {product.sku} · базова цена {formatCents(product.basePriceCents)}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setItems(items.filter((_, j) => j !== i))}
                                        className="btn btn-ghost"
                                        style={{ fontSize: 13, padding: '2px 6px' }}
                                        title="Премахни от формата"
                                    >
                                        ✕
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{ marginTop: 14 }}>
                                    <div className="field">
                                        <label>Цена за този отбор (€) — празно = базовата</label>
                                        <input
                                            value={item.priceOverride}
                                            onChange={e => patchItem(i, { priceOverride: e.target.value })}
                                            className="input"
                                            style={{ width: 128 }}
                                            placeholder={centsToEuroString(product.basePriceCents)}
                                            inputMode="decimal"
                                        />
                                    </div>
                                    <div className="field">
                                        <label>Предлагани размери</label>
                                        <div className="flex flex-wrap gap-1">
                                            {product.sizes.map(s => {
                                                const on = item.sizeLabels.includes(s.label);
                                                return (
                                                    <button
                                                        key={s.label}
                                                        type="button"
                                                        onClick={() => toggleSize(i, s.label)}
                                                        data-selected={on}
                                                        style={{
                                                            font: 'inherit',
                                                            fontSize: 12,
                                                            padding: '4px 10px',
                                                            cursor: 'pointer',
                                                            border: on
                                                                ? '1px solid var(--color-accent)'
                                                                : '1px solid var(--color-divider)',
                                                            background: on ? 'var(--color-accent)' : 'transparent',
                                                            color: on
                                                                ? 'var(--color-text)'
                                                                : 'color-mix(in srgb, var(--color-text) 55%, transparent)',
                                                            fontWeight: on ? 600 : 400,
                                                        }}
                                                    >
                                                        {s.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ marginTop: 12 }}>
                                    <div className="flex flex-wrap items-center gap-2" style={{ marginBottom: 8 }}>
                                        <span className="text-muted" style={{ fontSize: 12 }}>Персонализация:</span>
                                        <button
                                            type="button"
                                            onClick={() => addPersonalization(i, { key: 'playerName', label: 'Име на гърба', type: 'text', required: false })}
                                            className="btn btn-ghost"
                                            style={{ fontSize: 12, fontWeight: 600 }}
                                        >
                                            + име на гърба
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => addPersonalization(i, { key: 'playerNumber', label: 'Номер', type: 'number', required: false })}
                                            className="btn btn-ghost"
                                            style={{ fontSize: 12, fontWeight: 600 }}
                                        >
                                            + номер
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => addPersonalization(i)}
                                            className="btn btn-ghost"
                                            style={{ fontSize: 12, fontWeight: 600 }}
                                        >
                                            + друго поле
                                        </button>
                                    </div>
                                    {item.personalization.length > 0 && (
                                        <div className="flex flex-col gap-2">
                                            {item.personalization.map((field, fi) => (
                                                <div key={fi} className="flex flex-wrap items-center gap-2">
                                                    <input
                                                        value={field.label}
                                                        onChange={e => patchPersonalization(i, fi, { label: e.target.value })}
                                                        placeholder="Етикет (напр. Име на гърба)"
                                                        className="input"
                                                        style={{ width: 208 }}
                                                    />
                                                    <input
                                                        value={field.key}
                                                        onChange={e => patchPersonalization(i, fi, { key: e.target.value })}
                                                        placeholder="ключ"
                                                        className="input"
                                                        style={{ width: 128, fontFamily: 'monospace' }}
                                                    />
                                                    <select
                                                        value={field.type}
                                                        onChange={e => patchPersonalization(i, fi, { type: e.target.value as 'text' | 'number' })}
                                                        className="input"
                                                        style={{ width: 110 }}
                                                    >
                                                        <option value="text">текст</option>
                                                        <option value="number">число</option>
                                                    </select>
                                                    <label className="flex items-center gap-1 text-muted" style={{ fontSize: 12, cursor: 'pointer' }}>
                                                        <input
                                                            type="checkbox"
                                                            checked={field.required}
                                                            onChange={e => patchPersonalization(i, fi, { required: e.target.checked })}
                                                            style={{ accentColor: 'var(--color-accent)' }}
                                                        />
                                                        задължително
                                                    </label>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            patchItem(i, { personalization: item.personalization.filter((_, j) => j !== fi) })
                                                        }
                                                        className="btn btn-ghost"
                                                        style={{ fontSize: 13, padding: '2px 6px' }}
                                                        title="Премахни полето"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {/* ── Product picker ── */}
                    <div style={{ borderTop: '2px solid var(--color-divider)', paddingTop: 14 }}>
                        <div className="field">
                            <label>Добави продукти от каталога</label>
                            <input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="input"
                                placeholder="Търсене по име, SKU, категория…"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-72 overflow-y-auto" style={{ marginTop: 10 }}>
                            {pickerResults.map(p => (
                                <button
                                    key={p._id}
                                    type="button"
                                    onClick={() => addItem(p)}
                                    className="flex items-center gap-3 text-left"
                                    style={{
                                        font: 'inherit',
                                        cursor: 'pointer',
                                        border: '1px solid var(--color-divider)',
                                        background: 'transparent',
                                        padding: 8,
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-surface)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                                >
                                    {p.images[0] && (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={p.images[0]} alt="" style={{ width: 40, height: 40, objectFit: 'cover' }} />
                                    )}
                                    <span>
                                        <span className="block" style={{ fontWeight: 600, fontSize: 13 }}>{p.name}</span>
                                        <span className="block text-muted" style={{ fontSize: 11, fontFamily: 'monospace' }}>
                                            {p.sku} · {formatCents(p.basePriceCents)}
                                        </span>
                                    </span>
                                </button>
                            ))}
                            {pickerResults.length === 0 && (
                                <p className="text-muted col-span-2" style={{ fontSize: 13, margin: 0 }}>Няма продукти за добавяне.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Save ── */}
            <div className="flex flex-wrap items-center gap-3">
                <button type="button" onClick={handleSave} disabled={saving} className="btn btn-primary">
                    {saving ? 'Запазване…' : initial ? 'Запази промените' : 'Създай (чернова)'}
                </button>
                <button type="button" onClick={() => router.push('/admin/forms')} className="btn btn-secondary">
                    Отказ
                </button>
                {!initial && (
                    <p className="text-muted" style={{ fontSize: 13, margin: 0 }}>
                        Формата се създава като чернова — отваряте я от списъка, когато е готова.
                    </p>
                )}
            </div>
        </div>
    );
};

export default FormEditor;
