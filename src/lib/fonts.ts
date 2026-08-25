import { Archivo } from 'next/font/google';

// Modernist design font, shared by the public form and the admin. No
// Cyrillic subset exists for Archivo — Bulgarian text falls back to
// system-ui via the CSS font stack.
export const archivo = Archivo({
    subsets: ['latin', 'latin-ext'],
    variable: '--font-archivo',
    display: 'swap',
});
