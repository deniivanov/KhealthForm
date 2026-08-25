import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import connectDB from '@/lib/db';
import Team from '@/models/Team';
import Form from '@/models/Form';
import { isFormAcceptingOrders } from '@/lib/orders';
import { getDictionary, type Locale } from '@/lib/i18n';
import { toPlain } from '@/lib/serialize';
import PublicOrderForm, {
    type PublicFormData,
    type PublicTeamData,
} from '@/components/public/PublicOrderForm';

export const dynamic = 'force-dynamic';

// Token-protected URLs — keep them out of search engines
export const metadata: Metadata = { robots: { index: false, follow: false } };

interface PageProps {
    params: Promise<{ teamSlug: string; formSlug: string }>;
    searchParams: Promise<{ lang?: string }>;
}

function formatDeadline(date: Date | string, locale: Locale): string {
    return new Date(date).toLocaleDateString(locale === 'bg' ? 'bg-BG' : 'en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

export default async function PublicFormPage({ params, searchParams }: PageProps) {
    const { teamSlug, formSlug } = await params;
    const { lang } = await searchParams;
    const { locale, dict } = getDictionary(lang);

    await connectDB();
    const team = await Team.findOne({ slug: teamSlug }).lean();
    if (!team) notFound();
    const form = await Form.findOne({ slug: formSlug, teamId: team._id }).lean();
    if (!form) notFound();

    const brandStyle = {
        '--brand': team.brandColors?.primary ?? '#e0a400',
    } as React.CSSProperties;

    const langToggle = (
        <div className="text-center py-6">
            <Link
                href={`?lang=${locale === 'bg' ? 'en' : 'bg'}`}
                className="text-muted text-xs underline underline-offset-2"
            >
                {locale === 'bg' ? 'English' : 'Български'}
            </Link>
        </div>
    );

    if (form.status === 'draft' || !isFormAcceptingOrders(form)) {
        const notOpenYet =
            form.status === 'open' && form.opensAt && new Date() < new Date(form.opensAt);
        return (
            <div className="modernist min-h-screen" style={{ ...brandStyle, background: 'var(--color-neutral-200)' }}>
                <div className="elev-md mx-auto min-h-screen" style={{ maxWidth: 480, background: 'var(--color-bg)' }}>
                    <div style={{ paddingBottom: 40 }}>
                        <div className="nav">
                            <span className="nav-brand">{team.name}</span>
                        </div>
                        <div style={{ padding: '28px 20px' }}>
                            <h6>{dict.kicker}</h6>
                            <h2 style={{ marginBottom: 8 }}>
                                {notOpenYet ? dict.formNotOpenYet : dict.formClosedTitle}
                            </h2>
                            <p className="text-muted" style={{ fontSize: 13, marginBottom: 16 }}>
                                {notOpenYet
                                    ? dict.formClosedBody
                                    : form.closesAt
                                      ? `${dict.closedOn} ${formatDeadline(form.closesAt, locale)}. ${dict.missedDeadline}`
                                      : `${dict.formClosedBody} ${dict.missedDeadline}`}
                            </p>
                            <hr className="hr" />
                            {team.email && (
                                <span className="card-meta">
                                    {dict.questions} — {team.email}
                                </span>
                            )}
                        </div>
                    </div>
                    {langToggle}
                </div>
            </div>
        );
    }

    return (
        <div className="modernist min-h-screen" style={{ ...brandStyle, background: 'var(--color-neutral-200)' }}>
            <div className="elev-md mx-auto min-h-screen relative" style={{ maxWidth: 480, background: 'var(--color-bg)' }}>
                <PublicOrderForm
                    team={toPlain<PublicTeamData>(team)}
                    form={toPlain<PublicFormData>(form)}
                    locale={locale}
                    dict={dict}
                    deadline={form.closesAt ? formatDeadline(form.closesAt, locale) : null}
                />
                {langToggle}
            </div>
        </div>
    );
}
