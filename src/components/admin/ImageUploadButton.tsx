'use client';
import React, { useRef, useState } from 'react';

/**
 * "Качи снимка" button: uploads the chosen file through /api/admin/upload
 * (server-side ImageKit proxy) and hands the resulting URL to the parent.
 */
const ImageUploadButton = ({
    onUploaded,
    label = 'Качи снимка',
}: {
    onUploaded: (url: string) => void;
    label?: string;
}) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');

    const handleFile = async (file: File) => {
        setBusy(true);
        setError('');
        try {
            const body = new FormData();
            body.append('file', file);
            const res = await fetch('/api/admin/upload', { method: 'POST', body });
            const data = await res.json().catch(() => null);
            if (!res.ok || !data?.success) {
                setError(data?.message || 'Качването не успя.');
                return;
            }
            onUploaded(data.url);
        } catch {
            setError('Качването не успя. Опитайте отново.');
        } finally {
            setBusy(false);
            if (inputRef.current) inputRef.current.value = '';
        }
    };

    return (
        <span className="inline-flex items-center gap-2">
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(file);
                }}
            />
            <button
                type="button"
                className="btn btn-secondary"
                disabled={busy}
                onClick={() => inputRef.current?.click()}
                style={{ fontSize: 13, padding: '5px 12px', whiteSpace: 'nowrap' }}
            >
                {busy ? 'Качване…' : `⬆ ${label}`}
            </button>
            {error && <span className="field-error" style={{ margin: 0 }}>{error}</span>}
        </span>
    );
};

export default ImageUploadButton;
