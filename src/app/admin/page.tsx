import Link from 'next/link';
import connectDB from '@/lib/db';
import Form from '@/models/Form';
import Team from '@/models/Team';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { formatCents } from '@/lib/money';
import CopyLinkButton from '@/components/admin/CopyLinkButton';

export const dynamic = 'force-dynamic';

function formatDate(d?: Date | string | null): string {
    if (!d) return '';
    const date = new Date(d);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`;
}

export default async function AdminDashboardPage() {
    await connectDB();

    const [openForms, recentOrders, teams, counts] = await Promise.all([
        Form.find({ status: 'open' }).sort({ closesAt: 1, createdAt: -1 }).limit(10).lean(),
        Order.find().sort({ createdAt: -1 }).limit(8).lean(),
        Team.find().lean(),
        Promise.all([
            Product.countDocuments({ isActive: true }),
            Team.countDocuments(),
            Order.countDocuments(),
            Order.aggregate<{ _id: null; sum: number }>([
                { $match: { status: { $ne: 'cancelled' } } },
                { $group: { _id: null, sum: { $sum: '$totalCents' } } },
            ]),
        ]),
    ]);

    const teamById = new Map(teams.map(t => [String(t._id), t]));
    const orderCountByForm = new Map<string, number>();
    const formIds = openForms.map(f => f._id);
    if (formIds.length) {
        const grouped = await Order.aggregate<{ _id: unknown; count: number }>([
            { $match: { formId: { $in: formIds } } },
            { $group: { _id: '$formId', count: { $sum: 1 } } },
        ]);
        for (const g of grouped) orderCountByForm.set(String(g._id), g.count);
    }

    const [productCount, teamCount, orderCount, revenueAgg] = counts;
    const stats = [
        { label: 'Активни продукти', value: productCount, href: '/admin/products' },
        { label: 'Отбори', value: teamCount, href: '/admin/teams' },
        { label: 'Поръчки', value: orderCount, href: '/admin/orders' },
        { label: 'Оборот', value: formatCents(revenueAgg[0]?.sum ?? 0), href: '/admin/orders' },
    ];

    return (
        <div className="flex flex-col gap-6">
            {/* Header + quick actions */}
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h6>Табло</h6>
                    <h3 style={{ margin: 0 }}>Добре дошли</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Link href="/admin/forms/new" className="btn btn-primary">+ Нова форма</Link>
                    <Link href="/admin/products/new" className="btn btn-secondary">+ Нов продукт</Link>
                    <Link href="/admin/teams/new" className="btn btn-secondary">+ Нов отбор</Link>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {stats.map(s => (
                    <Link key={s.label} href={s.href} className="stat">
                        <span className="stat-label">{s.label}</span>
                        <div className="stat-value">{s.value}</div>
                    </Link>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                {/* Open forms */}
                <div className="panel">
                    <div className="panel-head">
                        <h6>Отворени форми</h6>
                        <Link href="/admin/forms" className="btn btn-ghost" style={{ fontSize: 12 }}>всички →</Link>
                    </div>
                    {openForms.length === 0 ? (
                        <div className="empty">
                            <p>Няма отворени форми в момента.</p>
                            <Link href="/admin/forms/new" className="btn btn-primary">Създай форма</Link>
                        </div>
                    ) : (
                        <div>
                            {openForms.map(f => {
                                const team = teamById.get(String(f.teamId));
                                const publicPath = team ? `/f/${team.slug}/${f.slug}` : null;
                                return (
                                    <div
                                        key={String(f._id)}
                                        className="flex items-center justify-between gap-3 flex-wrap"
                                        style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-divider)' }}
                                    >
                                        <div style={{ minWidth: 0 }}>
                                            <Link href={`/admin/forms/${String(f._id)}/orders`} className="row-link" style={{ fontSize: 14 }}>
                                                {f.title}
                                            </Link>
                                            <p className="text-muted" style={{ fontSize: 12, margin: '2px 0 0' }}>
                                                {team?.name}
                                                {f.closesAt && ` · затваря на ${formatDate(f.closesAt)}`}
                                                {` · ${orderCountByForm.get(String(f._id)) ?? 0} поръчки`}
                                            </p>
                                        </div>
                                        {publicPath && <CopyLinkButton path={publicPath} small />}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Recent orders */}
                <div className="panel">
                    <div className="panel-head">
                        <h6>Последни поръчки</h6>
                        <Link href="/admin/orders" className="btn btn-ghost" style={{ fontSize: 12 }}>всички →</Link>
                    </div>
                    {recentOrders.length === 0 ? (
                        <div className="empty"><p>Все още няма поръчки.</p></div>
                    ) : (
                        <div>
                            {recentOrders.map(o => (
                                <div
                                    key={String(o._id)}
                                    className="flex items-center justify-between gap-3"
                                    style={{ padding: '10px 16px', borderBottom: '1px solid var(--color-divider)' }}
                                >
                                    <div>
                                        <span style={{ fontSize: 13, fontWeight: 600 }}>{o.member.fullName}</span>
                                        <p className="text-muted" style={{ fontSize: 11.5, margin: 0, fontFamily: 'var(--font-geist-mono, monospace)' }}>
                                            {o.reference}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span style={{ fontSize: 13, fontWeight: 600 }}>{formatCents(o.totalCents)}</span>
                                        <p className="text-muted" style={{ fontSize: 11.5, margin: 0 }}>{formatDate(o.createdAt)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Legacy, demoted out of the main nav */}
            <p className="text-muted" style={{ fontSize: 12 }}>
                Архив:{' '}
                <Link href="/admin/legacy" className="underline underline-offset-2">стари поръчки</Link>
                {' · '}
                <Link href="/admin/summary" className="underline underline-offset-2">стара справка</Link>
            </p>
        </div>
    );
}
