import Link from 'next/link';
import connectDB from '@/lib/db';
import Team from '@/models/Team';
import Form from '@/models/Form';
import { toPlain } from '@/lib/serialize';

export const dynamic = 'force-dynamic';

interface TeamRow {
    _id: string;
    name: string;
    slug: string;
    contactName?: string;
    email?: string;
    phone?: string;
    logoUrl?: string;
    brandColors?: { primary: string; secondary?: string };
}

function escapeRegex(input: string): string {
    return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export default async function TeamsPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string }>;
}) {
    const { q = '' } = await searchParams;

    await connectDB();
    const filter: Record<string, unknown> = {};
    if (q.trim()) {
        const rx = new RegExp(escapeRegex(q.trim()), 'i');
        filter.$or = [{ name: rx }, { slug: rx }, { contactName: rx }];
    }
    const teams = toPlain<TeamRow[]>(await Team.find(filter).sort({ name: 1 }).limit(200).lean());

    const formCounts = new Map<string, number>();
    const counts = await Form.aggregate<{ _id: unknown; count: number }>([
        { $group: { _id: '$teamId', count: { $sum: 1 } } },
    ]);
    for (const c of counts) formCounts.set(String(c._id), c.count);

    return (
        <div className="p-6">
            <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">Отбори</h1>
                        <p className="text-gray-600 mt-1">{teams.length} отбора</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <form className="flex items-center gap-2">
                            <input
                                type="text"
                                name="q"
                                defaultValue={q}
                                placeholder="Търсене..."
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button type="submit" className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                                Търси
                            </button>
                        </form>
                        <Link
                            href="/admin/teams/new"
                            className="px-4 py-2 bg-yellow-400 text-slate-800 font-bold rounded-lg hover:bg-yellow-500 whitespace-nowrap"
                        >
                            + Нов отбор
                        </Link>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200 text-left text-gray-900">
                                <th className="py-3 px-6 font-medium">Отбор</th>
                                <th className="py-3 px-6 font-medium">Slug</th>
                                <th className="py-3 px-6 font-medium">Контакт</th>
                                <th className="py-3 px-6 font-medium">Брандинг</th>
                                <th className="py-3 px-6 font-medium">Форми</th>
                            </tr>
                        </thead>
                        <tbody>
                            {teams.map(t => (
                                <tr key={t._id} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="py-3 px-6">
                                        <Link href={`/admin/teams/${t._id}`} className="flex items-center gap-3 font-medium text-gray-900 hover:underline">
                                            {t.logoUrl ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={t.logoUrl} alt="" className="w-8 h-8 rounded-full object-cover border border-gray-200" />
                                            ) : (
                                                <span className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                                                    {t.name.slice(0, 2).toUpperCase()}
                                                </span>
                                            )}
                                            {t.name}
                                        </Link>
                                    </td>
                                    <td className="py-3 px-6 font-mono text-sm text-gray-600">{t.slug}</td>
                                    <td className="py-3 px-6 text-gray-600">
                                        {t.contactName || '—'}
                                        {t.phone && <span className="text-gray-400"> · {t.phone}</span>}
                                    </td>
                                    <td className="py-3 px-6">
                                        {t.brandColors ? (
                                            <span className="inline-flex items-center gap-1">
                                                <span className="w-5 h-5 rounded-full border border-gray-300" style={{ backgroundColor: t.brandColors.primary }} />
                                                {t.brandColors.secondary && (
                                                    <span className="w-5 h-5 rounded-full border border-gray-300" style={{ backgroundColor: t.brandColors.secondary }} />
                                                )}
                                            </span>
                                        ) : (
                                            <span className="text-gray-400">—</span>
                                        )}
                                    </td>
                                    <td className="py-3 px-6 text-gray-600">{formCounts.get(t._id) ?? 0}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {teams.length === 0 && (
                    <div className="text-center py-12 text-gray-500">Няма намерени отбори</div>
                )}
            </div>
        </div>
    );
}
