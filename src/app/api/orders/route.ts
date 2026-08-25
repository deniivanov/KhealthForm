import { NextResponse } from "next/server";
import crypto from "crypto";
import connectDB from "@/utils/connectDB";
import Shirt from "../../../../mongo/models/Shirt";
import { CATALOGS, type CatalogKey } from "@/lib/catalogs";

export const dynamic = "force-dynamic";

const MAX_NAME_LENGTH = 100;
const MAX_INFO_LENGTH = 500;
const MAX_LINE_ITEMS = 20;
const MAX_QUANTITY = 10;

// Basic in-memory rate limit: max 5 orders per IP per minute.
// Good enough for a single-instance deployment.
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60_000;
const rateBuckets = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
    const now = Date.now();
    const hits = (rateBuckets.get(ip) || []).filter((t: number) => now - t < RATE_WINDOW_MS);
    if (hits.length >= RATE_LIMIT) {
        rateBuckets.set(ip, hits);
        return true;
    }
    hits.push(now);
    rateBuckets.set(ip, hits);
    if (rateBuckets.size > 10_000) rateBuckets.clear();
    return false;
}

function sanitizeText(value: unknown, maxLength: number): string {
    // Strip control characters (newlines allowed) and cap length
    return String(value ?? "")
        .replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, "")
        .trim()
        .slice(0, maxLength);
}

function generateOrderId() {
    const now = new Date();
    const ymd = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
    const rand = crypto.randomInt(0, 10_000).toString().padStart(4, "0");
    return `ORD-${ymd}-${rand}`;
}

export async function POST(request: Request) {
    const ip = (request.headers.get("x-forwarded-for") || "unknown").split(",")[0].trim();
    if (isRateLimited(ip)) {
        return NextResponse.json(
            { success: false, message: "Too many requests. Please try again later." },
            { status: 429 }
        );
    }

    let body;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ success: false, message: "Invalid JSON" }, { status: 400 });
    }

    const catalog = CATALOGS[body?.catalog as CatalogKey];
    if (!catalog) {
        return NextResponse.json({ success: false, message: "Unknown catalog" }, { status: 400 });
    }

    const customerName = sanitizeText(body?.customerName, MAX_NAME_LENGTH);
    const additionalInfo = sanitizeText(body?.additionalInfo, MAX_INFO_LENGTH);

    if (!customerName) {
        return NextResponse.json({ success: false, message: "Customer name is required" }, { status: 400 });
    }

    const items = body?.products;
    if (!Array.isArray(items) || items.length === 0 || items.length > MAX_LINE_ITEMS) {
        return NextResponse.json({ success: false, message: "Invalid products list" }, { status: 400 });
    }

    // Rebuild every line item from the server-side catalog; the client only
    // gets to choose product id, size and quantity.
    const products = [];
    for (const item of items) {
        const product = catalog.find(p => p.id === item?.id);
        if (!product) {
            return NextResponse.json({ success: false, message: "Unknown product" }, { status: 400 });
        }
        if (!product.sizes.includes(item?.size)) {
            return NextResponse.json({ success: false, message: "Invalid size" }, { status: 400 });
        }
        const quantity = Number(item?.quantity);
        if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
            return NextResponse.json({ success: false, message: "Invalid quantity" }, { status: 400 });
        }
        products.push({
            id: product.id,
            name: product.name,
            color: product.color,
            price: product.price,
            size: item.size,
            quantity,
            subtotal: Math.round(product.price * quantity * 100) / 100,
        });
    }

    const total = Math.round(products.reduce((sum, p) => sum + p.subtotal, 0) * 100) / 100;
    const orderDate = new Date();

    try {
        await connectDB();

        let order = null;
        for (let attempt = 0; attempt < 5 && !order; attempt++) {
            try {
                order = await Shirt.create({
                    orderId: generateOrderId(),
                    customerName,
                    additionalInfo,
                    products,
                    total,
                    orderDate,
                });
            } catch (err) {
                if ((err as { code?: number })?.code !== 11000) throw err; // retry only on duplicate orderId
            }
        }
        if (!order) throw new Error("Could not generate a unique order id");

        // Optional best-effort forward to n8n (notifications etc.). Only from
        // the server, and only when explicitly configured.
        if (process.env.N8N_WEBHOOK_URL) {
            try {
                await fetch(process.env.N8N_WEBHOOK_URL, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        orderId: order.orderId,
                        customerName,
                        additionalInfo,
                        products,
                        total,
                        orderDate: orderDate.toISOString(),
                        status: "pending",
                    }),
                    signal: AbortSignal.timeout(10_000),
                });
            } catch (err) {
                console.error("n8n forward failed (order already saved):", (err as Error)?.message);
            }
        }

        return NextResponse.json({
            success: true,
            orderId: order.orderId,
            total,
        });
    } catch (error) {
        console.error("Error creating order:", error);
        return NextResponse.json(
            { success: false, message: "Failed to create order" },
            { status: 500 }
        );
    }
}
