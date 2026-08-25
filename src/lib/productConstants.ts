/**
 * Client-safe product constants. Keep this file free of mongoose imports —
 * it is used by client components (importing a model file into the browser
 * bundle crashes, since mongoose only exists on the server).
 */

/** Extend this list to add categories; stored as plain strings. */
export const PRODUCT_CATEGORIES = [
    't-shirt',
    'hoodie',
    'top',
    'pants',
    'shorts',
    'leggings',
    'jacket',
    'accessory',
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number] | (string & {});
