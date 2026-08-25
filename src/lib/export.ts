/**
 * CSV / XLSX builders for order exports. Server-only (exceljs).
 */
import ExcelJS from 'exceljs';
import { centsToEuroString } from '@/lib/money';
import { buildProductionSummary, type SummarizableOrder } from '@/lib/production';

export interface ExportableOrder extends SummarizableOrder {
    reference: string;
    member: { fullName: string; email?: string; phone?: string };
    lines: Array<{
        productSku: string;
        productName: string;
        sizeLabel: string;
        quantity: number;
        unitPriceCents: number;
        personalization?: Record<string, string>;
    }>;
    totalCents: number;
    status: string;
    paymentStatus: string;
    notes?: string;
    createdAt: string | Date;
}

const ORDER_HEADERS = [
    'Поръчка', 'Клиент', 'Телефон', 'Имейл', 'Продукт', 'SKU', 'Размер',
    'Брой', 'Ед. цена (€)', 'Сума (€)', 'Персонализация', 'Статус',
    'Плащане', 'Бележка', 'Дата',
];

function orderRows(orders: ExportableOrder[]): (string | number)[][] {
    const rows: (string | number)[][] = [];
    for (const order of orders) {
        for (const line of order.lines) {
            const personalization = Object.entries(line.personalization ?? {})
                .map(([k, v]) => `${k}: ${v}`)
                .join('; ');
            rows.push([
                order.reference,
                order.member.fullName,
                order.member.phone ?? '',
                order.member.email ?? '',
                line.productName,
                line.productSku,
                line.sizeLabel,
                line.quantity,
                centsToEuroString(line.unitPriceCents),
                centsToEuroString(line.unitPriceCents * line.quantity),
                personalization,
                order.status,
                order.paymentStatus,
                order.notes ?? '',
                new Date(order.createdAt).toISOString().slice(0, 16).replace('T', ' '),
            ]);
        }
    }
    return rows;
}

function summaryTable(orders: ExportableOrder[]): (string | number)[][] {
    const summary = buildProductionSummary(orders);
    const header = ['Продукт', 'SKU', ...summary.sizes, 'Общо'];
    const rows = summary.rows.map(r => [
        r.productName,
        r.productSku,
        ...summary.sizes.map(s => r.bySize[s] ?? 0),
        r.total,
    ]);
    const totalRow = [
        'ОБЩО',
        '',
        ...summary.sizes.map(s => summary.rows.reduce((sum, r) => sum + (r.bySize[s] ?? 0), 0)),
        summary.grandTotal,
    ];
    return [header, ...rows, totalRow];
}

function toCsv(table: (string | number)[][]): string {
    const escape = (v: string | number) => {
        const s = String(v);
        return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    // BOM so Excel opens Cyrillic UTF-8 correctly
    return '\uFEFF' + table.map(row => row.map(escape).join(',')).join('\r\n');
}

export function buildOrdersCsv(orders: ExportableOrder[]): string {
    return toCsv([ORDER_HEADERS, ...orderRows(orders)]);
}

export function buildSummaryCsv(orders: ExportableOrder[]): string {
    return toCsv(summaryTable(orders));
}

async function workbookFromTable(sheetName: string, table: (string | number)[][]): Promise<Buffer> {
    const wb = new ExcelJS.Workbook();
    const sheet = wb.addWorksheet(sheetName);
    sheet.addRows(table);
    sheet.getRow(1).font = { bold: true };
    sheet.columns.forEach(col => {
        let max = 8;
        col.eachCell?.({ includeEmpty: false }, cell => {
            max = Math.max(max, String(cell.value ?? '').length + 2);
        });
        col.width = Math.min(max, 40);
    });
    return Buffer.from(await wb.xlsx.writeBuffer());
}

export function buildOrdersXlsx(orders: ExportableOrder[]): Promise<Buffer> {
    return workbookFromTable('Поръчки', [ORDER_HEADERS, ...orderRows(orders)]);
}

export function buildSummaryXlsx(orders: ExportableOrder[]): Promise<Buffer> {
    return workbookFromTable('Производство', summaryTable(orders));
}
