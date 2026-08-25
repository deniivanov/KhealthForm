import type { ReactNode } from 'react';
import { Archivo } from 'next/font/google';
import './modernist.css';

// Design font for the public form (Modernist system). No Cyrillic subset
// exists for Archivo — Bulgarian text falls back to system-ui.
const archivo = Archivo({
    subsets: ['latin', 'latin-ext'],
    variable: '--font-archivo',
    display: 'swap',
});

export default function PublicFormLayout({ children }: { children: ReactNode }) {
    return <div className={archivo.variable}>{children}</div>;
}
