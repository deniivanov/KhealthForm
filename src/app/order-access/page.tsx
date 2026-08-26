'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { loginWithAccessCode } from '@/app/order-access/actions';

export default function OrderAccessPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            const result = await loginWithAccessCode(email, code);
            if (!result.ok) {
                setError(
                    result.error === 'rate_limited'
                        ? 'Твърде много опити. Опитайте отново след 15 минути.'
                        : 'Невалиден имейл или код.'
                );
                return;
            }
            router.push('/my-orders');
            router.refresh();
        } catch {
            setError('Възникна грешка. Опитайте отново.');
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
                <h6>За треньори и клубове</h6>
                <h3 style={{ marginBottom: 8 }}>Преглед на поръчка</h3>
                <p className="text-muted" style={{ fontSize: 13, marginBottom: 20 }}>
                    Въведете имейла си и 6-цифрения код, който получихте от KHealth.
                </p>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="field">
                        <label>Имейл</label>
                        <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
                    </div>
                    <div className="field">
                        <label>Код за достъп</label>
                        <input
                            className="input"
                            value={code}
                            onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            required
                            inputMode="numeric"
                            placeholder="6 цифри"
                            style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 22, letterSpacing: '0.35em', textAlign: 'center' }}
                        />
                    </div>
                    {error && <p className="field-error" style={{ margin: 0 }}>{error}</p>}
                    <button type="submit" disabled={submitting || code.length !== 6} className="btn btn-primary btn-block" style={{ minHeight: 44 }}>
                        {submitting ? 'Проверка…' : 'Виж поръчката'}
                    </button>
                </form>
                <p className="text-muted" style={{ fontSize: 13, marginTop: 16 }}>
                    Нямате код? Свържете се с KHealth.{' '}
                    <Link href="/" style={{ color: 'var(--color-accent-700)' }}>Начало</Link>
                </p>
            </div>
        </div>
    );
}
