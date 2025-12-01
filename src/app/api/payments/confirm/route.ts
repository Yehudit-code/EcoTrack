// src/app/api/payments/confirm/route.ts
import { connectDB } from "@/app/services/server/mongodb";
import { Payment } from "@/app/models/Payment";
import { CompanyRequest } from "@/app/models/CompanyRequest";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { paymentId, success } = await req.json();

    if (!paymentId) {
      return Response.json({ error: "Missing paymentId" }, { status: 400 });
    }

    const payment = await Payment.findById(paymentId);

    if (!payment) {
      return Response.json({ error: "Payment not found" }, { status: 404 });
    }

    payment.status = success ? "paid" : "failed";
    payment.updatedAt = new Date();
    await payment.save();

    if (success) {
      // מעדכן את CompanyRequest ל"accepted"
      await CompanyRequest.findByIdAndUpdate(payment.requestId, {
        status: "accepted",
      });
    }

    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("❌ Error confirming payment:", error);
    return Response.json({ error: "Failed to confirm payment" }, { status: 500 });
  }
}
