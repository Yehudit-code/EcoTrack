// src/app/api/payments/confirm/route.ts
import { connectDB } from "@/app/services/server/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export async function POST(req: Request) {
  try {
    const { paymentId } = await req.json();

    if (!paymentId || !ObjectId.isValid(paymentId)) {
      console.error("❌ Invalid paymentId:", paymentId);
      return NextResponse.json({ error: "Invalid paymentId" }, { status: 400 });
    }

    const db = await connectDB();
    const paymentsCol = db.collection("Payments");
    const requestsCol = db.collection("CompanyRequests");

    // שליפת התשלום עצמו
    const payment = await paymentsCol.findOne({
      _id: new ObjectId(paymentId),
    });

    if (!payment) {
      console.error("❌ Payment not found");
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // 1️⃣ עדכון התשלום ל-Paid
    await paymentsCol.updateOne(
      { _id: new ObjectId(paymentId) },
      {
        $set: {
          status: "paid",
          paidAt: new Date(),
        },
      }
    );

    // 2️⃣ עדכון CompanyRequests לפי requestId
    if (payment.requestId && ObjectId.isValid(payment.requestId)) {
      await requestsCol.updateOne(
        { _id: new ObjectId(payment.requestId) },
        {
          $set: {
            status: "paid",
            paidAt: new Date(),
          },
        }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("❌ Error confirming payment:", err);
    return NextResponse.json(
      { error: "Failed to confirm payment" },
      { status: 500 }
    );
  }
}
