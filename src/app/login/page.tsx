'use client';
import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';

const LoginPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        const result = await signIn('credentials', {
            email,
            password,
            redirect: false,
        });

        setIsSubmitting(false);

        if (result?.error) {
            setError('Грешен имейл или парола.');
            return;
        }

        const callbackUrl = searchParams.get('callbackUrl');
        // Only allow relative redirects to avoid open-redirect abuse
        const target = callbackUrl && callbackUrl.startsWith('/') && !callbackUrl.startsWith('//')
            ? callbackUrl
            : '/admin';
        router.push(target);
        router.refresh();
    };

    return (
        <div className="modernist min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--color-neutral-200)' }}>
            <div className="w-full max-w-[400px] panel elev-md" style={{ padding: '28px 24px 24px' }}>
                <div style={{ marginBottom: 16 }}>
                    <h3alth-logo mode="both" height="40" idle-every="6" />
                </div>
                <h6>Админ панел</h6>
                <h3 style={{ marginBottom: 20 }}>Вход</h3>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="field">
                        <label>Имейл</label>
                        <input
                            className="input"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="username"
                        />
                    </div>
                    <div className="field">
                        <label>Парола</label>
                        <input
                            className="input"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete="current-password"
                        />
                    </div>
                    {error && <p className="field-error" style={{ margin: 0 }}>{error}</p>}
                    <button type="submit" disabled={isSubmitting} className="btn btn-primary btn-block" style={{ minHeight: 44 }}>
                        {isSubmitting ? 'Влизане…' : 'Влез'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default function Page() {
    return (
        <React.Suspense>
            <LoginPage />
        </React.Suspense>
    );
}
