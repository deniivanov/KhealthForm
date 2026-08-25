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
            : '/admin/summary';
        router.push(target);
        router.refresh();
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
            <div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-slate-200 p-8">
                <h1 className="text-2xl font-bold text-slate-800 mb-6 text-center">Вход за администратор</h1>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Имейл</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="username"
                            className="w-full border-2 border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-slate-800 font-medium"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Парола</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete="current-password"
                            className="w-full border-2 border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-slate-800 font-medium"
                        />
                    </div>
                    {error && (
                        <p className="text-sm text-red-600 font-medium">{error}</p>
                    )}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3 rounded-lg font-bold text-base bg-yellow-400 text-slate-800 hover:bg-yellow-500 disabled:opacity-70 transition-all duration-200"
                    >
                        {isSubmitting ? 'Влизане...' : 'Вход'}
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
