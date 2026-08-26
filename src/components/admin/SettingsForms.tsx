'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { changeOwnPassword, changeOwnName } from '@/app/admin/settings/actions';

export const PasswordChangeForm = () => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [saved, setSaved] = useState(false);
    const [busy, setBusy] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrors({});
        setSaved(false);
        setBusy(true);
        try {
            const result = await changeOwnPassword({ currentPassword, newPassword, confirmPassword });
            if (!result.ok) {
                setErrors(result.errors);
                return;
            }
            setSaved(true);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch {
            setErrors({ _: 'Възникна грешка. Опитайте отново.' });
        } finally {
            setBusy(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" style={{ maxWidth: 420 }}>
            <div className="field">
                <label>Текуща парола</label>
                <input className="input" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required autoComplete="current-password" />
                {errors.currentPassword && <p className="field-error">{errors.currentPassword}</p>}
            </div>
            <div className="field">
                <label>Нова парола (поне 8 знака)</label>
                <input className="input" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={8} autoComplete="new-password" />
                {errors.newPassword && <p className="field-error">{errors.newPassword}</p>}
            </div>
            <div className="field">
                <label>Повторете новата парола</label>
                <input className="input" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required autoComplete="new-password" />
                {errors.confirmPassword && <p className="field-error">{errors.confirmPassword}</p>}
            </div>
            {errors._ && <p className="field-error" style={{ margin: 0 }}>{errors._}</p>}
            {saved && (
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#2e7d4f' }}>
                    ✓ Паролата е сменена. Използвайте новата при следващия вход.
                </p>
            )}
            <div>
                <button type="submit" disabled={busy} className="btn btn-primary" style={{ minHeight: 42 }}>
                    {busy ? 'Запазване…' : 'Смени паролата'}
                </button>
            </div>
        </form>
    );
};

export const NameChangeForm = ({ initialName }: { initialName: string }) => {
    const router = useRouter();
    const [name, setName] = useState(initialName);
    const [error, setError] = useState('');
    const [saved, setSaved] = useState(false);
    const [busy, setBusy] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setSaved(false);
        setBusy(true);
        try {
            const result = await changeOwnName(name);
            if (!result.ok) {
                setError(result.errors.name || result.errors._ || 'Грешка');
                return;
            }
            setSaved(true);
            router.refresh();
        } catch {
            setError('Възникна грешка. Опитайте отново.');
        } finally {
            setBusy(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3" style={{ maxWidth: 420 }}>
            <div className="field" style={{ flex: 1, minWidth: 220 }}>
                <label>Име</label>
                <input className="input" value={name} onChange={e => setName(e.target.value)} required />
                {error && <p className="field-error">{error}</p>}
            </div>
            <button type="submit" disabled={busy} className="btn btn-secondary" style={{ minHeight: 38 }}>
                {busy ? '…' : 'Запази'}
            </button>
            {saved && <span style={{ fontSize: 13, fontWeight: 600, color: '#2e7d4f' }}>✓</span>}
        </form>
    );
};
