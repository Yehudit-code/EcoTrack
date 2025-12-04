// src/app/api/payments/create/route.ts
import { connectDB } from "@/app/services/server/mongodb";
import { CompanyRequest } from "@/app/models/CompanyRequest";
import { Payment } from "@/app/models/Payment";
import { Types } from "mongoose";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { requestId } = await req.json();

    if (!requestId) {
      return Response.json({ error: "Missing requestId" }, { status: 400 });
    }

    const request = await CompanyRequest.findById(requestId);

    if (!request) {
      return Response.json({ error: "CompanyRequest not found" }, { status: 404 });
    }

    // מחשבים עמלה 10%
    const ecoTrackFee = request.price * 0.1;
    const companyRevenue = request.price - ecoTrackFee;

    // יוצרים תשלום חדש
    const payment = await Payment.create({
      userId: request.userId,
      companyId: request.companyId,
      requestId: request._id,
      amount: request.price,
      ecoTrackFee,
      companyRevenue,
      status: "pending",
    });

    // מוסיפים את ה־paymentId להצעת תשלום
    request.paymentId = payment._id;
    await request.save();

    return Response.json(
      {
        success: true,
        paymentId: payment._id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Error in /payments/create:", error);
    return Response.json(
      { error: "Failed to create payment" },
      { status: 500 }
    );
  }
}
