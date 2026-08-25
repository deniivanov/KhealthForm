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

const inputCls =
    'w-full border-2 border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400';

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
        <div className="p-6 max-w-5xl">
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">
                {initial ? `Редакция: ${initial.title}` : 'Нова форма'}
            </h1>

            {errors._ && <p className="mb-4 text-red-600 font-medium">{errors._}</p>}

            {/* ── Basics ── */}
            <div className="bg-white rounded-lg shadow-sm p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Отбор *</label>
                        <select value={teamId} onChange={e => setTeamId(e.target.value)} className={inputCls}>
                            {teams.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                        </select>
                        {errors.teamId && <p className="text-sm text-red-600 mt-1">{errors.teamId}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Заглавие *</label>
                        <input value={title} onChange={e => setTitle(e.target.value)} className={inputCls} placeholder="FC Example — Есен 2026" />
                        {errors.title && <p className="text-sm text-red-600 mt-1">{errors.title}</p>}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Съобщение към формата</label>
                    <textarea
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        rows={2}
                        className={inputCls}
                        placeholder="Поръчки до 15 септември. Получаване от треньора."
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Отваря се на</label>
                        <input type="datetime-local" value={opensAt} onChange={e => setOpensAt(e.target.value)} className={inputCls} />
                        {errors.opensAt && <p className="text-sm text-red-600 mt-1">{errors.opensAt}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Затваря се на</label>
                        <input type="datetime-local" value={closesAt} onChange={e => setClosesAt(e.target.value)} className={inputCls} />
                        {errors.closesAt && <p className="text-sm text-red-600 mt-1">{errors.closesAt}</p>}
                    </div>
                </div>

                <div className="flex flex-wrap gap-6">
                    <span className="text-sm font-bold text-slate-700">Задължителни данни на клиента:</span>
                    <label className="flex items-center gap-2 text-sm text-slate-700">
                        <input type="checkbox" checked disabled className="w-4 h-4" /> Име (винаги)
                    </label>
                    <label className="flex items-center gap-2 text-sm text-slate-700">
                        <input type="checkbox" checked={requirePhone} onChange={e => setRequirePhone(e.target.checked)} className="w-4 h-4" /> Телефон
                    </label>
                    <label className="flex items-center gap-2 text-sm text-slate-700">
                        <input type="checkbox" checked={requireEmail} onChange={e => setRequireEmail(e.target.checked)} className="w-4 h-4" /> Имейл
                    </label>
                </div>
            </div>

            {/* ── Selected items ── */}
            <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Продукти във формата ({items.length})</h2>
                {errors.items && <p className="text-sm text-red-600 mb-3">{errors.items}</p>}

                <div className="space-y-4">
                    {items.map((item, i) => {
                        const product = productById.get(item.productId);
                        if (!product) return null;
                        return (
                            <div key={item.productId} className="border border-slate-200 rounded-lg p-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        {product.images[0] && (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={product.images[0]} alt="" className="w-12 h-12 rounded object-cover border border-slate-200" />
                                        )}
                                        <div>
                                            <div className="font-semibold text-gray-900">{product.name}</div>
                                            <div className="text-xs text-gray-500 font-mono">{product.sku} · базова цена {formatCents(product.basePriceCents)}</div>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setItems(items.filter((_, j) => j !== i))}
                                        className="text-slate-400 hover:text-red-500"
                                        title="Премахни от формата"
                                    >
                                        ✕
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 mb-1">
                                            Цена за този отбор (€) — празно = базовата
                                        </label>
                                        <input
                                            value={item.priceOverride}
                                            onChange={e => patchItem(i, { priceOverride: e.target.value })}
                                            className="w-32 border border-slate-300 rounded px-2 py-1"
                                            placeholder={centsToEuroString(product.basePriceCents)}
                                            inputMode="decimal"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 mb-1">Предлагани размери</label>
                                        <div className="flex flex-wrap gap-1">
                                            {product.sizes.map(s => {
                                                const on = item.sizeLabels.includes(s.label);
                                                return (
                                                    <button
                                                        key={s.label}
                                                        type="button"
                                                        onClick={() => toggleSize(i, s.label)}
                                                        className={`text-xs px-2 py-1 rounded-full border ${
                                                            on
                                                                ? 'bg-yellow-400 border-yellow-500 text-slate-800 font-semibold'
                                                                : 'bg-white border-slate-300 text-slate-400'
                                                        }`}
                                                    >
                                                        {s.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-xs font-bold text-slate-600">Персонализация:</span>
                                        <button
                                            type="button"
                                            onClick={() => addPersonalization(i, { key: 'playerName', label: 'Име на гърба', type: 'text', required: false })}
                                            className="text-xs text-blue-700 hover:underline"
                                        >
                                            + име на гърба
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => addPersonalization(i, { key: 'playerNumber', label: 'Номер', type: 'number', required: false })}
                                            className="text-xs text-blue-700 hover:underline"
                                        >
                                            + номер
                                        </button>
                                        <button type="button" onClick={() => addPersonalization(i)} className="text-xs text-blue-700 hover:underline">
                                            + друго поле
                                        </button>
                                    </div>
                                    {item.personalization.length > 0 && (
                                        <div className="space-y-2">
                                            {item.personalization.map((field, fi) => (
                                                <div key={fi} className="flex flex-wrap items-center gap-2">
                                                    <input
                                                        value={field.label}
                                                        onChange={e => patchPersonalization(i, fi, { label: e.target.value })}
                                                        placeholder="Етикет (напр. Име на гърба)"
                                                        className="border border-slate-300 rounded px-2 py-1 text-sm w-52"
                                                    />
                                                    <input
                                                        value={field.key}
                                                        onChange={e => patchPersonalization(i, fi, { key: e.target.value })}
                                                        placeholder="ключ"
                                                        className="border border-slate-300 rounded px-2 py-1 text-sm w-32 font-mono"
                                                    />
                                                    <select
                                                        value={field.type}
                                                        onChange={e => patchPersonalization(i, fi, { type: e.target.value as 'text' | 'number' })}
                                                        className="border border-slate-300 rounded px-2 py-1 text-sm"
                                                    >
                                                        <option value="text">текст</option>
                                                        <option value="number">число</option>
                                                    </select>
                                                    <label className="flex items-center gap-1 text-xs text-slate-600">
                                                        <input
                                                            type="checkbox"
                                                            checked={field.required}
                                                            onChange={e => patchPersonalization(i, fi, { required: e.target.checked })}
                                                        />
                                                        задължително
                                                    </label>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            patchItem(i, { personalization: item.personalization.filter((_, j) => j !== fi) })
                                                        }
                                                        className="text-slate-400 hover:text-red-500"
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
                </div>

                {/* ── Product picker ── */}
                <div className="mt-6 border-t border-slate-200 pt-4">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Добави продукти от каталога</label>
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className={inputCls}
                        placeholder="Търсене по име, SKU, категория..."
                    />
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 max-h-72 overflow-y-auto">
                        {pickerResults.map(p => (
                            <button
                                key={p._id}
                                type="button"
                                onClick={() => addItem(p)}
                                className="flex items-center gap-3 text-left border border-slate-200 rounded-lg p-2 hover:border-yellow-400 hover:bg-yellow-50"
                            >
                                {p.images[0] && (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={p.images[0]} alt="" className="w-10 h-10 rounded object-cover" />
                                )}
                                <span>
                                    <span className="block font-medium text-gray-900">{p.name}</span>
                                    <span className="block text-xs text-gray-500 font-mono">
                                        {p.sku} · {formatCents(p.basePriceCents)}
                                    </span>
                                </span>
                            </button>
                        ))}
                        {pickerResults.length === 0 && (
                            <p className="text-sm text-gray-500 col-span-2">Няма продукти за добавяне.</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3 mt-6">
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-3 bg-yellow-400 text-slate-800 font-bold rounded-lg hover:bg-yellow-500 disabled:opacity-60"
                >
                    {saving ? 'Запазване…' : initial ? 'Запази промените' : 'Създай (чернова)'}
                </button>
                <button type="button" onClick={() => router.push('/admin/forms')} className="px-6 py-3 border border-slate-300 rounded-lg hover:bg-gray-50">
                    Отказ
                </button>
                {!initial && (
                    <p className="text-sm text-gray-500">Формата се създава като чернова — отваряш я от списъка.</p>
                )}
            </div>
        </div>
    );
};

export default FormEditor;
