import Link from 'next/link';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import { formatCents } from '@/lib/money';
import { toPlain } from '@/lib/serialize';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 20;

function escapeRegex(input: string): string {
    return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

interface ProductRow {
    _id: string;
    sku: string;
    name: string;
    category: string;
    images: string[];
    basePriceCents: number;
    sizes: { label: string }[];
    isActive: boolean;
}

export default async function ProductsPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string; page?: string; archived?: string }>;
}) {
    const { q = '', page = '1', archived } = await searchParams;
    const showArchived = archived === '1';
    const pageNum = Math.max(1, parseInt(page, 10) || 1);

    await connectDB();
    const filter: Record<string, unknown> = {};
    if (!showArchived) filter.isActive = true;
    if (q.trim()) {
        const rx = new RegExp(escapeRegex(q.trim()), 'i');
        filter.$or = [{ name: rx }, { sku: rx }, { category: rx }];
    }

    const [total, products] = await Promise.all([
        Product.countDocuments(filter),
        Product.find(filter)
            .sort({ createdAt: -1 })
            .skip((pageNum - 1) * PAGE_SIZE)
            .limit(PAGE_SIZE)
            .lean(),
    ]);
    const rows = toPlain<ProductRow[]>(products);
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

    const query = (overrides: Record<string, string | undefined>) => {
        const params = new URLSearchParams();
        const merged = { q, archived, page: String(pageNum), ...overrides };
        for (const [k, v] of Object.entries(merged)) {
            if (v) params.set(k, v);
        }
        const s = params.toString();
        return s ? `?${s}` : '';
    };

    return (
        <div className="panel">
            <div className="page-head">
                <div>
                    <h6>Каталог</h6>
                    <h3 style={{ margin: 0 }}>Продукти</h3>
                    <p className="text-muted">{total} продукта — това е основният каталог, от който сглобявате формите.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <form className="flex items-center gap-2">
                        <input
                            type="text"
                            name="q"
                            defaultValue={q}
                            placeholder="Търсене…"
                            className="input"
                            style={{ width: 180 }}
                        />
                        {showArchived && <input type="hidden" name="archived" value="1" />}
                        <button type="submit" className="btn btn-secondary">Търси</button>
                    </form>
                    <Link
                        href={showArchived ? '/admin/products' : '/admin/products?archived=1'}
                        className="btn btn-ghost"
                        style={{ fontSize: 12 }}
                    >
                        {showArchived ? 'Скрий архивираните' : 'Покажи архивираните'}
                    </Link>
                    <Link href="/admin/products/new" className="btn btn-primary">+ Нов продукт</Link>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="table">
                    <thead>
                        <tr>
                            <th style={{ width: 56 }}></th>
                            <th>Продукт</th>
                            <th>Категория</th>
                            <th>Базова цена</th>
                            <th>Размери</th>
                            <th>Статус</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map(p => (
                            <tr key={p._id}>
                                <td>
                                    {p.images[0] ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={p.images[0]} alt="" style={{ width: 40, height: 40, objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ width: 40, height: 40, background: 'var(--color-surface)' }} />
                                    )}
                                </td>
                                <td>
                                    <Link href={`/admin/products/${p._id}`} className="row-link">{p.name}</Link>
                                    <span className="text-muted" style={{ display: 'block', fontSize: 11, fontFamily: 'monospace' }}>{p.sku}</span>
                                </td>
                                <td className="text-muted">{p.category}</td>
                                <td style={{ fontWeight: 600 }}>{formatCents(p.basePriceCents)}</td>
                                <td className="text-muted">{p.sizes.map(s => s.label).join(', ')}</td>
                                <td>
                                    {p.isActive ? (
                                        <span className="tag tag-good">активен</span>
                                    ) : (
                                        <span className="tag tag-ink">архивиран</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {rows.length === 0 && (
                <div className="empty">
                    <p>{q ? 'Няма продукти, отговарящи на търсенето.' : 'Все още няма продукти.'}</p>
                    {!q && <Link href="/admin/products/new" className="btn btn-primary">Създай първия продукт</Link>}
                </div>
            )}

            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3" style={{ padding: '14px 0' }}>
                    {pageNum > 1 && (
                        <Link href={query({ page: String(pageNum - 1) })} className="btn btn-secondary">← Предишна</Link>
                    )}
                    <span className="text-muted" style={{ fontSize: 13 }}>стр. {pageNum} от {totalPages}</span>
                    {pageNum < totalPages && (
                        <Link href={query({ page: String(pageNum + 1) })} className="btn btn-secondary">Следваща →</Link>
                    )}
                </div>
            )}
        </div>
    );
}
