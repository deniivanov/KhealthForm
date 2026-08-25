/**
 * CSV / XLSX builders for order exports. Server-only (exceljs).
 *
 * Two report types:
 *  - production: what the printing/embroidery floor needs — items, sizes,
 *    personalization, client notes and a product×size quantity grid.
 *    No prices, no contact details; cancelled orders excluded.
 *  - admin: full detail for office tracking — contacts, prices, payment
 *    status, plus a totals/summary sheet.
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

const STATUS_BG: Record<string, string> = {
    submitted: 'подадена',
    confirmed: 'потвърдена',
    in_production: 'в производство',
    delivered: 'доставена',
    cancelled: 'отказана',
};

function personalizationText(line: ExportableOrder['lines'][number]): string {
    return Object.entries(line.personalization ?? {})
        .map(([k, v]) => `${k}: ${v}`)
        .join('; ');
}

function formatDate(d: string | Date): string {
    return new Date(d).toISOString().slice(0, 16).replace('T', ' ');
}

// ── production report ───────────────────────────────────────────────────────

const PRODUCTION_HEADERS = [
    'Поръчка', 'Клиент', 'Продукт', 'SKU', 'Размер', 'Брой',
    'Персонализация', 'Бележка от клиента', 'Статус',
];

function productionRows(orders: ExportableOrder[]): (string | number)[][] {
    const rows: (string | number)[][] = [];
    for (const order of orders) {
        if (order.status === 'cancelled') continue; // never produce cancelled orders
        for (const line of order.lines) {
            rows.push([
                order.reference,
                order.member.fullName,
                line.productName,
                line.productSku,
                line.sizeLabel,
                line.quantity,
                personalizationText(line),
                order.notes ?? '',
                STATUS_BG[order.status] ?? order.status,
            ]);
        }
    }
    return rows;
}

function quantitiesTable(orders: ExportableOrder[]): (string | number)[][] {
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

// ── admin report ────────────────────────────────────────────────────────────

const ADMIN_HEADERS = [
    'Поръчка', 'Клиент', 'Телефон', 'Имейл', 'Продукт', 'SKU', 'Размер',
    'Брой', 'Ед. цена (€)', 'Сума (€)', 'Персонализация', 'Статус',
    'Плащане', 'Бележка', 'Дата',
];

function adminRows(orders: ExportableOrder[]): (string | number)[][] {
    const rows: (string | number)[][] = [];
    for (const order of orders) {
        for (const line of order.lines) {
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
                personalizationText(line),
                STATUS_BG[order.status] ?? order.status,
                order.paymentStatus === 'paid' ? 'платена' : 'неплатена',
                order.notes ?? '',
                formatDate(order.createdAt),
            ]);
        }
    }
    return rows;
}

function adminSummaryTable(orders: ExportableOrder[]): (string | number)[][] {
    const active = orders.filter(o => o.status !== 'cancelled');
    const revenue = active.reduce((s, o) => s + o.totalCents, 0);
    const paid = active.filter(o => o.paymentStatus === 'paid').reduce((s, o) => s + o.totalCents, 0);
    const itemCount = active.reduce((s, o) => s + o.lines.reduce((n, l) => n + l.quantity, 0), 0);

    const byStatus = new Map<string, number>();
    for (const o of orders) byStatus.set(o.status, (byStatus.get(o.status) ?? 0) + 1);

    const byProduct = new Map<string, { name: string; qty: number; cents: number }>();
    for (const o of active) {
        for (const l of o.lines) {
            const entry = byProduct.get(l.productSku) ?? { name: l.productName, qty: 0, cents: 0 };
            entry.qty += l.quantity;
            entry.cents += l.unitPriceCents * l.quantity;
            byProduct.set(l.productSku, entry);
        }
    }

    return [
        ['Обобщение', ''],
        ['Поръчки (без отказани)', active.length],
        ['Артикули общо', itemCount],
        ['Оборот (€)', centsToEuroString(revenue)],
        ['Платено (€)', centsToEuroString(paid)],
        ['Неплатено (€)', centsToEuroString(revenue - paid)],
        ['', ''],
        ['По статус', ''],
        ...[...byStatus.entries()].map(([s, n]) => [STATUS_BG[s] ?? s, n] as (string | number)[]),
        ['', ''],
        ['По продукт', 'Брой', 'Сума (€)'],
        ...[...byProduct.entries()].map(
            ([sku, e]) => [`${e.name} (${sku})`, e.qty, centsToEuroString(e.cents)] as (string | number)[]
        ),
    ];
}

// ── format writers ──────────────────────────────────────────────────────────

function toCsv(table: (string | number)[][]): string {
    const escape = (v: string | number) => {
        const s = String(v);
        return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    // BOM so Excel opens Cyrillic UTF-8 correctly
    return '\uFEFF' + table.map(row => row.map(escape).join(',')).join('\r\n');
}

async function workbook(sheets: Array<{ name: string; table: (string | number)[][] }>): Promise<Buffer> {
    const wb = new ExcelJS.Workbook();
    for (const { name, table } of sheets) {
        const sheet = wb.addWorksheet(name);
        sheet.addRows(table);
        sheet.getRow(1).font = { bold: true };
        sheet.columns.forEach(col => {
            let max = 8;
            col.eachCell?.({ includeEmpty: false }, cell => {
                max = Math.max(max, String(cell.value ?? '').length + 2);
            });
            col.width = Math.min(max, 44);
        });
    }
    return Buffer.from(await wb.xlsx.writeBuffer());
}

export function buildProductionCsv(orders: ExportableOrder[]): string {
    return toCsv([PRODUCTION_HEADERS, ...productionRows(orders)]);
}

export function buildProductionXlsx(orders: ExportableOrder[]): Promise<Buffer> {
    return workbook([
        { name: 'Количества', table: quantitiesTable(orders) },
        { name: 'Списък за производство', table: [PRODUCTION_HEADERS, ...productionRows(orders)] },
    ]);
}

export function buildAdminCsv(orders: ExportableOrder[]): string {
    return toCsv([ADMIN_HEADERS, ...adminRows(orders)]);
}

export function buildAdminXlsx(orders: ExportableOrder[]): Promise<Buffer> {
    return workbook([
        { name: 'Поръчки', table: [ADMIN_HEADERS, ...adminRows(orders)] },
        { name: 'Обобщение', table: adminSummaryTable(orders) },
    ]);
}
