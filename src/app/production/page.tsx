import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import Form from '@/models/Form';
import Team from '@/models/Team';
import AutoRefresh from '@/components/admin/AutoRefresh';

export const dynamic = 'force-dynamic';

const QUEUE_STATUSES = ['submitted', 'confirmed', 'in_production'] as const;

const STATUS_LABELS: Record<string, string> = {
    submitted: 'подадена',
    confirmed: 'потвърдена',
    in_production: 'в производство',
    delivered: 'доставена',
};

function formatDate(d: Date | string): string {
    const date = new Date(d);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(date.getDate())}.${pad(date.getMonth() + 1)} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/**
 * Large-display production queue ("TV mode"): active orders oldest-first,
 * big type, color-coded statuses, auto-refresh. Same admin session guard.
 */
export default async function ProductionQueuePage() {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
        redirect('/login?callbackUrl=/production');
    }

    await connectDB();
    const [queue, deliveredToday, forms, teams] = await Promise.all([
        Order.find({ status: { $in: [...QUEUE_STATUSES] } }).sort({ createdAt: 1 }).limit(60).lean(),
        Order.countDocuments({
            status: 'delivered',
            updatedAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        }),
        Form.find().select('title teamId').lean(),
        Team.find().select('name').lean(),
    ]);

    const teamById = new Map(teams.map(t => [String(t._id), t.name]));
    const formById = new Map(forms.map(f => [String(f._id), f]));

    const counts = Object.fromEntries(QUEUE_STATUSES.map(s => [s, queue.filter(o => o.status === s).length]));

    return (
        <div className="modernist min-h-screen" style={{ background: 'var(--color-neutral-200)' }}>
            {/* Header */}
            <div
                className="flex items-center justify-between gap-6 flex-wrap"
                style={{ padding: '18px 32px', background: 'var(--color-bg)', borderBottom: '2px solid var(--color-divider)' }}
            >
                <div className="flex items-center gap-4">
                    <h3alth-logo mode="idle" height="36" idle-every="8" />
                    <h3 style={{ margin: 0 }}>Производство — опашка</h3>
                </div>
                <div className="flex items-center gap-6 flex-wrap">
                    <span className="status-block" data-status="submitted" style={{ fontSize: 18, padding: '8px 18px' }}>
                        Нови: {counts.submitted}
                    </span>
                    <span className="status-block" data-status="confirmed" style={{ fontSize: 18, padding: '8px 18px' }}>
                        Потвърдени: {counts.confirmed}
                    </span>
                    <span className="status-block" data-status="in_production" style={{ fontSize: 18, padding: '8px 18px' }}>
                        В производство: {counts.in_production}
                    </span>
                    <span className="status-block" data-status="delivered" style={{ fontSize: 18, padding: '8px 18px' }}>
                        Готови днес: {deliveredToday}
                    </span>
                    <AutoRefresh seconds={30} />
                </div>
            </div>

            {/* Queue */}
            <div style={{ padding: '24px 32px' }}>
                {queue.length === 0 ? (
                    <div className="empty" style={{ padding: '120px 24px' }}>
                        <p style={{ fontSize: 26 }}>Опашката е празна — няма активни поръчки. 🎉</p>
                    </div>
                ) : (
                    <div className="flex flex-col" style={{ gap: 14 }}>
                        {queue.map((order, index) => {
                            const form = formById.get(String(order.formId));
                            const teamName = form ? teamById.get(String(form.teamId)) : undefined;
                            return (
                                <div
                                    key={String(order._id)}
                                    className="flex items-stretch"
                                    style={{
                                        background: 'var(--color-bg)',
                                        boxShadow: 'var(--shadow-sm)',
                                        borderLeft: `10px solid var(--status-${order.status})`,
                                    }}
                                >
                                    {/* Position + reference */}
                                    <div
                                        className="flex flex-col justify-center items-center"
                                        style={{ width: 130, padding: 16, borderRight: '2px solid var(--color-divider)', flexShrink: 0 }}
                                    >
                                        <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 34, lineHeight: 1 }}>
                                            {index + 1}
                                        </span>
                                        <span className="text-muted" style={{ fontSize: 13, fontFamily: 'monospace', marginTop: 6 }}>
                                            {order.reference.replace('ORD-', '')}
                                        </span>
                                    </div>

                                    {/* Who */}
                                    <div className="flex flex-col justify-center" style={{ width: 260, padding: '12px 20px', flexShrink: 0 }}>
                                        <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 22 }}>
                                            {order.member.fullName}
                                        </span>
                                        <span className="text-muted" style={{ fontSize: 15 }}>
                                            {teamName ?? '—'}
                                        </span>
                                    </div>

                                    {/* What */}
                                    <div className="flex-1 flex flex-col justify-center" style={{ padding: '12px 20px', minWidth: 0 }}>
                                        {order.lines.map((line, i) => {
                                            const personalization = Object.values(
                                                (line.personalization as unknown as Record<string, string>) ?? {}
                                            ).join(' · ');
                                            return (
                                                <div key={i} style={{ fontSize: 19, lineHeight: 1.5 }}>
                                                    <strong>{line.quantity}×</strong> {line.productName}{' '}
                                                    <span
                                                        style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, background: 'var(--color-surface)', padding: '0 8px' }}
                                                    >
                                                        {line.sizeLabel}
                                                    </span>
                                                    {personalization && (
                                                        <span style={{ color: 'var(--color-accent-700)', fontWeight: 600 }}>
                                                            {' '}— {personalization}
                                                        </span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                        {order.notes && (
                                            <div className="text-muted" style={{ fontSize: 15, marginTop: 4 }}>
                                                📝 {order.notes}
                                            </div>
                                        )}
                                    </div>

                                    {/* Status + when */}
                                    <div
                                        className="flex flex-col items-end justify-center"
                                        style={{ padding: '12px 20px', flexShrink: 0, gap: 8 }}
                                    >
                                        <span className="status-block" data-status={order.status} style={{ fontSize: 17 }}>
                                            {STATUS_LABELS[order.status] ?? order.status}
                                        </span>
                                        <span className="text-muted" style={{ fontSize: 14 }}>
                                            {formatDate(order.createdAt as Date)}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
