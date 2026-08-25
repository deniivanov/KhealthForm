import connectDB from '@/lib/db';
import Order from '@/models/Order';
import Form from '@/models/Form';
import Team from '@/models/Team';
import OrdersTable, { type OrderRowData } from '@/components/admin/OrdersTable';
import { buildOrderFilter } from '@/lib/orderQuery';
import { toPlain } from '@/lib/serialize';
import { formatCents } from '@/lib/money';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 50;

export default async function GlobalOrdersPage({
    searchParams,
}: {
    searchParams: Promise<{ status?: string; sku?: string; size?: string; team?: string; form?: string; page?: string }>;
}) {
    const { status = '', sku = '', size = '', team = '', form = '', page = '1' } = await searchParams;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);

    await connectDB();
    const filter = buildOrderFilter({ status, sku, size, teamId: team || undefined, formId: form || undefined });

    const [orders, total, teams, forms, skus, sizes, revenue] = await Promise.all([
        Order.find(filter).sort({ createdAt: -1 }).skip((pageNum - 1) * PAGE_SIZE).limit(PAGE_SIZE).lean(),
        Order.countDocuments(filter),
        Team.find().sort({ name: 1 }).lean(),
        Form.find().sort({ createdAt: -1 }).select('title teamId').lean(),
        Order.distinct('lines.productSku'),
        Order.distinct('lines.sizeLabel'),
        Order.aggregate<{ _id: null; sum: number }>([
            { $match: { ...filter, status: { $ne: 'cancelled' } } },
            { $group: { _id: null, sum: { $sum: '$totalCents' } } },
        ]),
    ]);

    const teamById = new Map(teams.map(t => [String(t._id), t.name]));
    const context: Record<string, string> = {};
    for (const f of forms) {
        context[String(f._id)] = `${teamById.get(String(f.teamId)) ?? '?'} / ${f.title}`;
    }

    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

    return (
        <div className="p-6">
            <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">Поръчки</h1>
                            <p className="text-gray-600 mt-1">
                                {total} поръчки · оборот {formatCents(revenue[0]?.sum ?? 0)} (без отказаните)
                            </p>
                        </div>
                        <form className="flex flex-wrap items-center gap-2">
                            <select name="team" defaultValue={team} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                                <option value="">Всички отбори</option>
                                {teams.map(t => (
                                    <option key={String(t._id)} value={String(t._id)}>{t.name}</option>
                                ))}
                            </select>
                            <select name="form" defaultValue={form} className="px-3 py-2 border border-gray-300 rounded-lg text-sm max-w-56">
                                <option value="">Всички форми</option>
                                {forms.map(f => (
                                    <option key={String(f._id)} value={String(f._id)}>{f.title}</option>
                                ))}
                            </select>
                            <select name="status" defaultValue={status} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                                <option value="">Всички статуси</option>
                                <option value="submitted">подадена</option>
                                <option value="confirmed">потвърдена</option>
                                <option value="in_production">в производство</option>
                                <option value="delivered">доставена</option>
                                <option value="cancelled">отказана</option>
                            </select>
                            <select name="sku" defaultValue={sku} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                                <option value="">Всички продукти</option>
                                {skus.sort().map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <select name="size" defaultValue={size} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                                <option value="">Всички размери</option>
                                {sizes.sort().map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <button type="submit" className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                                Филтрирай
                            </button>
                        </form>
                    </div>
                </div>

                <OrdersTable orders={toPlain<OrderRowData[]>(orders)} context={context} />

                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-3 py-4 text-sm text-gray-600">
                        стр. {pageNum} от {totalPages}
                    </div>
                )}
            </div>
        </div>
    );
}
