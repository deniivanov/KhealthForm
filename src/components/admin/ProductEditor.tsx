'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PRODUCT_CATEGORIES } from '@/models/Product';
import { centsToEuroString } from '@/lib/money';
import type { ProductInput } from '@/lib/validate/product';
import { createProduct, updateProduct, setProductActive, type ActionResult } from '@/app/admin/products/actions';

export interface SerializedProduct {
    _id: string;
    sku: string;
    name: string;
    description?: string;
    category: string;
    images: string[];
    basePriceCents: number;
    dimensions: string[];
    sizes: Array<{ label: string; measurements: Record<string, number>; priceAdjustmentCents?: number }>;
    isActive: boolean;
}

interface SizeRow {
    label: string;
    measurements: Record<string, string>;
    priceAdjustment: string;
}

/** Suggested measurement columns with BG labels; free-typed keys also work. */
export const DIMENSION_LABELS: Record<string, string> = {
    chestWidth: 'Гръдна обиколка (ширина)',
    length: 'Дължина',
    sleeveLength: 'Ръкав',
    shoulderWidth: 'Рамо',
    waist: 'Талия',
    hip: 'Ханш',
    inseam: 'Вътрешен крачол',
};

export function dimensionLabel(key: string): string {
    return DIMENSION_LABELS[key] || key;
}

const inputCls =
    'w-full border-2 border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400';

const ProductEditor = ({ initial }: { initial?: SerializedProduct }) => {
    const router = useRouter();
    const [sku, setSku] = useState(initial?.sku ?? '');
    const [name, setName] = useState(initial?.name ?? '');
    const [description, setDescription] = useState(initial?.description ?? '');
    const [category, setCategory] = useState(initial?.category ?? 't-shirt');
    const [images, setImages] = useState<string[]>(initial?.images?.length ? initial.images : ['']);
    const [basePrice, setBasePrice] = useState(initial ? centsToEuroString(initial.basePriceCents) : '');
    const [isActive, setIsActive] = useState(initial?.isActive ?? true);

    const [dimensions, setDimensions] = useState<string[]>(initial?.dimensions ?? ['chestWidth', 'length']);
    const [newDimension, setNewDimension] = useState('');
    const [sizes, setSizes] = useState<SizeRow[]>(
        initial?.sizes?.map(s => ({
            label: s.label,
            measurements: Object.fromEntries(Object.entries(s.measurements ?? {}).map(([k, v]) => [k, String(v)])),
            priceAdjustment: s.priceAdjustmentCents ? centsToEuroString(s.priceAdjustmentCents) : '',
        })) ?? []
    );

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);

    // ── size-chart grid operations ─────────────────────────────────────────
    const addDimension = () => {
        const key = newDimension.trim();
        if (!key || dimensions.includes(key)) return;
        setDimensions([...dimensions, key]);
        setNewDimension('');
    };

    const removeDimension = (key: string) => {
        setDimensions(dimensions.filter(d => d !== key));
        setSizes(sizes.map(row => {
            const { [key]: _removed, ...rest } = row.measurements;
            return { ...row, measurements: rest };
        }));
    };

    const addSizeRow = (label = '') => {
        setSizes([...sizes, { label, measurements: {}, priceAdjustment: '' }]);
    };

    const removeSizeRow = (index: number) => {
        setSizes(sizes.filter((_, i) => i !== index));
    };

    const moveSizeRow = (index: number, delta: -1 | 1) => {
        const target = index + delta;
        if (target < 0 || target >= sizes.length) return;
        const next = [...sizes];
        [next[index], next[target]] = [next[target], next[index]];
        setSizes(next);
    };

    const setSizeField = (index: number, patch: Partial<SizeRow>) => {
        setSizes(sizes.map((row, i) => (i === index ? { ...row, ...patch } : row)));
    };

    const setMeasurement = (index: number, dim: string, value: string) => {
        setSizes(sizes.map((row, i) =>
            i === index ? { ...row, measurements: { ...row.measurements, [dim]: value } } : row
        ));
    };

    const QUICK_ADULT = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];
    const QUICK_KIDS = ['104', '116', '128', '140', '152', '164'];

    const addQuickSizes = (labels: string[]) => {
        const existing = new Set(sizes.map(s => s.label));
        const toAdd = labels.filter(l => !existing.has(l));
        setSizes([...sizes, ...toAdd.map(label => ({ label, measurements: {}, priceAdjustment: '' }))]);
    };

    // ── save ───────────────────────────────────────────────────────────────
    const handleSave = async () => {
        setSaving(true);
        setErrors({});
        const payload: ProductInput = {
            sku,
            name,
            description,
            category,
            images: images.filter(u => u.trim()),
            basePrice,
            dimensions,
            sizes: sizes.map(row => ({
                label: row.label,
                measurements: row.measurements,
                priceAdjustment: row.priceAdjustment,
            })),
            isActive,
        };
        let result: ActionResult;
        try {
            result = initial
                ? await updateProduct(initial._id, payload)
                : await createProduct(payload);
        } catch {
            setErrors({ _: 'Възникна грешка при запазването.' });
            setSaving(false);
            return;
        }
        if (result.ok) {
            router.push('/admin/products');
            router.refresh();
        } else {
            setErrors(result.errors);
            setSaving(false);
        }
    };

    const handleArchiveToggle = async () => {
        if (!initial) return;
        setSaving(true);
        await setProductActive(initial._id, !isActive);
        setIsActive(!isActive);
        setSaving(false);
        router.refresh();
    };

    return (
        <div className="p-6 max-w-5xl">
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">
                {initial ? `Редакция: ${initial.name}` : 'Нов продукт'}
            </h1>

            {errors._ && <p className="mb-4 text-red-600 font-medium">{errors._}</p>}

            <div className="bg-white rounded-lg shadow-sm p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">SKU *</label>
                        <input value={sku} onChange={e => setSku(e.target.value.toUpperCase())} className={inputCls} placeholder="TS-CLASSIC" />
                        {errors.sku && <p className="text-sm text-red-600 mt-1">{errors.sku}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Категория *</label>
                        <div className="flex gap-2">
                            <select
                                value={PRODUCT_CATEGORIES.includes(category as never) ? category : '__custom'}
                                onChange={e => { if (e.target.value !== '__custom') setCategory(e.target.value); }}
                                className={inputCls}
                            >
                                {PRODUCT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                <option value="__custom">друга…</option>
                            </select>
                            {!PRODUCT_CATEGORIES.includes(category as never) && (
                                <input value={category} onChange={e => setCategory(e.target.value)} className={inputCls} placeholder="категория" />
                            )}
                        </div>
                        {errors.category && <p className="text-sm text-red-600 mt-1">{errors.category}</p>}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Име *</label>
                    <input value={name} onChange={e => setName(e.target.value)} className={inputCls} />
                    {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Описание</label>
                    <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className={inputCls} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Базова цена (EUR) *</label>
                        <input value={basePrice} onChange={e => setBasePrice(e.target.value)} className={inputCls} placeholder="18.00" inputMode="decimal" />
                        {errors.basePrice && <p className="text-sm text-red-600 mt-1">{errors.basePrice}</p>}
                    </div>
                    <div className="flex items-end pb-2">
                        <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                            <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="w-4 h-4" />
                            Активен (вижда се при създаване на форми)
                        </label>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Снимки (URL адреси)</label>
                    <div className="space-y-2">
                        {images.map((url, i) => (
                            <div key={i} className="flex gap-2">
                                <input
                                    value={url}
                                    onChange={e => setImages(images.map((u, j) => (j === i ? e.target.value : u)))}
                                    className={inputCls}
                                    placeholder="https://..."
                                />
                                <button
                                    type="button"
                                    onClick={() => setImages(images.filter((_, j) => j !== i))}
                                    className="px-3 text-slate-400 hover:text-red-500"
                                    title="Премахни"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                        <button type="button" onClick={() => setImages([...images, ''])} className="text-sm text-blue-700 hover:underline">
                            + Добави снимка
                        </button>
                        {errors.images && <p className="text-sm text-red-600">{errors.images}</p>}
                    </div>
                </div>
            </div>

            {/* ── Size chart editor ── */}
            <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Таблица с размери</h2>
                <p className="text-sm text-gray-600 mb-4">
                    Колоните са измерения (в см), редовете са размери. Празни клетки са позволени.
                </p>

                <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className="text-sm font-bold text-slate-700">Измерения:</span>
                    {dimensions.map(d => (
                        <span key={d} className="inline-flex items-center gap-1 bg-slate-100 text-slate-800 text-sm px-3 py-1 rounded-full">
                            {dimensionLabel(d)}
                            <button type="button" onClick={() => removeDimension(d)} className="text-slate-400 hover:text-red-500" title="Премахни колоната">
                                ✕
                            </button>
                        </span>
                    ))}
                    <select
                        value=""
                        onChange={e => { if (e.target.value) { setNewDimension(''); setDimensions(prev => prev.includes(e.target.value) ? prev : [...prev, e.target.value]); } }}
                        className="border-2 border-slate-300 rounded-lg px-2 py-1 text-sm text-slate-700"
                    >
                        <option value="">+ колона…</option>
                        {Object.entries(DIMENSION_LABELS).filter(([k]) => !dimensions.includes(k)).map(([k, label]) => (
                            <option key={k} value={k}>{label}</option>
                        ))}
                    </select>
                    <input
                        value={newDimension}
                        onChange={e => setNewDimension(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addDimension(); } }}
                        placeholder="друг ключ (латиница)"
                        className="border-2 border-slate-300 rounded-lg px-2 py-1 text-sm w-44"
                    />
                    <button type="button" onClick={addDimension} className="text-sm text-blue-700 hover:underline">добави</button>
                </div>
                {errors.dimensions && <p className="text-sm text-red-600 mb-2">{errors.dimensions}</p>}

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200 text-left">
                                <th className="py-2 px-3 font-medium w-8"></th>
                                <th className="py-2 px-3 font-medium">Размер</th>
                                {dimensions.map(d => (
                                    <th key={d} className="py-2 px-3 font-medium whitespace-nowrap">{dimensionLabel(d)} (см)</th>
                                ))}
                                <th className="py-2 px-3 font-medium whitespace-nowrap">Корекция на цена (€)</th>
                                <th className="py-2 px-3 w-8"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {sizes.map((row, i) => (
                                <tr key={i} className="border-b border-gray-100">
                                    <td className="py-1 px-1 whitespace-nowrap">
                                        <button type="button" onClick={() => moveSizeRow(i, -1)} className="text-slate-400 hover:text-slate-700 px-1" title="Нагоре">↑</button>
                                        <button type="button" onClick={() => moveSizeRow(i, 1)} className="text-slate-400 hover:text-slate-700 px-1" title="Надолу">↓</button>
                                    </td>
                                    <td className="py-1 px-2">
                                        <input
                                            value={row.label}
                                            onChange={e => setSizeField(i, { label: e.target.value })}
                                            className="w-24 border border-slate-300 rounded px-2 py-1 font-semibold"
                                            placeholder="M"
                                        />
                                    </td>
                                    {dimensions.map(d => (
                                        <td key={d} className="py-1 px-2">
                                            <input
                                                value={row.measurements[d] ?? ''}
                                                onChange={e => setMeasurement(i, d, e.target.value)}
                                                className="w-20 border border-slate-300 rounded px-2 py-1"
                                                inputMode="decimal"
                                            />
                                        </td>
                                    ))}
                                    <td className="py-1 px-2">
                                        <input
                                            value={row.priceAdjustment}
                                            onChange={e => setSizeField(i, { priceAdjustment: e.target.value })}
                                            className="w-24 border border-slate-300 rounded px-2 py-1"
                                            placeholder="+2.00"
                                            inputMode="decimal"
                                        />
                                    </td>
                                    <td className="py-1 px-2">
                                        <button type="button" onClick={() => removeSizeRow(i)} className="text-slate-400 hover:text-red-500" title="Премахни реда">✕</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex flex-wrap items-center gap-3 mt-3">
                    <button type="button" onClick={() => addSizeRow()} className="text-sm text-blue-700 hover:underline">+ Добави размер</button>
                    <span className="text-slate-300">|</span>
                    <button type="button" onClick={() => addQuickSizes(QUICK_ADULT)} className="text-sm text-slate-600 hover:underline">+ възрастни ({QUICK_ADULT.join(', ')})</button>
                    <button type="button" onClick={() => addQuickSizes(QUICK_KIDS)} className="text-sm text-slate-600 hover:underline">+ детски ({QUICK_KIDS.join(', ')})</button>
                </div>
                {errors.sizes && <p className="text-sm text-red-600 mt-2">{errors.sizes}</p>}
            </div>

            <div className="flex items-center gap-3 mt-6">
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-3 bg-yellow-400 text-slate-800 font-bold rounded-lg hover:bg-yellow-500 disabled:opacity-60"
                >
                    {saving ? 'Запазване…' : 'Запази'}
                </button>
                <button type="button" onClick={() => router.push('/admin/products')} className="px-6 py-3 border border-slate-300 rounded-lg hover:bg-gray-50">
                    Отказ
                </button>
                {initial && (
                    <button
                        type="button"
                        onClick={handleArchiveToggle}
                        disabled={saving}
                        className="ml-auto px-6 py-3 border border-slate-300 text-slate-600 rounded-lg hover:bg-gray-50"
                    >
                        {isActive ? 'Архивирай' : 'Възстанови'}
                    </button>
                )}
            </div>
        </div>
    );
};

export default ProductEditor;
