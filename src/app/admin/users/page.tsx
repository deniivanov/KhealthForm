import connectDB from '@/lib/db';
import User, { type UserRole } from '@/models/User';
import { auth } from '@/auth';
import { toPlain } from '@/lib/serialize';
import UserRow from '@/components/admin/UserRow';

export const dynamic = 'force-dynamic';

interface UserRowData {
    _id: string;
    name?: string;
    email: string;
    role: UserRole;
    createdAt: string;
}

export default async function UsersPage() {
    const session = await auth();
    await connectDB();
    const users = toPlain<UserRowData[]>(
        await User.find().select('name email role createdAt').sort({ createdAt: -1 }).lean()
    );

    return (
        <div className="panel">
            <div className="page-head">
                <div>
                    <h6>Достъп</h6>
                    <h3 style={{ margin: 0 }}>Потребители</h3>
                    <p className="text-muted">
                        Нови регистрации пристигат „без права“ — тук им давате достъп
                        („производство“ вижда ТВ опашката) или ги изтривате.
                    </p>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Име</th>
                            <th>Имейл</th>
                            <th>Достъп</th>
                            <th>Регистриран</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                            <UserRow key={u._id} user={u} isSelf={u.email === session?.user?.email} />
                        ))}
                    </tbody>
                </table>
            </div>
            {users.length === 0 && <div className="empty"><p>Няма потребители.</p></div>}
        </div>
    );
}
