import { NextResponse } from "next/server";
import connectDB from "@/utils/connectDB";
import Shirt from "../../../../mongo/models/Shirt";

await connectDB()

export async function GET() {
    try {
        const orders = await Shirt.find().sort({ orderDate: -1 });

        return NextResponse.json({
            success: true,
            count: orders.length,
            orders,
        });

    } catch (error) {
        console.error("❌ Error fetching orders:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch orders",
            },
            { status: 500 }
        );
    }
}
