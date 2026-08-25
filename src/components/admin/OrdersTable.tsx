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

const STATUS_COLORS: Record<OrderStatus, string> = {
    submitted: 'bg-blue-50 text-blue-700 border-blue-200',
    confirmed: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    in_production: 'bg-amber-50 text-amber-700 border-amber-200',
    delivered: 'bg-green-50 text-green-700 border-green-200',
    cancelled: 'bg-red-50 text-red-600 border-red-200',
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
            <table className="w-full">
                <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-left text-gray-900">
                        <th className="py-3 px-4 w-6"></th>
                        <th className="py-3 px-4 font-medium">Поръчка</th>
                        <th className="py-3 px-4 font-medium">Клиент</th>
                        {context && <th className="py-3 px-4 font-medium">Форма</th>}
                        <th className="py-3 px-4 font-medium">Артикули</th>
                        <th className="py-3 px-4 font-medium">Сума</th>
                        <th className="py-3 px-4 font-medium">Статус</th>
                        <th className="py-3 px-4 font-medium">Плащане</th>
                        <th className="py-3 px-4 font-medium">Дата</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map(order => (
                        <React.Fragment key={order._id}>
                            <tr className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer" onClick={() => toggle(order._id)}>
                                <td className="py-3 px-4 text-gray-400">{expanded.has(order._id) ? '▾' : '▸'}</td>
                                <td className="py-3 px-4 font-mono text-sm text-gray-900">{order.reference}</td>
                                <td className="py-3 px-4">
                                    <div className="font-medium text-gray-900">{order.member.fullName}</div>
                                    <div className="text-xs text-gray-500">
                                        {[order.member.phone, order.member.email].filter(Boolean).join(' · ')}
                                    </div>
                                </td>
                                {context && (
                                    <td className="py-3 px-4 text-sm text-gray-600">{context[order.formId] ?? '—'}</td>
                                )}
                                <td className="py-3 px-4 text-sm text-gray-600">
                                    {order.lines.reduce((n, l) => n + l.quantity, 0) } бр. / {order.lines.length} реда
                                </td>
                                <td className="py-3 px-4 font-semibold text-gray-900">{formatCents(order.totalCents)}</td>
                                <td className="py-3 px-4" onClick={e => e.stopPropagation()}>
                                    <select
                                        value={order.status}
                                        disabled={busyId === order._id}
                                        onChange={e => changeStatus(order._id, e.target.value as OrderStatus)}
                                        className={`text-xs font-semibold border rounded-full px-2 py-1 ${STATUS_COLORS[order.status]}`}
                                    >
                                        {(Object.keys(STATUS_LABELS) as OrderStatus[]).map(s => (
                                            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                                        ))}
                                    </select>
                                </td>
                                <td className="py-3 px-4" onClick={e => e.stopPropagation()}>
                                    <button
                                        disabled={busyId === order._id}
                                        onClick={() => togglePayment(order._id, order.paymentStatus)}
                                        className={`text-xs font-semibold px-2 py-1 rounded-full border ${
                                            order.paymentStatus === 'paid'
                                                ? 'bg-green-50 text-green-700 border-green-200'
                                                : 'bg-gray-50 text-gray-500 border-gray-200'
                                        }`}
                                        title="Смени статус на плащане"
                                    >
                                        {order.paymentStatus === 'paid' ? 'платена' : 'неплатена'}
                                    </button>
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-600 whitespace-nowrap">{formatDate(order.createdAt)}</td>
                            </tr>
                            {expanded.has(order._id) && (
                                <tr className="bg-gray-50">
                                    <td></td>
                                    <td colSpan={context ? 8 : 7} className="py-3 px-4">
                                        <div className="space-y-1">
                                            {order.lines.map((line, i) => (
                                                <div key={i} className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm">
                                                    <span className="text-gray-800">
                                                        <span className="font-medium">{line.productName}</span>{' '}
                                                        <span className="text-gray-500 font-mono text-xs">({line.productSku})</span>
                                                        {' — '}{line.sizeLabel} × {line.quantity}
                                                        {line.personalization && Object.keys(line.personalization).length > 0 && (
                                                            <span className="block text-xs text-gray-500">
                                                                {Object.entries(line.personalization).map(([k, v]) => `${k}: ${v}`).join(' · ')}
                                                            </span>
                                                        )}
                                                    </span>
                                                    <span className="text-gray-700 whitespace-nowrap">
                                                        {formatCents(line.unitPriceCents)} × {line.quantity} = {formatCents(line.unitPriceCents * line.quantity)}
                                                    </span>
                                                </div>
                                            ))}
                                            {order.notes && (
                                                <p className="text-sm text-gray-600 pt-1">📝 Бележка от клиента: {order.notes}</p>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </React.Fragment>
                    ))}
                </tbody>
            </table>
            {orders.length === 0 && <div className="text-center py-12 text-gray-500">Няма намерени поръчки</div>}
        </div>
    );
};

export default OrdersTable;
