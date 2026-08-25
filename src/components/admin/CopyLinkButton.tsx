'use client';
import React, { useState } from 'react';

/** Copies the absolute public URL for a form; shows brief confirmation. */
const CopyLinkButton = ({ path, small = false }: { path: string; small?: boolean }) => {
    const [copied, setCopied] = useState(false);

    const copy = async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await navigator.clipboard.writeText(`${window.location.origin}${path}`);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
        } catch {
            // clipboard unavailable — show the URL so it can be copied manually
            window.prompt('Копирайте линка:', `${window.location.origin}${path}`);
        }
    };

    return (
        <button
            type="button"
            className="btn btn-secondary"
            onClick={copy}
            style={{ padding: small ? '3px 10px' : '5px 12px', fontSize: small ? 12 : 13, whiteSpace: 'nowrap' }}
            title="Копирай линка за споделяне с отбора"
        >
            {copied ? '✓ Копирано' : 'Копирай линк'}
        </button>
    );
};

export default CopyLinkButton;
