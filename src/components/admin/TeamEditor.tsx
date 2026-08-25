'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { slugify } from '@/lib/slug';
import type { TeamInput } from '@/lib/validate/team';
import { createTeam, updateTeam } from '@/app/admin/teams/actions';
import type { ActionResult } from '@/app/admin/products/actions';
import ImageUploadButton from '@/components/admin/ImageUploadButton';

export interface SerializedTeam {
    _id: string;
    name: string;
    slug: string;
    contactName?: string;
    email?: string;
    phone?: string;
    notes?: string;
    logoUrl?: string;
    brandColors?: { primary: string; secondary?: string };
}

const ColorField = ({
    label,
    value,
    onChange,
    error,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    error?: string;
}) => (
    <div className="field">
        <label>{label}</label>
        <div className="flex items-center gap-2">
            <input
                type="color"
                value={/^#[0-9a-fA-F]{6}$/.test(value) ? value : '#1d4ed8'}
                onChange={e => onChange(e.target.value)}
                style={{
                    width: 36, height: 36, padding: 0, cursor: 'pointer',
                    border: '1px solid var(--color-divider)', borderRadius: 0,
                    background: 'var(--color-surface)',
                }}
                title="Избери цвят"
            />
            <input value={value} onChange={e => onChange(e.target.value)} className="input" placeholder="#1d4ed8" />
            {value && (
                <button type="button" onClick={() => onChange('')} className="btn btn-ghost" title="Изчисти">
                    ✕
                </button>
            )}
        </div>
        {error && <p className="field-error">{error}</p>}
    </div>
);

const TeamEditor = ({ initial }: { initial?: SerializedTeam }) => {
    const router = useRouter();
    const [name, setName] = useState(initial?.name ?? '');
    const [slug, setSlug] = useState(initial?.slug ?? '');
    const [slugTouched, setSlugTouched] = useState(Boolean(initial));
    const [contactName, setContactName] = useState(initial?.contactName ?? '');
    const [email, setEmail] = useState(initial?.email ?? '');
    const [phone, setPhone] = useState(initial?.phone ?? '');
    const [notes, setNotes] = useState(initial?.notes ?? '');
    const [logoUrl, setLogoUrl] = useState(initial?.logoUrl ?? '');
    const [brandPrimary, setBrandPrimary] = useState(initial?.brandColors?.primary ?? '');
    const [brandSecondary, setBrandSecondary] = useState(initial?.brandColors?.secondary ?? '');

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);

    const handleNameChange = (value: string) => {
        setName(value);
        if (!slugTouched) setSlug(slugify(value));
    };

    const handleSave = async () => {
        setSaving(true);
        setErrors({});
        const payload: TeamInput = {
            name, slug, contactName, email, phone, notes, logoUrl,
            brandPrimary, brandSecondary,
        };
        let result: ActionResult;
        try {
            result = initial ? await updateTeam(initial._id, payload) : await createTeam(payload);
        } catch {
            setErrors({ _: 'Възникна грешка при запазването.' });
            setSaving(false);
            return;
        }
        if (result.ok) {
            router.push('/admin/teams');
            router.refresh();
        } else {
            setErrors(result.errors);
            setSaving(false);
        }
    };

    return (
        <div className="flex flex-col gap-6" style={{ maxWidth: 760 }}>
            <div>
                <h6>Клиенти</h6>
                <h3 style={{ margin: 0 }}>{initial ? `Редакция: ${initial.name}` : 'Нов отбор'}</h3>
            </div>

            {errors._ && <p className="field-error" style={{ margin: 0 }}>{errors._}</p>}

            <div className="panel">
                <div className="panel-head">
                    <h6>Данни за отбора</h6>
                </div>
                <div className="flex flex-col gap-4" style={{ padding: 16 }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="field">
                            <label>Име на отбора *</label>
                            <input value={name} onChange={e => handleNameChange(e.target.value)} className="input" placeholder="FC Example" />
                            {errors.name && <p className="field-error">{errors.name}</p>}
                        </div>
                        <div className="field">
                            <label>Slug (адрес на формата) *</label>
                            <input
                                value={slug}
                                onChange={e => { setSlug(e.target.value); setSlugTouched(true); }}
                                className="input"
                                style={{ fontFamily: 'monospace' }}
                                placeholder="fc-example"
                            />
                            {errors.slug && <p className="field-error">{errors.slug}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="field">
                            <label>Лице за контакт</label>
                            <input value={contactName} onChange={e => setContactName(e.target.value)} className="input" />
                        </div>
                        <div className="field">
                            <label>Имейл</label>
                            <input value={email} onChange={e => setEmail(e.target.value)} className="input" type="email" />
                            {errors.email && <p className="field-error">{errors.email}</p>}
                        </div>
                        <div className="field">
                            <label>Телефон</label>
                            <input value={phone} onChange={e => setPhone(e.target.value)} className="input" />
                        </div>
                    </div>

                    <div className="field">
                        <label>Бележки</label>
                        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="input" />
                    </div>
                </div>
            </div>

            <div className="panel">
                <div className="panel-head">
                    <h6>Брандинг</h6>
                </div>
                <div className="flex flex-col gap-4" style={{ padding: 16 }}>
                    <p className="text-muted" style={{ fontSize: 13, margin: 0 }}>
                        Логото и цветовете се показват на публичната форма на отбора.
                    </p>

                    <div className="field">
                        <label>Лого</label>
                        <div className="flex items-center gap-3">
                            <input value={logoUrl} onChange={e => setLogoUrl(e.target.value)} className="input" placeholder="https://..." />
                            <ImageUploadButton label="Качи лого" onUploaded={setLogoUrl} />
                            {logoUrl && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={logoUrl}
                                    alt="лого"
                                    style={{ width: 48, height: 48, objectFit: 'cover', border: '1px solid var(--color-divider)', flexShrink: 0 }}
                                />
                            )}
                        </div>
                        {errors.logoUrl && <p className="field-error">{errors.logoUrl}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ColorField label="Основен цвят" value={brandPrimary} onChange={setBrandPrimary} error={errors.brandPrimary} />
                        <ColorField label="Втори цвят" value={brandSecondary} onChange={setBrandSecondary} error={errors.brandSecondary} />
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <button type="button" onClick={handleSave} disabled={saving} className="btn btn-primary">
                    {saving ? 'Запазване…' : 'Запази'}
                </button>
                <button type="button" onClick={() => router.push('/admin/teams')} className="btn btn-secondary">
                    Отказ
                </button>
            </div>
        </div>
    );
};

export default TeamEditor;
