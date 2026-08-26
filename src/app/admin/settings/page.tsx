import { auth } from '@/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { PasswordChangeForm, NameChangeForm } from '@/components/admin/SettingsForms';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
    const session = await auth();
    await connectDB();
    const user = session?.user?.email
        ? await User.findOne({ email: session.user.email }).select('name email role').lean()
        : null;

    return (
        <div className="flex flex-col gap-6" style={{ maxWidth: 760 }}>
            <div>
                <h6>Профил</h6>
                <h3 style={{ margin: 0 }}>Настройки</h3>
            </div>

            <div className="panel">
                <div className="panel-head">
                    <h6>Данни за профила</h6>
                </div>
                <div className="flex flex-col gap-4" style={{ padding: 16 }}>
                    <div>
                        <span className="text-muted" style={{ display: 'block', fontSize: 12 }}>Имейл (потребителско име за вход)</span>
                        <span style={{ fontWeight: 600 }}>{user?.email}</span>
                    </div>
                    <NameChangeForm initialName={user?.name ?? ''} />
                </div>
            </div>

            <div className="panel">
                <div className="panel-head">
                    <h6>Смяна на паролата</h6>
                </div>
                <div style={{ padding: 16 }}>
                    <p className="text-muted" style={{ fontSize: 13, margin: '0 0 16px' }}>
                        Паролата се използва за вход в админ панела. Текущата сесия остава активна след смяната.
                    </p>
                    <PasswordChangeForm />
                </div>
            </div>
        </div>
    );
}
