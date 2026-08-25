import { NextResponse } from 'next/server';
import { isValidObjectId } from 'mongoose';
import { auth } from '@/auth';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import { toPlain } from '@/lib/serialize';
import {
    buildAdminXlsx,
    buildProductionXlsx,
    type ExportableOrder,
} from '@/lib/export';

export const dynamic = 'force-dynamic';

/** Single-order XLSX export: ?report=production|admin */
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
    const report = url.searchParams.get('report') === 'production' ? 'production' : 'admin';

    await connectDB();
    const order = await Order.findById(id).lean();
    if (!order) return NextResponse.json({ message: 'Not found' }, { status: 404 });

    const orders = [toPlain<ExportableOrder>(order)];
    const buffer = report === 'production' ? await buildProductionXlsx(orders) : await buildAdminXlsx(orders);
    const suffix = report === 'production' ? 'proizvodstvo' : 'administratsia';

    return new NextResponse(new Uint8Array(buffer), {
        headers: {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': `attachment; filename="${order.reference}-${suffix}.xlsx"`,
        },
    });
}
