'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PRODUCT_CATEGORIES } from '@/lib/productConstants';
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
        <div className="flex flex-col gap-6">
            <div>
                <h6>Каталог</h6>
                <h3 style={{ margin: 0 }}>{initial ? `Редакция: ${initial.name}` : 'Нов продукт'}</h3>
            </div>

            {errors._ && <p className="field-error" style={{ margin: 0 }}>{errors._}</p>}

            <div className="panel">
                <div className="panel-head">
                    <h6>Основни данни</h6>
                </div>
                <div className="flex flex-col gap-4" style={{ padding: 16 }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="field">
                            <label>SKU (код на продукта) *</label>
                            <input value={sku} onChange={e => setSku(e.target.value.toUpperCase())} className="input" placeholder="TS-CLASSIC" />
                            {errors.sku && <p className="field-error">{errors.sku}</p>}
                        </div>
                        <div className="field">
                            <label>Категория *</label>
                            <div className="flex gap-2">
                                <select
                                    value={PRODUCT_CATEGORIES.includes(category as never) ? category : '__custom'}
                                    onChange={e => { if (e.target.value !== '__custom') setCategory(e.target.value); }}
                                    className="input"
                                >
                                    {PRODUCT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    <option value="__custom">друга…</option>
                                </select>
                                {!PRODUCT_CATEGORIES.includes(category as never) && (
                                    <input value={category} onChange={e => setCategory(e.target.value)} className="input" placeholder="категория" />
                                )}
                            </div>
                            {errors.category && <p className="field-error">{errors.category}</p>}
                        </div>
                    </div>

                    <div className="field">
                        <label>Име *</label>
                        <input value={name} onChange={e => setName(e.target.value)} className="input" />
                        {errors.name && <p className="field-error">{errors.name}</p>}
                    </div>

                    <div className="field">
                        <label>Описание</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="input" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="field">
                            <label>Базова цена (EUR) *</label>
                            <input value={basePrice} onChange={e => setBasePrice(e.target.value)} className="input" placeholder="18.00" inputMode="decimal" />
                            {errors.basePrice && <p className="field-error">{errors.basePrice}</p>}
                        </div>
                        <div className="flex items-end" style={{ paddingBottom: 6 }}>
                            <label className="flex items-center gap-2" style={{ fontSize: 13, cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={isActive}
                                    onChange={e => setIsActive(e.target.checked)}
                                    style={{ width: 16, height: 16, accentColor: 'var(--color-accent)' }}
                                />
                                Активен (вижда се при създаване на форми)
                            </label>
                        </div>
                    </div>

                    <div className="field">
                        <label>Снимки (URL адреси)</label>
                        <div className="flex flex-col gap-2">
                            {images.map((url, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <input
                                        value={url}
                                        onChange={e => setImages(images.map((u, j) => (j === i ? e.target.value : u)))}
                                        className="input"
                                        placeholder="https://..."
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setImages(images.filter((_, j) => j !== i))}
                                        className="btn btn-ghost"
                                        title="Премахни"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                            <div>
                                <button type="button" onClick={() => setImages([...images, ''])} className="btn btn-ghost" style={{ fontSize: 13 }}>
                                    + Добави снимка
                                </button>
                            </div>
                            {errors.images && <p className="field-error">{errors.images}</p>}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Size chart editor ── */}
            <div className="panel">
                <div className="panel-head">
                    <h6>Таблица с размери</h6>
                </div>
                <div className="flex flex-col gap-4" style={{ padding: 16 }}>
                    <p className="text-muted" style={{ fontSize: 13, margin: 0 }}>
                        Колоните са измервания в см, редовете са размери. Празни клетки са позволени.
                    </p>

                    <div className="flex flex-wrap items-center gap-2">
                        <span style={{ fontSize: 12, fontWeight: 600 }}>Измервания:</span>
                        {dimensions.map(d => (
                            <span key={d} className="tag tag-accent" style={{ gap: 6 }}>
                                {dimensionLabel(d)}
                                <button
                                    type="button"
                                    onClick={() => removeDimension(d)}
                                    title="Премахни колоната"
                                    style={{ background: 'none', border: 0, cursor: 'pointer', color: 'inherit', font: 'inherit', padding: 0 }}
                                >
                                    ✕
                                </button>
                            </span>
                        ))}
                        <select
                            value=""
                            onChange={e => { if (e.target.value) { setNewDimension(''); setDimensions(prev => prev.includes(e.target.value) ? prev : [...prev, e.target.value]); } }}
                            className="input"
                            style={{ width: 'auto', minHeight: 32, fontSize: 13 }}
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
                            className="input"
                            style={{ width: 176, minHeight: 32, fontSize: 13 }}
                        />
                        <button type="button" onClick={addDimension} className="btn btn-ghost" style={{ fontSize: 13 }}>добави</button>
                    </div>
                    {errors.dimensions && <p className="field-error" style={{ margin: 0 }}>{errors.dimensions}</p>}

                    <div className="overflow-x-auto">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th style={{ width: 56 }}></th>
                                    <th>Размер</th>
                                    {dimensions.map(d => (
                                        <th key={d} style={{ whiteSpace: 'nowrap' }}>{dimensionLabel(d)} (см)</th>
                                    ))}
                                    <th style={{ whiteSpace: 'nowrap' }}>Корекция на цена (€)</th>
                                    <th style={{ width: 40 }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {sizes.map((row, i) => (
                                    <tr key={i}>
                                        <td style={{ whiteSpace: 'nowrap' }}>
                                            <button type="button" onClick={() => moveSizeRow(i, -1)} className="btn btn-ghost" style={{ padding: '2px 4px' }} title="Нагоре">↑</button>
                                            <button type="button" onClick={() => moveSizeRow(i, 1)} className="btn btn-ghost" style={{ padding: '2px 4px' }} title="Надолу">↓</button>
                                        </td>
                                        <td>
                                            <input
                                                value={row.label}
                                                onChange={e => setSizeField(i, { label: e.target.value })}
                                                className="input"
                                                style={{ width: 88, minHeight: 32, fontWeight: 600 }}
                                                placeholder="M"
                                            />
                                        </td>
                                        {dimensions.map(d => (
                                            <td key={d}>
                                                <input
                                                    value={row.measurements[d] ?? ''}
                                                    onChange={e => setMeasurement(i, d, e.target.value)}
                                                    className="input"
                                                    style={{ width: 76, minHeight: 32 }}
                                                    inputMode="decimal"
                                                />
                                            </td>
                                        ))}
                                        <td>
                                            <input
                                                value={row.priceAdjustment}
                                                onChange={e => setSizeField(i, { priceAdjustment: e.target.value })}
                                                className="input"
                                                style={{ width: 88, minHeight: 32 }}
                                                placeholder="+2.00"
                                                inputMode="decimal"
                                            />
                                        </td>
                                        <td>
                                            <button type="button" onClick={() => removeSizeRow(i)} className="btn btn-ghost" style={{ padding: '2px 6px' }} title="Премахни реда">✕</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <button type="button" onClick={() => addSizeRow()} className="btn btn-ghost" style={{ fontSize: 13 }}>+ Добави размер</button>
                        <button type="button" onClick={() => addQuickSizes(QUICK_ADULT)} className="btn btn-ghost" style={{ fontSize: 13 }}>+ възрастни ({QUICK_ADULT.join(', ')})</button>
                        <button type="button" onClick={() => addQuickSizes(QUICK_KIDS)} className="btn btn-ghost" style={{ fontSize: 13 }}>+ детски ({QUICK_KIDS.join(', ')})</button>
                    </div>
                    {errors.sizes && <p className="field-error" style={{ margin: 0 }}>{errors.sizes}</p>}
                </div>
            </div>

            <div className="flex items-center gap-2">
                <button type="button" onClick={handleSave} disabled={saving} className="btn btn-primary">
                    {saving ? 'Запазване…' : 'Запази'}
                </button>
                <button type="button" onClick={() => router.push('/admin/products')} className="btn btn-secondary">
                    Отказ
                </button>
                {initial && (
                    <button
                        type="button"
                        onClick={handleArchiveToggle}
                        disabled={saving}
                        className="btn btn-secondary ml-auto"
                    >
                        {isActive ? 'Архивирай' : 'Възстанови'}
                    </button>
                )}
            </div>
        </div>
    );
};

export default ProductEditor;
