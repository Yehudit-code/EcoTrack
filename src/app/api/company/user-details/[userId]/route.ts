import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { connectDB } from "@/app/lib/db";
import { User } from "@/app/models/User";
import { ConsumptionHabit } from "@/app/models/ConsumptionHabit";
import type { IUser } from "@/app/models/User";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export async function GET(
  req: Request,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    await connectDB();

    // Next.js 16 → params is a Promise
    const { userId } = await context.params;

    if (!Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { success: false, message: "Invalid user id" },
        { status: 400 }
      );
    }

    // =====================================================
    // 1) READ COOKIE (Next.js 16 syntax)
    // =====================================================

    const cookieStore = await cookies();
    const token = cookieStore.get("ecotrack-token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Missing token" },
        { status: 401 }
      );
    }

    // =====================================================
    // 2) VERIFY JWT
    // =====================================================

    let payload;
    try {
      payload = await jwtVerify(
        token,
        new TextEncoder().encode(process.env.JWT_SECRET!)
      );
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    const companyEmail = payload.payload.email as string;

    // =====================================================
    // 3) FETCH COMPANY USER
    // =====================================================

    const company = (await User.findOne({ email: companyEmail }).lean()) as
      | IUser
      | null;

    if (!company || company.role !== "company") {
      return NextResponse.json(
        { success: false, message: "Company not authorized" },
        { status: 403 }
      );
    }

    // =====================================================
    // 4) SAFE CATEGORY NORMALIZATION
    // =====================================================

    const cat = company.companyCategory ?? "";
    const companyCategory =
      cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase();

    // =====================================================
    // 5) FETCH TARGET USER
    // =====================================================

    const user = (await User.findById(userId)
      .select("email createdAt country")
      .lean()) as IUser | null;

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // =====================================================
    // 6) FETCH CONSUMPTION DATA
    // =====================================================

    const matchQuery = {
      $and: [
        {
          $or: [
            { userId: new Types.ObjectId(userId) },
            { userEmail: user.email },
          ],
        },
        { category: companyCategory },
      ],
    };

    const records = await ConsumptionHabit.find(matchQuery).lean();

    const formattedRecords = records.map((r) => ({
      value: r.value,
      month: r.month,
      year: r.year,
      previousValue: r.previousValue ?? null,
      createdAt: r.createdAt,
    }));

    return NextResponse.json(
      {
        success: true,
        data: {
          user,
          companyCategory,
          consumption: formattedRecords,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("GET /company/user-details/[userId] error:", err);

    return NextResponse.json(
      { success: false, message: "Failed to fetch user details" },
      { status: 500 }
    );
  }
}
