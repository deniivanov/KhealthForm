import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif', 'image/svg+xml']);

/**
 * Admin-only image upload, proxied server-side to ImageKit so the private
 * key never reaches the browser. Requires IMAGEKIT_PRIVATE_KEY in env;
 * IMAGEKIT_UPLOAD_FOLDER is optional (default /khealth).
 */
export async function POST(request: Request) {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    if (!privateKey) {
        return NextResponse.json(
            { success: false, message: 'IMAGEKIT_PRIVATE_KEY не е настроен в .env.local' },
            { status: 501 }
        );
    }

    let file: File | null = null;
    try {
        const formData = await request.formData();
        const entry = formData.get('file');
        if (entry instanceof File) file = entry;
    } catch {
        return NextResponse.json({ success: false, message: 'Invalid form data' }, { status: 400 });
    }

    if (!file) {
        return NextResponse.json({ success: false, message: 'Липсва файл' }, { status: 400 });
    }
    if (!ALLOWED_TYPES.has(file.type)) {
        return NextResponse.json({ success: false, message: 'Позволени са само изображения (JPEG, PNG, WebP, AVIF, GIF, SVG)' }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
        return NextResponse.json({ success: false, message: 'Файлът е твърде голям (максимум 8 MB)' }, { status: 400 });
    }

    const upstream = new FormData();
    upstream.append('file', file);
    upstream.append('fileName', file.name || 'upload');
    upstream.append('folder', process.env.IMAGEKIT_UPLOAD_FOLDER || '/khealth');
    upstream.append('useUniqueFileName', 'true');

    try {
        const res = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
            method: 'POST',
            headers: {
                Authorization: `Basic ${Buffer.from(`${privateKey}:`).toString('base64')}`,
            },
            body: upstream,
            signal: AbortSignal.timeout(30_000),
        });
        const data = await res.json().catch(() => null);

        if (!res.ok || !data?.url) {
            console.error('ImageKit upload failed:', res.status, data?.message);
            return NextResponse.json(
                { success: false, message: data?.message || 'Качването към ImageKit не успя' },
                { status: 502 }
            );
        }

        return NextResponse.json({ success: true, url: data.url as string });
    } catch (err) {
        console.error('ImageKit upload error:', err);
        return NextResponse.json({ success: false, message: 'Качването не успя. Опитайте отново.' }, { status: 502 });
    }
}
