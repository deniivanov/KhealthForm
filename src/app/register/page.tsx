'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { registerUser } from '@/app/register/actions';

export default function RegisterPage() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrors({});
        setSubmitting(true);
        try {
            const result = await registerUser({ name, email, password });
            if (!result.ok) {
                setErrors(result.errors);
                return;
            }
            // sign straight in with the new credentials
            const login = await signIn('credentials', { email, password, redirect: false });
            if (login?.error) {
                router.push('/login');
                return;
            }
            router.push('/account');
            router.refresh();
        } catch {
            setErrors({ _: 'Възникна грешка. Опитайте отново.' });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="modernist min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--color-neutral-200)' }}>
            <div className="w-full max-w-[400px] panel elev-md" style={{ padding: '28px 24px 24px' }}>
                <div style={{ marginBottom: 16 }}>
                    <h3alth-logo mode="both" height="40" idle-every="6" />
                </div>
                <h6>Нов профил</h6>
                <h3 style={{ marginBottom: 8 }}>Регистрация</h3>
                <p className="text-muted" style={{ fontSize: 13, marginBottom: 20 }}>
                    Профилът дава достъп след одобрение от администратор на KHealth.
                </p>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="field">
                        <label>Име и фамилия</label>
                        <input className="input" value={name} onChange={e => setName(e.target.value)} required autoComplete="name" />
                        {errors.name && <p className="field-error">{errors.name}</p>}
                    </div>
                    <div className="field">
                        <label>Имейл</label>
                        <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
                        {errors.email && <p className="field-error">{errors.email}</p>}
                    </div>
                    <div className="field">
                        <label>Парола (поне 8 знака)</label>
                        <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="new-password" minLength={8} />
                        {errors.password && <p className="field-error">{errors.password}</p>}
                    </div>
                    {errors._ && <p className="field-error" style={{ margin: 0 }}>{errors._}</p>}
                    <button type="submit" disabled={submitting} className="btn btn-primary btn-block" style={{ minHeight: 44 }}>
                        {submitting ? 'Създаване…' : 'Създай профил'}
                    </button>
                </form>
                <p className="text-muted" style={{ fontSize: 13, marginTop: 16 }}>
                    Вече имате профил?{' '}
                    <Link href="/login" style={{ color: 'var(--color-accent-700)' }}>Вход</Link>
                    {' · '}
                    Имате код за поръчка?{' '}
                    <Link href="/order-access" style={{ color: 'var(--color-accent-700)' }}>Преглед на поръчка</Link>
                </p>
            </div>
        </div>
    );
}
