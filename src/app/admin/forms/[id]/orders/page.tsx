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

    return (
        <div className="flex flex-col gap-6">
            {/* ── Header ── */}
            <div className="panel">
                <div className="page-head">
                    <div>
                        <p className="text-muted" style={{ margin: '0 0 2px', fontSize: 13 }}>
                            <Link href="/admin/forms" className="underline underline-offset-2">Форми</Link> / {team?.name}
                        </p>
                        <h3 style={{ margin: 0 }}>{form.title}</h3>
                        <p className="text-muted">
                            {allOrders.length} поръчки · оборот {formatCents(revenue)} (без отказаните)
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <a href={`${exportBase}?report=production&format=xlsx`} className="btn btn-primary whitespace-nowrap" title="Количества + списък с персонализации, без цени и контакти">
                            ⬇ За производство (XLSX)
                        </a>
                        <a href={`${exportBase}?report=admin&format=xlsx`} className="btn btn-primary whitespace-nowrap" title="Пълен списък с контакти, цени и плащания + обобщение">
                            ⬇ За администрация (XLSX)
                        </a>
                        <a href={`${exportBase}?report=production&format=csv`} className="btn btn-ghost whitespace-nowrap" style={{ fontSize: 12 }}>CSV</a>
                        <a href={`${exportBase}?report=admin&format=csv`} className="btn btn-ghost whitespace-nowrap" style={{ fontSize: 12 }}>CSV (адм.)</a>
                    </div>
                </div>
            </div>

            {/* ── Production summary ── */}
            <div className="panel">
                <div style={{ padding: '20px 16px 12px' }}>
                    <h6 style={{ margin: 0 }}>Производствена справка</h6>
                    <p className="text-muted" style={{ margin: '4px 0 0', fontSize: 13 }}>
                        Общ брой по продукт и размер за цялата форма (без отказаните поръчки).
                    </p>
                </div>
                <div className="overflow-x-auto">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Продукт</th>
                                {summary.sizes.map(s => (
                                    <th key={s} style={{ textAlign: 'right' }}>{s}</th>
                                ))}
                                <th style={{ textAlign: 'right' }}>Общо</th>
                            </tr>
                        </thead>
                        <tbody>
                            {summary.rows.map(row => (
                                <tr key={row.productSku + row.productName}>
                                    <td>
                                        <span style={{ fontWeight: 600 }}>{row.productName}</span>{' '}
                                        <span className="text-muted" style={{ fontFamily: 'monospace', fontSize: 11 }}>{row.productSku}</span>
                                    </td>
                                    {summary.sizes.map(s => (
                                        <td key={s} style={{ textAlign: 'right' }}>
                                            {row.bySize[s] ?? <span className="text-muted">·</span>}
                                        </td>
                                    ))}
                                    <td style={{ textAlign: 'right', fontWeight: 700 }}>{row.total}</td>
                                </tr>
                            ))}
                            {summary.rows.length > 0 && (
                                <tr style={{ fontWeight: 700 }}>
                                    <td style={{ borderTop: '2px solid var(--color-divider)' }}>ОБЩО</td>
                                    {summary.sizes.map(s => (
                                        <td key={s} style={{ textAlign: 'right', borderTop: '2px solid var(--color-divider)' }}>
                                            {summary.rows.reduce((sum, r) => sum + (r.bySize[s] ?? 0), 0) || ''}
                                        </td>
                                    ))}
                                    <td style={{ textAlign: 'right', borderTop: '2px solid var(--color-divider)' }}>{summary.grandTotal}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    {summary.rows.length === 0 && (
                        <div className="empty"><p>Все още няма поръчки.</p></div>
                    )}
                </div>
            </div>

            {/* ── Orders ── */}
            <div className="panel">
                <div
                    className="flex flex-wrap items-center gap-2"
                    style={{ padding: '14px 16px', borderBottom: '2px solid var(--color-divider)' }}
                >
                    <form className="flex flex-wrap items-center gap-2">
                        <select name="status" defaultValue={status} className="input" style={{ width: 150 }}>
                            <option value="">Всички статуси</option>
                            <option value="submitted">подадена</option>
                            <option value="confirmed">потвърдена</option>
                            <option value="in_production">в производство</option>
                            <option value="delivered">доставена</option>
                            <option value="cancelled">отказана</option>
                        </select>
                        <select name="sku" defaultValue={sku} className="input" style={{ width: 150 }}>
                            <option value="">Всички продукти</option>
                            {skus.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <select name="size" defaultValue={size} className="input" style={{ width: 140 }}>
                            <option value="">Всички размери</option>
                            {sizesInOrders.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <button type="submit" className="btn btn-secondary">Филтрирай</button>
                    </form>
                </div>
                <OrdersTable orders={toPlain<OrderRowData[]>(orders)} />
            </div>
        </div>
    );
}
