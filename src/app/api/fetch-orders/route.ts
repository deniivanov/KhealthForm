import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/utils/connectDB";
import Shirt from "../../../../mongo/models/Shirt";

export const dynamic = "force-dynamic";

export async function GET() {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
        return NextResponse.json(
            { success: false, message: "Unauthorized" },
            { status: 401 }
        );
    }

    try {
        await connectDB();
        const orders = await Shirt.find().sort({ orderDate: -1 }).lean();

        return NextResponse.json({
            success: true,
            count: orders.length,
            orders,
        });

    } catch (error) {
        console.error("Error fetching orders:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch orders",
            },
            { status: 500 }
        );
    }
}
