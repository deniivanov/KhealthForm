'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatCents } from '@/lib/money';
import { setOrderStatus, setOrderPaymentStatus } from '@/app/admin/orders/actions';
import type { OrderStatus, PaymentStatus } from '@/models/Order';
import OrderAccessManager from '@/components/admin/OrderAccessManager';
import OrderLinesEditor from '@/components/admin/OrderLinesEditor';

export interface OrderRowData {
    _id: string;
    reference: string;
    formId: string;
    teamId: string;
    member: { fullName: string; email?: string; phone?: string };
    lines: Array<{
        formItemId: string;
        productSku: string;
        productName: string;
        sizeLabel: string;
        quantity: number;
        unitPriceCents: number;
        personalization?: Record<string, string>;
    }>;
    totalCents: number;
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    notes?: string;
    adminNotes?: string;
    createdAt: string;
}

const STATUS_LABELS: Record<OrderStatus, string> = {
    submitted: 'подадена',
    confirmed: 'потвърдена',
    in_production: 'в производство',
    delivered: 'доставена',
    cancelled: 'отказана',
};

function formatDate(iso: string): string {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}, ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const OrdersTable = ({
    orders,
    context,
    summary,
}: {
    orders: OrderRowData[];
    /** formId -> "Team / Form" label for the global view; omit on per-form pages */
    context?: Record<string, string>;
    /** totals for the whole (filtered) set; defaults to the displayed rows — pass on paginated views */
    summary?: { totalCents: number; quantity: number };
}) => {
    const router = useRouter();
    const [expanded, setExpanded] = useState<Set<string>>(new Set());
    const [busyId, setBusyId] = useState<string | null>(null);

    const toggle = (id: string) => {
        const next = new Set(expanded);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setExpanded(next);
    };

    const changeStatus = async (id: string, status: OrderStatus) => {
        setBusyId(id);
        try {
            await setOrderStatus(id, status);
            router.refresh();
        } finally {
            setBusyId(null);
        }
    };

    const active = orders.filter(o => o.status !== 'cancelled');
    const totals = summary ?? {
        totalCents: active.reduce((sum, o) => sum + o.totalCents, 0),
        quantity: active.reduce((sum, o) => sum + o.lines.reduce((n, l) => n + l.quantity, 0), 0),
    };

    const togglePayment = async (id: string, current: PaymentStatus) => {
        setBusyId(id);
        try {
            await setOrderPaymentStatus(id, current === 'paid' ? 'unpaid' : 'paid');
            router.refresh();
        } finally {
            setBusyId(null);
        }
    };

    return (
        <div className="overflow-x-auto">
            <table className="table">
                <thead>
                    <tr>
                        <th style={{ width: 24 }}></th>
                        <th>Поръчка</th>
                        <th>Клиент</th>
                        {context && <th>Форма</th>}
                        <th>Артикули</th>
                        <th>Сума</th>
                        <th>Статус</th>
                        <th>Плащане</th>
                        <th>Дата</th>
                        <th title="Изтегляне на XLSX за поръчката">Файл</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map(order => (
                        <React.Fragment key={order._id}>
                            <tr className="cursor-pointer" onClick={() => toggle(order._id)}>
                                <td className="text-muted">{expanded.has(order._id) ? '▾' : '▸'}</td>
                                <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{order.reference}</td>
                                <td>
                                    <span style={{ fontWeight: 600 }}>{order.member.fullName}</span>
                                    <span className="text-muted" style={{ display: 'block', fontSize: 11.5 }}>
                                        {[order.member.phone, order.member.email].filter(Boolean).join(' · ')}
                                    </span>
                                </td>
                                {context && (
                                    <td className="text-muted">{context[order.formId] ?? '—'}</td>
                                )}
                                <td className="text-muted">
                                    {order.lines.reduce((n, l) => n + l.quantity, 0) } бр. / {order.lines.length} реда
                                </td>
                                <td style={{ fontWeight: 600 }}>{formatCents(order.totalCents)}</td>
                                <td onClick={e => e.stopPropagation()}>
                                    <select
                                        value={order.status}
                                        disabled={busyId === order._id}
                                        onChange={e => changeStatus(order._id, e.target.value as OrderStatus)}
                                        className="tag-select"
                                        data-status={order.status}
                                    >
                                        {(Object.keys(STATUS_LABELS) as OrderStatus[]).map(s => (
                                            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                                        ))}
                                    </select>
                                </td>
                                <td onClick={e => e.stopPropagation()}>
                                    <button
                                        disabled={busyId === order._id}
                                        onClick={() => togglePayment(order._id, order.paymentStatus)}
                                        className={`tag ${order.paymentStatus === 'paid' ? 'tag-good' : 'tag-ink'}`}
                                        style={{ cursor: 'pointer' }}
                                        title="Смени статус на плащане"
                                    >
                                        {order.paymentStatus === 'paid' ? 'платена' : 'неплатена'}
                                    </button>
                                </td>
                                <td className="text-muted whitespace-nowrap">{formatDate(order.createdAt)}</td>
                                <td onClick={e => e.stopPropagation()}>
                                    <span className="inline-flex items-center gap-1">
                                        <a
                                            href={`/api/admin/orders/${order._id}/export?report=production`}
                                            className="btn btn-secondary"
                                            style={{ padding: '3px 8px', fontSize: 14, lineHeight: 1 }}
                                            title="XLSX за производство — артикули, размери, персонализация (без цени)"
                                        >
                                            🧵
                                        </a>
                                        <a
                                            href={`/api/admin/orders/${order._id}/export?report=admin`}
                                            className="btn btn-secondary"
                                            style={{ padding: '3px 8px', fontSize: 14, lineHeight: 1 }}
                                            title="XLSX за администрация — контакти, цени, плащане"
                                        >
                                            🧾
                                        </a>
                                    </span>
                                </td>
                            </tr>
                            {expanded.has(order._id) && (
                                <tr>
                                    <td></td>
                                    <td colSpan={context ? 9 : 8} style={{ padding: '10px 8px' }}>
                                        <div className="flex flex-col gap-1">
                                            {order.lines.map((line, i) => (
                                                <div
                                                    key={i}
                                                    className="flex items-center justify-between gap-3"
                                                    style={{
                                                        background: 'var(--color-surface)',
                                                        border: '1px solid var(--color-divider)',
                                                        padding: '8px 12px',
                                                        fontSize: 13,
                                                    }}
                                                >
                                                    <span>
                                                        <span style={{ fontWeight: 600 }}>{line.productName}</span>{' '}
                                                        <span className="text-muted" style={{ fontFamily: 'monospace', fontSize: 11 }}>({line.productSku})</span>
                                                        {' — '}{line.sizeLabel} × {line.quantity}
                                                        {line.personalization && Object.keys(line.personalization).length > 0 && (
                                                            <span className="text-muted" style={{ display: 'block', fontSize: 11.5 }}>
                                                                {Object.entries(line.personalization).map(([k, v]) => `${k}: ${v}`).join(' · ')}
                                                            </span>
                                                        )}
                                                    </span>
                                                    <span className="whitespace-nowrap">
                                                        {formatCents(line.unitPriceCents)} × {line.quantity} = {formatCents(line.unitPriceCents * line.quantity)}
                                                    </span>
                                                </div>
                                            ))}
                                            {order.notes && (
                                                <p className="text-muted" style={{ fontSize: 13, margin: '6px 0 0' }}>
                                                    Бележка от клиента: {order.notes}
                                                </p>
                                            )}
                                            <OrderLinesEditor
                                                orderId={order._id}
                                                initialLines={order.lines.map(l => ({
                                                    formItemId: l.formItemId,
                                                    sizeLabel: l.sizeLabel,
                                                    quantity: l.quantity,
                                                    personalization: l.personalization ?? {},
                                                }))}
                                            />
                                            <OrderAccessManager orderId={order._id} />
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </React.Fragment>
                    ))}
                </tbody>
                {orders.length > 0 && (
                    <tfoot>
                        <tr style={{ fontWeight: 700 }}>
                            <td colSpan={context ? 4 : 3} style={{ borderTop: '2px solid var(--color-divider)' }}>
                                ОБЩО (без отказаните)
                            </td>
                            <td style={{ borderTop: '2px solid var(--color-divider)' }}>{totals.quantity} бр.</td>
                            <td style={{ borderTop: '2px solid var(--color-divider)' }}>{formatCents(totals.totalCents)}</td>
                            <td colSpan={4} style={{ borderTop: '2px solid var(--color-divider)' }}></td>
                        </tr>
                    </tfoot>
                )}
            </table>
            {orders.length === 0 && <div className="empty"><p>Няма намерени поръчки.</p></div>}
        </div>
    );
};

export default OrdersTable;
