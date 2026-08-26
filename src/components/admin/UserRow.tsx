'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { setUserRole, deleteUser } from '@/app/admin/users/actions';
import type { UserRole } from '@/models/User';

const ROLE_LABELS: Record<UserRole, string> = {
    admin: 'администратор',
    production: 'производство',
    user: 'без права',
};

const UserRow = ({
    user,
    isSelf,
}: {
    user: { _id: string; name?: string; email: string; role: UserRole; createdAt: string };
    isSelf: boolean;
}) => {
    const router = useRouter();
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');

    const changeRole = async (role: UserRole) => {
        setBusy(true);
        setError('');
        try {
            const res = await setUserRole(user._id, role);
            if (!res.ok) setError(res.message);
            router.refresh();
        } finally {
            setBusy(false);
        }
    };

    const remove = async () => {
        if (!window.confirm(`Изтриване на профила на ${user.email}?`)) return;
        setBusy(true);
        setError('');
        try {
            const res = await deleteUser(user._id);
            if (!res.ok) setError(res.message);
            router.refresh();
        } finally {
            setBusy(false);
        }
    };

    const created = new Date(user.createdAt);
    const pad = (n: number) => String(n).padStart(2, '0');

    return (
        <tr>
            <td>
                <span style={{ fontWeight: 600 }}>{user.name || '—'}</span>
                {isSelf && <span className="tag tag-accent" style={{ marginLeft: 8 }}>вие</span>}
            </td>
            <td className="text-muted">{user.email}</td>
            <td>
                <select
                    className="tag-select"
                    value={user.role}
                    disabled={busy || isSelf}
                    onChange={e => changeRole(e.target.value as UserRole)}
                    title={isSelf ? 'Не може да променяте собствената си роля' : 'Смяна на достъпа'}
                >
                    {(Object.keys(ROLE_LABELS) as UserRole[]).map(r => (
                        <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                    ))}
                </select>
                {error && <p className="field-error">{error}</p>}
            </td>
            <td className="text-muted">{`${pad(created.getDate())}.${pad(created.getMonth() + 1)}.${created.getFullYear()}`}</td>
            <td>
                {!isSelf && (
                    <button onClick={remove} disabled={busy} className="btn btn-ghost" style={{ fontSize: 13 }} title="Изтрий профила">
                        ✕
                    </button>
                )}
            </td>
        </tr>
    );
};

export default UserRow;
