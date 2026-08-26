import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth, signOut } from '@/auth';

export const dynamic = 'force-dynamic';

/** Role-aware landing after login/registration. */
export default async function AccountPage() {
    const session = await auth();
    if (!session?.user) redirect('/login');

    const role = session.user.role;
    if (role === 'admin') redirect('/admin');
    if (role === 'production') redirect('/production');

    return (
        <div className="modernist min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--color-neutral-200)' }}>
            <div className="w-full max-w-[440px] panel elev-md" style={{ padding: '28px 24px 24px' }}>
                <h6>Профил</h6>
                <h3 style={{ marginBottom: 8 }}>Здравейте!</h3>
                <p className="text-muted" style={{ fontSize: 14 }}>
                    Профилът <strong>{session.user.email}</strong> все още няма зададени права.
                    Свържете се с администратор на KHealth, за да ви бъде отключен достъп
                    (например за производствения екип).
                </p>
                <p className="text-muted" style={{ fontSize: 13 }}>
                    Ако сте треньор и имате 6-цифрен код за поръчка, използвайте{' '}
                    <Link href="/order-access" style={{ color: 'var(--color-accent-700)' }}>преглед на поръчка</Link>.
                </p>
                <form
                    action={async () => {
                        'use server';
                        await signOut({ redirectTo: '/login' });
                    }}
                    style={{ marginTop: 16 }}
                >
                    <button type="submit" className="btn btn-secondary">Изход</button>
                </form>
            </div>
        </div>
    );
}
