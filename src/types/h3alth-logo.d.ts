import type { DetailedHTMLProps, HTMLAttributes } from 'react';

// <h3alth-logo> web component from public/h3alth-logo.js
declare module 'react' {
    namespace JSX {
        interface IntrinsicElements {
            'h3alth-logo': DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
                /** hover = replay build on pointer, idle = occasional diamond spin, both (default), none = static */
                mode?: 'hover' | 'idle' | 'both' | 'none';
                /** logo height in px (width follows) */
                height?: number | string;
                /** seconds between idle spins */
                'idle-every'?: number | string;
            };
        }
    }
}
