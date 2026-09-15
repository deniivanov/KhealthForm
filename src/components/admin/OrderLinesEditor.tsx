'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatCents } from '@/lib/money';
import { getOrderFormItems, updateOrderLines } from '@/app/admin/orders/actions';
import type { PriceableFormItem } from '@/lib/orders';

export interface EditorLine {
    formItemId: string;
    sizeLabel: string;
    quantity: number;
    personalization: Record<string, string>;
}

const ERROR_LABELS: Record<string, string> = {
    empty: 'Поръчката трябва да има поне един артикул.',
    too_many_lines: 'Твърде много редове.',
    unknown_item: 'Някой от артикулите вече не е част от формата — премахнете го или изберете друг.',
    unknown_size: 'Избраният размер вече не съществува за този артикул.',
    invalid_quantity: 'Невалидно количество (1–20).',
    generic: 'Записът не успя. Опитайте отново.',
};

function errorLabel(code: string): string {
    if (ERROR_LABELS[code]) return ERROR_LABELS[code];
    if (code.startsWith('missing_')) return 'Липсва задължителна персонализация.';
    if (code.startsWith('invalid_')) return 'Невалидна стойност за персонализация.';
    return ERROR_LABELS.generic;
}

function unitPriceCents(item: PriceableFormItem | undefined, sizeLabel: string): number | null {
    if (!item) return null;
    const size = item.sizes.find(s => s.label === sizeLabel);
    if (!size) return null;
    return item.priceCents + (size.priceAdjustmentCents ?? 0);
}

const OrderLinesEditor = ({ orderId, initialLines }: { orderId: string; initialLines: EditorLine[] }) => {
    const router = useRouter();
    const [items, setItems] = useState<PriceableFormItem[] | null>(null);
    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lines, setLines] = useState<EditorLine[]>(initialLines);

    const startEditing = async () => {
        setLoading(true);
        setError(null);
        try {
            const fetched = items ?? (await getOrderFormItems(orderId));
            setItems(fetched);
            setLines(initialLines.map(l => ({ ...l, personalization: { ...l.personalization } })));
            setEditing(true);
        } catch {
            setError(ERROR_LABELS.generic);
        } finally {
            setLoading(false);
        }
    };

    const patchLine = (index: number, patch: Partial<EditorLine>) => {
        setLines(prev => prev.map((l, i) => (i === index ? { ...l, ...patch } : l)));
    };

    const changeItem = (index: number, formItemId: string) => {
        const item = items?.find(i => i._id === formItemId);
        patchLine(index, {
            formItemId,
            sizeLabel: item?.sizes[0]?.label ?? '',
            personalization: {},
        });
    };

    const addLine = () => {
        const first = items?.[0];
        if (!first) return;
        setLines(prev => [
            ...prev,
            { formItemId: first._id, sizeLabel: first.sizes[0]?.label ?? '', quantity: 1, personalization: {} },
        ]);
    };

    const save = async () => {
        setSaving(true);
        setError(null);
        try {
            const result = await updateOrderLines(orderId, lines);
            if (!result.ok) {
                setError(errorLabel(result.error));
                return;
            }
            setEditing(false);
            router.refresh();
        } catch {
            setError(ERROR_LABELS.generic);
        } finally {
            setSaving(false);
        }
    };

    if (!editing) {
        return (
            <div className="flex items-center gap-2" style={{ marginTop: 4 }}>
                <button className="btn btn-secondary" style={{ fontSize: 12 }} disabled={loading} onClick={startEditing}>
                    {loading ? 'Зареждане…' : '✎ Редактирай артикулите'}
                </button>
                {error && <span style={{ color: 'var(--color-danger, #b3261e)', fontSize: 12.5 }}>{error}</span>}
            </div>
        );
    }

    const totalCents = lines.reduce((sum, l) => {
        const unit = unitPriceCents(items?.find(i => i._id === l.formItemId), l.sizeLabel);
        return sum + (unit ?? 0) * (Number.isFinite(l.quantity) ? l.quantity : 0);
    }, 0);

    return (
        <div
            className="flex flex-col gap-2"
            style={{ border: '1px solid var(--color-divider)', background: 'var(--color-surface)', padding: 12, marginTop: 4 }}
        >
            <span style={{ fontWeight: 600, fontSize: 13 }}>Редакция на артикулите</span>
            {lines.map((line, i) => {
                const item = items?.find(it => it._id === line.formItemId);
                const unit = unitPriceCents(item, line.sizeLabel);
                return (
                    <div
                        key={i}
                        className="flex flex-wrap items-end gap-2"
                        style={{ borderBottom: '1px dashed var(--color-divider)', paddingBottom: 8 }}
                    >
                        <label className="flex flex-col gap-1" style={{ fontSize: 11.5 }}>
                            <span className="text-muted">Артикул</span>
                            <select
                                className="input"
                                style={{ width: 220 }}
                                value={line.formItemId}
                                onChange={e => changeItem(i, e.target.value)}
                            >
                                {!item && <option value={line.formItemId}>(премахнат от формата)</option>}
                                {items?.map(it => (
                                    <option key={it._id} value={it._id}>{it.name} ({it.sku})</option>
                                ))}
                            </select>
                        </label>
                        <label className="flex flex-col gap-1" style={{ fontSize: 11.5 }}>
                            <span className="text-muted">Размер</span>
                            <select
                                className="input"
                                style={{ width: 110 }}
                                value={line.sizeLabel}
                                onChange={e => patchLine(i, { sizeLabel: e.target.value })}
                            >
                                {item && !item.sizes.some(s => s.label === line.sizeLabel) && (
                                    <option value={line.sizeLabel}>{line.sizeLabel} (?)</option>
                                )}
                                {item?.sizes.map(s => (
                                    <option key={s.label} value={s.label}>
                                        {s.label}{s.priceAdjustmentCents ? ` (+${formatCents(s.priceAdjustmentCents)})` : ''}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label className="flex flex-col gap-1" style={{ fontSize: 11.5 }}>
                            <span className="text-muted">Брой</span>
                            <input
                                type="number"
                                min={1}
                                max={20}
                                className="input"
                                style={{ width: 70 }}
                                value={line.quantity}
                                onChange={e => patchLine(i, { quantity: parseInt(e.target.value, 10) || 0 })}
                            />
                        </label>
                        {item?.personalization.map(field => (
                            <label key={field.key} className="flex flex-col gap-1" style={{ fontSize: 11.5 }}>
                                <span className="text-muted">{field.label}{field.required ? ' *' : ''}</span>
                                <input
                                    type="text"
                                    inputMode={field.type === 'number' ? 'numeric' : undefined}
                                    className="input"
                                    style={{ width: 130 }}
                                    value={line.personalization[field.key] ?? ''}
                                    onChange={e =>
                                        patchLine(i, {
                                            personalization: { ...line.personalization, [field.key]: e.target.value },
                                        })
                                    }
                                />
                            </label>
                        ))}
                        <span className="whitespace-nowrap text-muted" style={{ fontSize: 12.5, paddingBottom: 8 }}>
                            {unit !== null ? `${formatCents(unit)} × ${line.quantity || 0} = ${formatCents(unit * (line.quantity || 0))}` : '—'}
                        </span>
                        <button
                            className="btn btn-ghost"
                            style={{ fontSize: 12, marginLeft: 'auto' }}
                            title="Премахни реда"
                            onClick={() => setLines(prev => prev.filter((_, j) => j !== i))}
                        >
                            ✕ Премахни
                        </button>
                    </div>
                );
            })}
            <div className="flex flex-wrap items-center gap-2">
                <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={addLine} disabled={!items?.length}>
                    + Добави артикул
                </button>
                <span style={{ marginLeft: 'auto', fontWeight: 700, fontSize: 13 }}>
                    Ново общо: {formatCents(totalCents)}
                </span>
                <button className="btn btn-secondary" style={{ fontSize: 12 }} disabled={saving} onClick={() => setEditing(false)}>
                    Откажи
                </button>
                <button className="btn btn-primary" style={{ fontSize: 12 }} disabled={saving || lines.length === 0} onClick={save}>
                    {saving ? 'Запис…' : 'Запази промените'}
                </button>
            </div>
            {error && <span style={{ color: 'var(--color-danger, #b3261e)', fontSize: 12.5 }}>{error}</span>}
        </div>
    );
};

export default OrderLinesEditor;
