'use client';
import React, { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_ITEMS } from '@/components/admin/AdminNav';

/**
 * Mobile admin navigation: hamburger button that opens a full-screen flat
 * menu. `footer` receives the user info + sign-out form from the server
 * layout. Hidden on desktop via the parent's responsive classes.
 */
const AdminMobileMenu = ({ footer }: { footer: ReactNode }) => {
    const [open, setOpen] = useState(false);
    const pathname = usePathname();

    // close when navigation happens
    useEffect(() => {
        setOpen(false);
    }, [pathname]);

    // lock body scroll while the menu is open
    useEffect(() => {
        document.body.style.overflow = open ? 'hidden' : '';
        return () => {
            document.body.style.overflow = '';
        };
    }, [open]);

    return (
        <>
            <button
                type="button"
                aria-label={open ? 'Затвори менюто' : 'Отвори менюто'}
                aria-expanded={open}
                onClick={() => setOpen(v => !v)}
                className="btn btn-secondary"
                style={{ padding: '6px 12px', fontSize: 18, lineHeight: 1 }}
            >
                {open ? '✕' : '☰'}
            </button>

            {open && (
                <div
                    className="modernist fixed inset-0 z-50 flex flex-col"
                    style={{ background: 'var(--color-bg)' }}
                >
                    <div
                        className="flex items-center justify-between"
                        style={{ padding: '10px 24px', borderBottom: '2px solid var(--color-divider)' }}
                    >
                        <Link href="/admin" aria-label="KHealth — начало" onClick={() => setOpen(false)}>
                            <h3alth-logo mode="none" height="34" />
                        </Link>
                        <button
                            type="button"
                            aria-label="Затвори менюто"
                            onClick={() => setOpen(false)}
                            className="btn btn-secondary"
                            style={{ padding: '6px 12px', fontSize: 18, lineHeight: 1 }}
                        >
                            ✕
                        </button>
                    </div>

                    <nav className="flex-1 overflow-y-auto">
                        {NAV_ITEMS.map(item => {
                            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setOpen(false)}
                                    style={{
                                        display: 'block',
                                        padding: '16px 24px',
                                        fontSize: 17,
                                        fontFamily: 'var(--font-heading)',
                                        fontWeight: active ? 800 : 600,
                                        color: 'var(--color-text)',
                                        textDecoration: 'none',
                                        borderBottom: '1px solid var(--color-divider)',
                                        borderLeft: active ? '5px solid var(--color-accent)' : '5px solid transparent',
                                        background: active ? 'color-mix(in oklab, var(--color-accent), white 90%)' : 'transparent',
                                    }}
                                >
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    <div style={{ borderTop: '2px solid var(--color-divider)', padding: '16px 24px' }}>
                        {footer}
                    </div>
                </div>
            )}
        </>
    );
};

export default AdminMobileMenu;
