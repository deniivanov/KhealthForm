import Link from 'next/link';
import connectDB from '@/lib/db';
import Form from '@/models/Form';
import Team from '@/models/Team';
import Order from '@/models/Order';
import { toPlain } from '@/lib/serialize';
import FormRowActions from '@/components/admin/FormRowActions';

export const dynamic = 'force-dynamic';

interface FormRow {
    _id: string;
    teamId: string;
    title: string;
    slug: string;
    status: 'draft' | 'open' | 'closed';
    opensAt?: string;
    closesAt?: string;
    items: unknown[];
    createdAt: string;
}

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
    draft: { label: 'чернова', cls: 'bg-gray-100 text-gray-600' },
    open: { label: 'отворена', cls: 'bg-green-100 text-green-700' },
    closed: { label: 'затворена', cls: 'bg-red-100 text-red-700' },
};

function formatDate(iso?: string): string {
    if (!iso) return '';
    const d = new Date(iso);
    return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
}

export default async function FormsPage({
    searchParams,
}: {
    searchParams: Promise<{ team?: string; status?: string }>;
}) {
    const { team: teamFilter = '', status: statusFilter = '' } = await searchParams;

    await connectDB();
    const filter: Record<string, unknown> = {};
    if (teamFilter) filter.teamId = teamFilter;
    if (statusFilter) filter.status = statusFilter;

    const [formsRaw, teamsRaw, orderCounts] = await Promise.all([
        Form.find(filter).sort({ createdAt: -1 }).limit(200).lean(),
        Team.find().sort({ name: 1 }).lean(),
        Order.aggregate<{ _id: unknown; count: number }>([
            { $group: { _id: '$formId', count: { $sum: 1 } } },
        ]),
    ]);
    const forms = toPlain<FormRow[]>(formsRaw);
    const teams = toPlain<{ _id: string; name: string; slug: string }[]>(teamsRaw);
    const teamById = new Map(teams.map(t => [t._id, t]));
    const ordersByForm = new Map(orderCounts.map(c => [String(c._id), c.count]));

    return (
        <div className="p-6">
            <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">Форми</h1>
                        <p className="text-gray-600 mt-1">{forms.length} форми</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <form className="flex items-center gap-2">
                            <select name="team" defaultValue={teamFilter} className="px-3 py-2 border border-gray-300 rounded-lg">
                                <option value="">Всички отбори</option>
                                {teams.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                            </select>
                            <select name="status" defaultValue={statusFilter} className="px-3 py-2 border border-gray-300 rounded-lg">
                                <option value="">Всички статуси</option>
                                <option value="draft">чернова</option>
                                <option value="open">отворена</option>
                                <option value="closed">затворена</option>
                            </select>
                            <button type="submit" className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                                Филтрирай
                            </button>
                        </form>
                        <Link
                            href="/admin/forms/new"
                            className="px-4 py-2 bg-yellow-400 text-slate-800 font-bold rounded-lg hover:bg-yellow-500 whitespace-nowrap"
                        >
                            + Нова форма
                        </Link>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200 text-left text-gray-900">
                                <th className="py-3 px-6 font-medium">Форма</th>
                                <th className="py-3 px-6 font-medium">Отбор</th>
                                <th className="py-3 px-6 font-medium">Статус</th>
                                <th className="py-3 px-6 font-medium">Период</th>
                                <th className="py-3 px-6 font-medium">Продукти</th>
                                <th className="py-3 px-6 font-medium">Поръчки</th>
                                <th className="py-3 px-6 font-medium">Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            {forms.map(f => {
                                const team = teamById.get(f.teamId);
                                const badge = STATUS_BADGE[f.status];
                                const publicPath = team ? `/f/${team.slug}/${f.slug}` : null;
                                return (
                                    <tr key={f._id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="py-3 px-6">
                                            <Link href={`/admin/forms/${f._id}`} className="font-medium text-gray-900 hover:underline">
                                                {f.title}
                                            </Link>
                                            {publicPath && (
                                                <div className="text-xs text-gray-400 font-mono mt-1">
                                                    <a href={publicPath} target="_blank" className="hover:text-blue-600">{publicPath}</a>
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-3 px-6 text-gray-600">{team?.name ?? '—'}</td>
                                        <td className="py-3 px-6">
                                            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${badge.cls}`}>{badge.label}</span>
                                        </td>
                                        <td className="py-3 px-6 text-sm text-gray-600">
                                            {f.opensAt || f.closesAt
                                                ? `${formatDate(f.opensAt) || '…'} – ${formatDate(f.closesAt) || '…'}`
                                                : '—'}
                                        </td>
                                        <td className="py-3 px-6 text-gray-600">{f.items.length}</td>
                                        <td className="py-3 px-6 text-gray-600">
                                            <Link href={`/admin/forms/${f._id}/orders`} className="text-blue-700 hover:underline">
                                                {ordersByForm.get(f._id) ?? 0}
                                            </Link>
                                        </td>
                                        <td className="py-3 px-6">
                                            <FormRowActions formId={f._id} status={f.status} />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {forms.length === 0 && (
                    <div className="text-center py-12 text-gray-500">Няма намерени форми</div>
                )}
            </div>
        </div>
    );
}
