'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { slugify } from '@/lib/slug';
import type { TeamInput } from '@/lib/validate/team';
import { createTeam, updateTeam } from '@/app/admin/teams/actions';
import type { ActionResult } from '@/app/admin/products/actions';

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

const inputCls =
    'w-full border-2 border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400';

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
    <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">{label}</label>
        <div className="flex items-center gap-2">
            <input
                type="color"
                value={/^#[0-9a-fA-F]{6}$/.test(value) ? value : '#1d4ed8'}
                onChange={e => onChange(e.target.value)}
                className="w-10 h-10 border border-slate-300 rounded cursor-pointer"
            />
            <input value={value} onChange={e => onChange(e.target.value)} className={inputCls} placeholder="#1d4ed8" />
            {value && (
                <button type="button" onClick={() => onChange('')} className="text-slate-400 hover:text-red-500" title="Изчисти">
                    ✕
                </button>
            )}
        </div>
        {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
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
        <div className="p-6 max-w-3xl">
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">
                {initial ? `Редакция: ${initial.name}` : 'Нов отбор'}
            </h1>

            {errors._ && <p className="mb-4 text-red-600 font-medium">{errors._}</p>}

            <div className="bg-white rounded-lg shadow-sm p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Име на отбора *</label>
                        <input value={name} onChange={e => handleNameChange(e.target.value)} className={inputCls} placeholder="FC Example" />
                        {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Slug (URL) *</label>
                        <input
                            value={slug}
                            onChange={e => { setSlug(e.target.value); setSlugTouched(true); }}
                            className={`${inputCls} font-mono`}
                            placeholder="fc-example"
                        />
                        {errors.slug && <p className="text-sm text-red-600 mt-1">{errors.slug}</p>}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Лице за контакт</label>
                        <input value={contactName} onChange={e => setContactName(e.target.value)} className={inputCls} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Имейл</label>
                        <input value={email} onChange={e => setEmail(e.target.value)} className={inputCls} type="email" />
                        {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Телефон</label>
                        <input value={phone} onChange={e => setPhone(e.target.value)} className={inputCls} />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Бележки</label>
                    <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} className={inputCls} />
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 mt-6 space-y-5">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">Брандинг</h2>
                    <p className="text-sm text-gray-600">Логото и цветовете се показват на публичната форма на отбора.</p>
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Лого (URL)</label>
                    <div className="flex items-center gap-3">
                        <input value={logoUrl} onChange={e => setLogoUrl(e.target.value)} className={inputCls} placeholder="https://..." />
                        {logoUrl && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={logoUrl} alt="лого" className="w-12 h-12 rounded-full object-cover border border-slate-300" />
                        )}
                    </div>
                    {errors.logoUrl && <p className="text-sm text-red-600 mt-1">{errors.logoUrl}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <ColorField label="Основен цвят" value={brandPrimary} onChange={setBrandPrimary} error={errors.brandPrimary} />
                    <ColorField label="Втори цвят" value={brandSecondary} onChange={setBrandSecondary} error={errors.brandSecondary} />
                </div>
            </div>

            <div className="flex items-center gap-3 mt-6">
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-3 bg-yellow-400 text-slate-800 font-bold rounded-lg hover:bg-yellow-500 disabled:opacity-60"
                >
                    {saving ? 'Запазване…' : 'Запази'}
                </button>
                <button type="button" onClick={() => router.push('/admin/teams')} className="px-6 py-3 border border-slate-300 rounded-lg hover:bg-gray-50">
                    Отказ
                </button>
            </div>
        </div>
    );
};

export default TeamEditor;
