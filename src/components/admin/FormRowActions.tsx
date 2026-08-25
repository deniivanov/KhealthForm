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

    const btn = 'text-sm px-3 py-1 rounded-lg border border-slate-300 hover:bg-gray-100 disabled:opacity-50';

    return (
        <div className="flex items-center gap-2 whitespace-nowrap">
            {status !== 'open' && (
                <button disabled={busy} onClick={() => run(() => setFormStatus(formId, 'open'))} className={`${btn} text-green-700 border-green-300`}>
                    Отвори
                </button>
            )}
            {status === 'open' && (
                <button disabled={busy} onClick={() => run(() => setFormStatus(formId, 'closed'))} className={`${btn} text-red-700 border-red-300`}>
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
                className={btn}
            >
                Дублирай
            </button>
        </div>
    );
};

export default FormRowActions;
