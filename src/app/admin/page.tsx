import Link from 'next/link';
import connectDB from '@/lib/db';
import Form from '@/models/Form';
import Team from '@/models/Team';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { formatCents } from '@/lib/money';

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
        Order.find().sort({ createdAt: -1 }).limit(10).lean(),
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
        { label: 'Поръчки (всички)', value: orderCount, href: '/admin/orders' },
        { label: 'Оборот', value: formatCents(revenueAgg[0]?.sum ?? 0), href: '/admin/orders' },
    ];

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-semibold text-gray-900">Табло</h1>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map(s => (
                    <Link key={s.label} href={s.href} className="bg-white rounded-lg shadow-sm p-5 hover:shadow transition-shadow">
                        <p className="text-sm text-gray-500">{s.label}</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{s.value}</p>
                    </Link>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* ── Open forms ── */}
                <div className="bg-white rounded-lg shadow-sm">
                    <div className="p-5 border-b border-gray-200 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900">Отворени форми</h2>
                        <Link href="/admin/forms" className="text-sm text-blue-700 hover:underline">всички →</Link>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {openForms.map(f => {
                            const team = teamById.get(String(f.teamId));
                            return (
                                <div key={String(f._id)} className="p-4 flex items-center justify-between gap-3">
                                    <div>
                                        <Link href={`/admin/forms/${String(f._id)}/orders`} className="font-medium text-gray-900 hover:underline">
                                            {f.title}
                                        </Link>
                                        <p className="text-xs text-gray-500">
                                            {team?.name}
                                            {f.closesAt && ` · затваря ${formatDate(f.closesAt)}`}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-gray-900">{orderCountByForm.get(String(f._id)) ?? 0}</p>
                                        <p className="text-xs text-gray-500">поръчки</p>
                                    </div>
                                </div>
                            );
                        })}
                        {openForms.length === 0 && <p className="p-5 text-gray-500 text-sm">Няма отворени форми.</p>}
                    </div>
                </div>

                {/* ── Recent orders ── */}
                <div className="bg-white rounded-lg shadow-sm">
                    <div className="p-5 border-b border-gray-200 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900">Последни поръчки</h2>
                        <Link href="/admin/orders" className="text-sm text-blue-700 hover:underline">всички →</Link>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {recentOrders.map(o => (
                            <div key={String(o._id)} className="p-4 flex items-center justify-between gap-3">
                                <div>
                                    <p className="font-medium text-gray-900">{o.member.fullName}</p>
                                    <p className="text-xs text-gray-500 font-mono">{o.reference}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-gray-900">{formatCents(o.totalCents)}</p>
                                    <p className="text-xs text-gray-500">{formatDate(o.createdAt)}</p>
                                </div>
                            </div>
                        ))}
                        {recentOrders.length === 0 && <p className="p-5 text-gray-500 text-sm">Все още няма поръчки.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}
