import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import { ConsumptionHabit } from "@/app/models/ConsumptionHabit";

export async function GET(req: Request, { params }: { params: { userId: string } }) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");

    if (!category) {
      return NextResponse.json({ success: false, message: "Category is required" }, { status: 400 });
    }

    const data = await ConsumptionHabit.find({
      userId: params.userId,
      category: category,
    })
      .sort({ year: 1, month: 1 }) // oldest → newest
      .limit(12);

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("❌ Error loading user consumption:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
