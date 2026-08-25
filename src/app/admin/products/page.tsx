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
        <div className="p-6">
            <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">Продукти</h1>
                        <p className="text-gray-600 mt-1">{total} продукта в каталога</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <form className="flex items-center gap-2">
                            <input
                                type="text"
                                name="q"
                                defaultValue={q}
                                placeholder="Търсене по име, SKU..."
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {showArchived && <input type="hidden" name="archived" value="1" />}
                            <button type="submit" className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                                Търси
                            </button>
                        </form>
                        <Link
                            href={showArchived ? '/admin/products' : '/admin/products?archived=1'}
                            className="text-sm text-gray-600 hover:text-gray-900 whitespace-nowrap"
                        >
                            {showArchived ? 'Скрий архивираните' : 'Покажи архивираните'}
                        </Link>
                        <Link
                            href="/admin/products/new"
                            className="px-4 py-2 bg-yellow-400 text-slate-800 font-bold rounded-lg hover:bg-yellow-500 whitespace-nowrap"
                        >
                            + Нов продукт
                        </Link>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200 text-left text-gray-900">
                                <th className="py-3 px-6 font-medium">SKU</th>
                                <th className="py-3 px-6 font-medium">Име</th>
                                <th className="py-3 px-6 font-medium">Категория</th>
                                <th className="py-3 px-6 font-medium">Базова цена</th>
                                <th className="py-3 px-6 font-medium">Размери</th>
                                <th className="py-3 px-6 font-medium">Статус</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map(p => (
                                <tr key={p._id} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="py-3 px-6">
                                        <Link href={`/admin/products/${p._id}`} className="font-mono text-sm text-blue-700 hover:underline">
                                            {p.sku}
                                        </Link>
                                    </td>
                                    <td className="py-3 px-6">
                                        <Link href={`/admin/products/${p._id}`} className="font-medium text-gray-900 hover:underline">
                                            {p.name}
                                        </Link>
                                    </td>
                                    <td className="py-3 px-6 text-gray-600">{p.category}</td>
                                    <td className="py-3 px-6 font-semibold text-gray-900">{formatCents(p.basePriceCents)}</td>
                                    <td className="py-3 px-6 text-gray-600">{p.sizes.map(s => s.label).join(', ')}</td>
                                    <td className="py-3 px-6">
                                        {p.isActive ? (
                                            <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded-full">активен</span>
                                        ) : (
                                            <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded-full">архивиран</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {rows.length === 0 && (
                    <div className="text-center py-12 text-gray-500">Няма намерени продукти</div>
                )}

                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 py-4">
                        {pageNum > 1 && (
                            <Link href={query({ page: String(pageNum - 1) })} className="px-3 py-1 border rounded hover:bg-gray-50">
                                ← Предишна
                            </Link>
                        )}
                        <span className="text-sm text-gray-600">
                            стр. {pageNum} от {totalPages}
                        </span>
                        {pageNum < totalPages && (
                            <Link href={query({ page: String(pageNum + 1) })} className="px-3 py-1 border rounded hover:bg-gray-50">
                                Следваща →
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
