import { connectDB } from "@/app/services/server/mongodb";
import { Payment } from "@/app/models/Payment";
import { CompanyRequest } from "@/app/models/CompanyRequest";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const payment = await Payment.findById(id)
      .populate("requestId")
      .populate("userId")
      .populate("companyId");

    if (!payment) {
      return Response.json({ error: "Payment not found" }, { status: 404 });
    }

    return Response.json(payment, { status: 200 });
  } catch (error) {
    console.error("❌ Error loading payment:", error);
    return Response.json(
      { error: "Failed to load payment" },
      { status: 500 }
    );
  }
}
