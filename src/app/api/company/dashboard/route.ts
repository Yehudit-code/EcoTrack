import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { connectDB } from "@/app/lib/db";
import { CompanyRequest } from "@/app/models/CompanyRequest";
import { Payment } from "@/app/models/Payment";

export async function GET(req: Request) {
  try {
    await connectDB();

    const url = new URL(req.url);
    const companyId = url.searchParams.get("companyId");

    if (!companyId || !Types.ObjectId.isValid(companyId)) {
      return NextResponse.json(
        { success: false, message: "Missing or invalid companyId" },
        { status: 400 }
      );
    }

    const companyObjectId = new Types.ObjectId(companyId);

    const [requests, payments] = await Promise.all([
      CompanyRequest.find({ companyId: companyObjectId })
        .sort({ createdAt: -1 })
        .lean(),
      Payment.find({ companyId: companyObjectId })
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    const totalRevenue = payments
      .filter((p) => p.status === "transferred")
      .reduce((sum, p) => sum + (p.companyRevenue ?? 0), 0);

    const totalFee = payments
      .filter((p) => p.status === "transferred")
      .reduce((sum, p) => sum + (p.ecoTrackFee ?? 0), 0);

    return NextResponse.json(
      {
        success: true,
        data: {
          requests,
          payments,
          stats: {
            totalRequests: requests.length,
            totalPayments: payments.length,
            totalRevenue,
            totalFee,
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /company/dashboard error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
