import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Types } from 'mongoose';
import connectDB from '@/lib/db';
import OrderAccess from '@/models/OrderAccess';
import Order from '@/models/Order';
import Form from '@/models/Form';
import Team from '@/models/Team';
import { formatCents } from '@/lib/money';
import { ORDER_ACCESS_COOKIE, verifyOrderAccessToken } from '@/lib/orderAccessToken';
import { logoutOrderAccess } from '@/app/order-access/actions';

export const dynamic = 'force-dynamic';

const STATUS_LABELS: Record<string, string> = {
    submitted: 'подадена',
    confirmed: 'потвърдена',
    in_production: 'в производство',
    delivered: 'доставена',
    cancelled: 'отказана',
};

function formatDate(d: Date | string): string {
    const date = new Date(d);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`;
}

/** Orders shared with a coach's email (entered via /order-access). */
export default async function MyOrdersPage() {
    const cookieStore = await cookies();
    const email = verifyOrderAccessToken(cookieStore.get(ORDER_ACCESS_COOKIE)?.value);
    if (!email) redirect('/order-access');

    await connectDB();
    const grants = await OrderAccess.find({ email, revoked: false }).lean();
    const orderIds = grants.map(g => g.orderId as Types.ObjectId);
    const orders = await Order.find({ _id: { $in: orderIds } }).sort({ createdAt: -1 }).lean();
    const forms = await Form.find({ _id: { $in: orders.map(o => o.formId) } }).select('title teamId').lean();
    const formById = new Map(forms.map(f => [String(f._id), f]));
    const teams = await Team.find({ _id: { $in: forms.map(f => f.teamId) } }).select('name').lean();
    const teamById = new Map(teams.map(t => [String(t._id), t.name]));

    return (
        <div className="modernist min-h-screen" style={{ background: 'var(--color-neutral-200)' }}>
            <div className="mx-auto w-full max-w-[760px] min-h-screen shadow-[var(--shadow-md)]" style={{ background: 'var(--color-bg)' }}>
                <div className="nav" style={{ padding: '12px 20px' }}>
                    <span className="flex items-center" style={{ marginRight: 'auto' }}>
                        <h3alth-logo mode="idle" height="32" idle-every="8" />
                    </span>
                    <span className="text-muted" style={{ fontSize: 12 }}>{email}</span>
                    <form
                        action={async () => {
                            'use server';
                            await logoutOrderAccess();
                            redirect('/order-access');
                        }}
                    >
                        <button type="submit" className="btn btn-secondary" style={{ fontSize: 12, padding: '4px 10px' }}>Изход</button>
                    </form>
                </div>

                <div style={{ padding: '24px 20px 40px' }}>
                    <h6>Вашите поръчки</h6>
                    <h3 style={{ marginBottom: 20 }}>Преглед на поръчки</h3>

                    {orders.length === 0 && (
                        <p className="text-muted" style={{ fontSize: 14 }}>
                            Няма активни поръчки за този имейл. Свържете се с KHealth, ако очаквате достъп.
                        </p>
                    )}

                    <div className="flex flex-col gap-5">
                        {orders.map(order => {
                            const form = formById.get(String(order.formId));
                            const teamName = form ? teamById.get(String(form.teamId)) : undefined;
                            return (
                                <div
                                    key={String(order._id)}
                                    style={{ border: '1px solid var(--color-divider)', borderLeft: `8px solid var(--status-${order.status})` }}
                                >
                                    <div
                                        className="flex flex-wrap items-center justify-between gap-2"
                                        style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-divider)' }}
                                    >
                                        <div>
                                            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 17 }}>
                                                {order.reference}
                                            </span>
                                            <span className="text-muted" style={{ display: 'block', fontSize: 12 }}>
                                                {teamName}{form ? ` · ${form.title}` : ''} · {formatDate(order.createdAt as Date)}
                                            </span>
                                        </div>
                                        <span className="status-block" data-status={order.status} style={{ fontSize: 13 }}>
                                            {STATUS_LABELS[order.status] ?? order.status}
                                        </span>
                                    </div>

                                    <div style={{ padding: '10px 16px' }}>
                                        <p className="text-muted" style={{ fontSize: 12.5, margin: '0 0 8px' }}>
                                            Клиент: <strong style={{ color: 'var(--color-text)' }}>{order.member.fullName}</strong>
                                        </p>
                                        {order.lines.map((line, i) => {
                                            const personalization = Object.values(
                                                (line.personalization as unknown as Record<string, string>) ?? {}
                                            ).join(' · ');
                                            return (
                                                <div
                                                    key={i}
                                                    className="flex items-baseline justify-between gap-3"
                                                    style={{ padding: '7px 0', borderBottom: '1px solid var(--color-divider)', fontSize: 14 }}
                                                >
                                                    <span>
                                                        <strong>{line.quantity}×</strong> {line.productName}{' '}
                                                        <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, background: 'var(--color-surface)', padding: '0 6px' }}>
                                                            {line.sizeLabel}
                                                        </span>
                                                        {personalization && (
                                                            <span style={{ color: 'var(--color-accent-700)', fontWeight: 600 }}> — {personalization}</span>
                                                        )}
                                                    </span>
                                                    <span className="whitespace-nowrap" style={{ fontWeight: 600 }}>
                                                        {formatCents(line.unitPriceCents * line.quantity)}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                        <div className="flex items-center justify-between" style={{ padding: '10px 0 4px' }}>
                                            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800 }}>Общо</span>
                                            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800 }}>
                                                {formatCents(order.totalCents)}
                                                <span className={`tag ${order.paymentStatus === 'paid' ? 'tag-good' : 'tag-ink'}`} style={{ marginLeft: 10 }}>
                                                    {order.paymentStatus === 'paid' ? 'платена' : 'неплатена'}
                                                </span>
                                            </span>
                                        </div>
                                        {order.notes && (
                                            <p className="text-muted" style={{ fontSize: 12.5, margin: '4px 0 0' }}>Бележка: {order.notes}</p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
