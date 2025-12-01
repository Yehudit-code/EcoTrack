import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import { CompanyAlert } from "@/app/models/CompanyAlerts";

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();

    const alert = await CompanyAlert.findOneAndUpdate(
      {
        userId: body.userId,
        companyId: body.companyId,
        category: body.category,
      },
      {
        alertLevel: body.level,
        lastUpdated: new Date(),
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true, alert });
  } catch {
    return NextResponse.json({ success: false });
  }
}
