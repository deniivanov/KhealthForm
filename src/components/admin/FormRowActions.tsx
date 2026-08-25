'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { setFormStatus, duplicateForm } from '@/app/admin/forms/actions';

const FormRowActions = ({ formId, status }: { formId: string; status: 'draft' | 'open' | 'closed' }) => {
    const router = useRouter();
    const [busy, setBusy] = useState(false);

    const run = async (fn: () => Promise<unknown>) => {
        setBusy(true);
        try {
            await fn();
            router.refresh();
        } finally {
            setBusy(false);
        }
    };

    const btnStyle: React.CSSProperties = { fontSize: 12, padding: '5px 10px', whiteSpace: 'nowrap' };

    return (
        <div className="flex items-center gap-2 whitespace-nowrap">
            {status !== 'open' && (
                <button
                    disabled={busy}
                    onClick={() => run(() => setFormStatus(formId, 'open'))}
                    className="btn btn-secondary"
                    style={{ ...btnStyle, color: '#2e7d4f' }}
                >
                    Отвори
                </button>
            )}
            {status === 'open' && (
                <button
                    disabled={busy}
                    onClick={() => run(() => setFormStatus(formId, 'closed'))}
                    className="btn btn-secondary"
                    style={{ ...btnStyle, color: 'var(--color-accent-700)' }}
                >
                    Затвори
                </button>
            )}
            <button
                disabled={busy}
                onClick={() =>
                    run(async () => {
                        const res = await duplicateForm(formId);
                        if (res.ok) router.push(`/admin/forms/${res.id}`);
                    })
                }
                className="btn btn-ghost"
                style={btnStyle}
            >
                Дублирай
            </button>
        </div>
    );
};

export default FormRowActions;
