'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatCents } from '@/lib/money';
import { setOrderStatus, setOrderPaymentStatus } from '@/app/admin/orders/actions';
import type { OrderStatus, PaymentStatus } from '@/models/Order';

export interface OrderRowData {
    _id: string;
    reference: string;
    formId: string;
    teamId: string;
    member: { fullName: string; email?: string; phone?: string };
    lines: Array<{
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
}: {
    orders: OrderRowData[];
    /** formId -> "Team / Form" label for the global view; omit on per-form pages */
    context?: Record<string, string>;
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
                            </tr>
                            {expanded.has(order._id) && (
                                <tr>
                                    <td></td>
                                    <td colSpan={context ? 8 : 7} style={{ padding: '10px 8px' }}>
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
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </React.Fragment>
                    ))}
                </tbody>
            </table>
            {orders.length === 0 && <div className="empty"><p>Няма намерени поръчки.</p></div>}
        </div>
    );
};

export default OrdersTable;
