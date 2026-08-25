import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import connectDB from '@/lib/db';
import Team from '@/models/Team';
import Form from '@/models/Form';
import { isFormAcceptingOrders } from '@/lib/orders';
import { getDictionary } from '@/lib/i18n';
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

export default async function PublicFormPage({ params, searchParams }: PageProps) {
    const { teamSlug, formSlug } = await params;
    const { lang } = await searchParams;
    const { locale, dict } = getDictionary(lang);

    await connectDB();
    const team = await Team.findOne({ slug: teamSlug }).lean();
    if (!team) notFound();
    const form = await Form.findOne({ slug: formSlug, teamId: team._id }).lean();
    if (!form) notFound();

    const brand = team.brandColors?.primary ?? '#facc15';
    const brandSecondary = team.brandColors?.secondary ?? brand;
    const brandStyle = {
        '--brand': brand,
        '--brand-2': brandSecondary,
    } as React.CSSProperties;

    const langToggle = (
        <div className="text-center text-sm mt-6 pb-8 text-slate-400">
            <Link href={`?lang=${locale === 'bg' ? 'en' : 'bg'}`} className="hover:underline">
                {locale === 'bg' ? 'English' : 'Български'}
            </Link>
        </div>
    );

    if (form.status === 'draft' || !isFormAcceptingOrders(form)) {
        const notOpenYet =
            form.status === 'open' && form.opensAt && new Date() < new Date(form.opensAt);
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6" style={brandStyle}>
                <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-slate-200 p-8 text-center">
                    {team.logoUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={team.logoUrl} alt={team.name} className="w-16 h-16 rounded-full object-cover mx-auto mb-4 border-2" style={{ borderColor: 'var(--brand)' }} />
                    )}
                    <h1 className="text-xl font-bold text-slate-800 mb-2">{team.name}</h1>
                    <p className="font-semibold text-slate-700 mb-4">{form.title}</p>
                    <div className="rounded-xl bg-slate-100 p-4">
                        <p className="font-bold text-slate-800 mb-1">{dict.formClosedTitle}</p>
                        <p className="text-sm text-slate-600">
                            {notOpenYet ? dict.formNotOpenYet : dict.formClosedBody}
                        </p>
                    </div>
                </div>
                {langToggle}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50" style={brandStyle}>
            <PublicOrderForm
                team={toPlain<PublicTeamData>(team)}
                form={toPlain<PublicFormData>(form)}
                locale={locale}
                dict={dict}
            />
            {langToggle}
        </div>
    );
}
