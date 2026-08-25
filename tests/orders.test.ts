import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
    isFormAcceptingOrders,
    priceOrderLines,
    type PriceableFormItem,
} from '../src/lib/orders';

describe('isFormAcceptingOrders', () => {
    const now = new Date('2026-09-01T12:00:00Z');

    it('rejects draft and closed forms regardless of window', () => {
        assert.equal(isFormAcceptingOrders({ status: 'draft' }, now), false);
        assert.equal(isFormAcceptingOrders({ status: 'closed' }, now), false);
        assert.equal(
            isFormAcceptingOrders(
                { status: 'closed', opensAt: new Date('2026-08-01'), closesAt: new Date('2026-10-01') },
                now
            ),
            false
        );
    });

    it('accepts an open form with no window', () => {
        assert.equal(isFormAcceptingOrders({ status: 'open' }, now), true);
    });

    it('respects opensAt', () => {
        assert.equal(isFormAcceptingOrders({ status: 'open', opensAt: new Date('2026-09-02') }, now), false);
        assert.equal(isFormAcceptingOrders({ status: 'open', opensAt: new Date('2026-08-31') }, now), true);
    });

    it('respects closesAt', () => {
        assert.equal(isFormAcceptingOrders({ status: 'open', closesAt: new Date('2026-08-31') }, now), false);
        assert.equal(isFormAcceptingOrders({ status: 'open', closesAt: new Date('2026-09-02') }, now), true);
    });

    it('accepts string dates (lean/JSON documents)', () => {
        assert.equal(
            isFormAcceptingOrders({ status: 'open', opensAt: '2026-08-01T00:00:00Z', closesAt: '2026-10-01T00:00:00Z' }, now),
            true
        );
    });
});

describe('priceOrderLines', () => {
    const items: PriceableFormItem[] = [
        {
            _id: 'item1',
            sku: 'TS-CLASSIC',
            name: 'Тениска Classic',
            priceCents: 1800,
            sizes: [
                { label: 'M' },
                { label: '3XL', priceAdjustmentCents: 200 },
            ],
            personalization: [
                { key: 'playerName', label: 'Име', type: 'text', required: false },
                { key: 'playerNumber', label: 'Номер', type: 'number', required: true },
            ],
        },
        {
            _id: 'item2',
            sku: 'SH-MOVE',
            name: 'Шорти Move',
            priceCents: 2200,
            sizes: [{ label: 'S' }],
            personalization: [],
        },
    ];

    it('computes totals with size price adjustments', () => {
        const result = priceOrderLines(items, [
            { formItemId: 'item1', sizeLabel: '3XL', quantity: 2, personalization: { playerNumber: '7' } },
            { formItemId: 'item2', sizeLabel: 'S', quantity: 1 },
        ]);
        assert.ok(result.ok);
        assert.equal(result.lines[0].unitPriceCents, 2000); // 1800 + 200
        assert.equal(result.totalCents, 2000 * 2 + 2200);
    });

    it('rejects unknown items and sizes', () => {
        assert.deepEqual(priceOrderLines(items, [{ formItemId: 'nope', sizeLabel: 'M', quantity: 1 }]), {
            ok: false,
            error: 'unknown_item',
        });
        assert.deepEqual(
            priceOrderLines(items, [{ formItemId: 'item1', sizeLabel: 'XXL', quantity: 1, personalization: { playerNumber: '7' } }]),
            { ok: false, error: 'unknown_size' }
        );
    });

    it('rejects invalid quantities', () => {
        for (const quantity of [0, -1, 1.5, 21, NaN]) {
            const result = priceOrderLines(items, [
                { formItemId: 'item2', sizeLabel: 'S', quantity },
            ]);
            assert.deepEqual(result, { ok: false, error: 'invalid_quantity' });
        }
    });

    it('enforces required personalization and number format', () => {
        assert.deepEqual(
            priceOrderLines(items, [{ formItemId: 'item1', sizeLabel: 'M', quantity: 1 }]),
            { ok: false, error: 'missing_playerNumber' }
        );
        assert.deepEqual(
            priceOrderLines(items, [
                { formItemId: 'item1', sizeLabel: 'M', quantity: 1, personalization: { playerNumber: 'abc' } },
            ]),
            { ok: false, error: 'invalid_playerNumber' }
        );
    });

    it('drops personalization keys not defined on the item', () => {
        const result = priceOrderLines(items, [
            { formItemId: 'item2', sizeLabel: 'S', quantity: 1, personalization: { hack: 'x' } },
        ]);
        assert.ok(result.ok);
        assert.deepEqual(result.lines[0].personalization, {});
    });

    it('rejects empty submissions', () => {
        assert.deepEqual(priceOrderLines(items, []), { ok: false, error: 'empty' });
    });
});
