import { connectDB } from "@/app/services/server/mongodb";
import { Payment } from "@/app/models/Payment";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await context.params;   // ← פתרון 100%

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const payment = await Payment.findById(id)
      .populate({ path: "requestId", model: "CompanyRequest" })
      .populate({ path: "companyId", model: "User" });

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    return NextResponse.json(payment, { status: 200 });
  } catch (error) {
    console.error("❌ Error loading payment:", error);
    return NextResponse.json(
      { error: "Failed to load payment" },
      { status: 500 }
    );
  }
}
