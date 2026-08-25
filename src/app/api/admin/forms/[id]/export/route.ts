import { NextResponse } from 'next/server';
import { isValidObjectId } from 'mongoose';
import { auth } from '@/auth';
import connectDB from '@/lib/db';
import Form from '@/models/Form';
import Order from '@/models/Order';
import { toPlain } from '@/lib/serialize';
import {
    buildOrdersCsv,
    buildOrdersXlsx,
    buildSummaryCsv,
    buildSummaryXlsx,
    type ExportableOrder,
} from '@/lib/export';
import { slugify } from '@/lib/slug';

export const dynamic = 'force-dynamic';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    if (!isValidObjectId(id)) {
        return NextResponse.json({ message: 'Not found' }, { status: 404 });
    }
    const url = new URL(request.url);
    const report = url.searchParams.get('report') === 'summary' ? 'summary' : 'orders';
    const format = url.searchParams.get('format') === 'xlsx' ? 'xlsx' : 'csv';

    await connectDB();
    const form = await Form.findById(id).lean();
    if (!form) return NextResponse.json({ message: 'Not found' }, { status: 404 });

    const orders = toPlain<ExportableOrder[]>(
        await Order.find({ formId: id }).sort({ createdAt: 1 }).lean()
    );

    const base = `${slugify(form.title)}-${report}`;

    if (format === 'csv') {
        const csv = report === 'orders' ? buildOrdersCsv(orders) : buildSummaryCsv(orders);
        return new NextResponse(csv, {
            headers: {
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': `attachment; filename="${base}.csv"`,
            },
        });
    }

    const buffer = report === 'orders' ? await buildOrdersXlsx(orders) : await buildSummaryXlsx(orders);
    return new NextResponse(new Uint8Array(buffer), {
        headers: {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': `attachment; filename="${base}.xlsx"`,
        },
    });
}
