import Link from 'next/link';
import { notFound } from 'next/navigation';
import { isValidObjectId } from 'mongoose';
import connectDB from '@/lib/db';
import Form from '@/models/Form';
import Team from '@/models/Team';
import Order from '@/models/Order';
import OrdersTable, { type OrderRowData } from '@/components/admin/OrdersTable';
import { buildOrderFilter } from '@/lib/orderQuery';
import { buildProductionSummary } from '@/lib/production';
import { toPlain } from '@/lib/serialize';
import { formatCents } from '@/lib/money';

export const dynamic = 'force-dynamic';

export default async function FormOrdersPage({
    params,
    searchParams,
}: {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ status?: string; sku?: string; size?: string }>;
}) {
    const { id } = await params;
    const { status = '', sku = '', size = '' } = await searchParams;
    if (!isValidObjectId(id)) notFound();

    await connectDB();
    const form = await Form.findById(id).lean();
    if (!form) notFound();
    const team = await Team.findById(form.teamId).lean();

    const filter = buildOrderFilter({ formId: id, status, sku, size });
    const [orders, allOrders] = await Promise.all([
        Order.find(filter).sort({ createdAt: -1 }).lean(),
        Order.find({ formId: id }).lean(), // summary always covers the whole form
    ]);

    const summary = buildProductionSummary(toPlain(allOrders));
    const skus = [...new Set(allOrders.flatMap(o => o.lines.map(l => l.productSku)))].sort();
    const sizesInOrders = [...new Set(allOrders.flatMap(o => o.lines.map(l => l.sizeLabel)))].sort();
    const revenue = allOrders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.totalCents, 0);

    const exportBase = `/api/admin/forms/${id}/export`;
    const exportBtn = 'text-sm px-3 py-1.5 border border-slate-300 rounded-lg hover:bg-gray-100 whitespace-nowrap';

    return (
        <div className="p-6 space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                    <div>
                        <p className="text-sm text-gray-500">
                            <Link href="/admin/forms" className="hover:underline">Форми</Link> / {team?.name}
                        </p>
                        <h1 className="text-2xl font-semibold text-gray-900">{form.title}</h1>
                        <p className="text-gray-600 mt-1">
                            {allOrders.length} поръчки · оборот {formatCents(revenue)} (без отказаните)
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <a href={`${exportBase}?report=orders&format=csv`} className={exportBtn}>⬇ Поръчки CSV</a>
                        <a href={`${exportBase}?report=orders&format=xlsx`} className={exportBtn}>⬇ Поръчки XLSX</a>
                        <a href={`${exportBase}?report=summary&format=csv`} className={exportBtn}>⬇ Производство CSV</a>
                        <a href={`${exportBase}?report=summary&format=xlsx`} className={exportBtn}>⬇ Производство XLSX</a>
                    </div>
                </div>
            </div>

            {/* ── Production summary ── */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Производствена справка</h2>
                <p className="text-sm text-gray-500 mb-4">Общ брой по продукт и размер за цялата форма (без отказаните поръчки).</p>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200 text-gray-900">
                                <th className="py-2 px-4 text-left font-medium">Продукт</th>
                                {summary.sizes.map(s => (
                                    <th key={s} className="py-2 px-3 text-right font-medium">{s}</th>
                                ))}
                                <th className="py-2 px-4 text-right font-bold">Общо</th>
                            </tr>
                        </thead>
                        <tbody>
                            {summary.rows.map(row => (
                                <tr key={row.productSku + row.productName} className="border-b border-gray-100">
                                    <td className="py-2 px-4 text-gray-900">
                                        <span className="font-medium">{row.productName}</span>{' '}
                                        <span className="text-xs text-gray-400 font-mono">{row.productSku}</span>
                                    </td>
                                    {summary.sizes.map(s => (
                                        <td key={s} className="py-2 px-3 text-right text-gray-700">
                                            {row.bySize[s] ?? <span className="text-gray-300">·</span>}
                                        </td>
                                    ))}
                                    <td className="py-2 px-4 text-right font-bold text-gray-900">{row.total}</td>
                                </tr>
                            ))}
                            {summary.rows.length > 0 && (
                                <tr className="bg-gray-50 font-bold text-gray-900">
                                    <td className="py-2 px-4">ОБЩО</td>
                                    {summary.sizes.map(s => (
                                        <td key={s} className="py-2 px-3 text-right">
                                            {summary.rows.reduce((sum, r) => sum + (r.bySize[s] ?? 0), 0) || ''}
                                        </td>
                                    ))}
                                    <td className="py-2 px-4 text-right">{summary.grandTotal}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    {summary.rows.length === 0 && (
                        <p className="text-center text-gray-500 py-6">Все още няма поръчки.</p>
                    )}
                </div>
            </div>

            {/* ── Orders ── */}
            <div className="bg-white rounded-lg shadow-sm">
                <div className="p-4 border-b border-gray-200 flex flex-wrap items-center gap-2">
                    <form className="flex flex-wrap items-center gap-2">
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
                            {skus.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <select name="size" defaultValue={size} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                            <option value="">Всички размери</option>
                            {sizesInOrders.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <button type="submit" className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                            Филтрирай
                        </button>
                    </form>
                </div>
                <OrdersTable orders={toPlain<OrderRowData[]>(orders)} />
            </div>
        </div>
    );
}
