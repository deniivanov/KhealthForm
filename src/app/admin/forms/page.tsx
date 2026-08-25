import Link from 'next/link';
import connectDB from '@/lib/db';
import Form from '@/models/Form';
import Team from '@/models/Team';
import Order from '@/models/Order';
import { toPlain } from '@/lib/serialize';
import FormRowActions from '@/components/admin/FormRowActions';
import CopyLinkButton from '@/components/admin/CopyLinkButton';

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
    draft: { label: 'чернова', cls: 'tag tag-ink' },
    open: { label: 'отворена', cls: 'tag tag-good' },
    closed: { label: 'затворена', cls: 'tag tag-bad' },
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
        <div className="panel">
            <div className="page-head">
                <div>
                    <h6>Кампании</h6>
                    <h3 style={{ margin: 0 }}>Форми</h3>
                    <p className="text-muted">
                        Всяка форма е отделен линк за поръчки, който изпращате на отбора.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <form className="flex flex-wrap items-center gap-2">
                        <select name="team" defaultValue={teamFilter} className="input" style={{ width: 180 }}>
                            <option value="">Всички отбори</option>
                            {teams.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                        </select>
                        <select name="status" defaultValue={statusFilter} className="input" style={{ width: 150 }}>
                            <option value="">Всички статуси</option>
                            <option value="draft">чернова</option>
                            <option value="open">отворена</option>
                            <option value="closed">затворена</option>
                        </select>
                        <button type="submit" className="btn btn-secondary">Филтрирай</button>
                    </form>
                    <Link href="/admin/forms/new" className="btn btn-primary whitespace-nowrap">
                        + Нова форма
                    </Link>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Форма</th>
                            <th>Отбор</th>
                            <th>Статус</th>
                            <th>Период</th>
                            <th>Продукти</th>
                            <th>Поръчки</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {forms.map(f => {
                            const team = teamById.get(f.teamId);
                            const badge = STATUS_BADGE[f.status];
                            const publicPath = team ? `/f/${team.slug}/${f.slug}` : null;
                            return (
                                <tr key={f._id}>
                                    <td>
                                        <Link href={`/admin/forms/${f._id}`} className="row-link">
                                            {f.title}
                                        </Link>
                                        {publicPath && (
                                            <div className="flex items-center gap-2 flex-wrap" style={{ marginTop: 4 }}>
                                                <span
                                                    className="text-muted"
                                                    style={{ fontSize: 11, fontFamily: 'monospace' }}
                                                >
                                                    {publicPath}
                                                </span>
                                                <CopyLinkButton path={publicPath} small />
                                            </div>
                                        )}
                                    </td>
                                    <td className="text-muted">{team?.name ?? '—'}</td>
                                    <td>
                                        <span className={badge.cls}>{badge.label}</span>
                                    </td>
                                    <td className="text-muted">
                                        {f.opensAt || f.closesAt
                                            ? `${formatDate(f.opensAt) || '…'} – ${formatDate(f.closesAt) || '…'}`
                                            : '—'}
                                    </td>
                                    <td className="text-muted">{f.items.length}</td>
                                    <td>
                                        <Link
                                            href={`/admin/forms/${f._id}/orders`}
                                            className="row-link"
                                            style={{ textDecoration: 'underline', textUnderlineOffset: 2 }}
                                        >
                                            {ordersByForm.get(f._id) ?? 0}
                                        </Link>
                                    </td>
                                    <td>
                                        <FormRowActions formId={f._id} status={f.status} />
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {forms.length === 0 && (
                <div className="empty">
                    <p>
                        {teamFilter || statusFilter
                            ? 'Няма форми, отговарящи на избраните филтри.'
                            : 'Все още няма форми.'}
                    </p>
                    <Link href="/admin/forms/new" className="btn btn-primary">Създай първата форма</Link>
                </div>
            )}
        </div>
    );
}
