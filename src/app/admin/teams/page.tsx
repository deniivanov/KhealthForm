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
        <div className="panel">
            <div className="page-head">
                <div>
                    <h6>Клиенти</h6>
                    <h3 style={{ margin: 0 }}>Отбори</h3>
                    <p className="text-muted">{teams.length} отбора — клиентите, за които създавате форми за поръчки.</p>
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
                        <button type="submit" className="btn btn-secondary">Търси</button>
                    </form>
                    <Link href="/admin/teams/new" className="btn btn-primary">+ Нов отбор</Link>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="table">
                    <thead>
                        <tr>
                            <th style={{ width: 56 }}></th>
                            <th>Отбор</th>
                            <th>Slug</th>
                            <th>Контакт</th>
                            <th>Брандинг</th>
                            <th>Форми</th>
                        </tr>
                    </thead>
                    <tbody>
                        {teams.map(t => (
                            <tr key={t._id}>
                                <td>
                                    {t.logoUrl ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={t.logoUrl} alt="" style={{ width: 40, height: 40, objectFit: 'cover' }} />
                                    ) : (
                                        <div
                                            className="flex items-center justify-center"
                                            style={{ width: 40, height: 40, background: 'var(--color-surface)', fontSize: 11, fontWeight: 700 }}
                                        >
                                            {t.name.slice(0, 2).toUpperCase()}
                                        </div>
                                    )}
                                </td>
                                <td>
                                    <Link href={`/admin/teams/${t._id}`} className="row-link">{t.name}</Link>
                                </td>
                                <td>
                                    <span className="text-muted" style={{ fontSize: 12, fontFamily: 'monospace' }}>{t.slug}</span>
                                </td>
                                <td className="text-muted">
                                    {t.contactName || '—'}
                                    {t.phone && <span> · {t.phone}</span>}
                                </td>
                                <td>
                                    {t.brandColors ? (
                                        <span className="inline-flex items-center gap-1">
                                            <span
                                                style={{
                                                    width: 18, height: 18, display: 'inline-block',
                                                    border: '1px solid var(--color-divider)',
                                                    backgroundColor: t.brandColors.primary,
                                                }}
                                            />
                                            {t.brandColors.secondary && (
                                                <span
                                                    style={{
                                                        width: 18, height: 18, display: 'inline-block',
                                                        border: '1px solid var(--color-divider)',
                                                        backgroundColor: t.brandColors.secondary,
                                                    }}
                                                />
                                            )}
                                        </span>
                                    ) : (
                                        <span className="text-muted">—</span>
                                    )}
                                </td>
                                <td className="text-muted">{formCounts.get(t._id) ?? 0}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {teams.length === 0 && (
                <div className="empty">
                    <p>{q ? 'Няма отбори, отговарящи на търсенето.' : 'Все още няма отбори.'}</p>
                    {!q && <Link href="/admin/teams/new" className="btn btn-primary">Създай първия отбор</Link>}
                </div>
            )}
        </div>
    );
}
