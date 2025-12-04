import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { connectDB } from "@/app/lib/db";
import { User } from "@/app/models/User";
import { ConsumptionHabit } from "@/app/models/ConsumptionHabit";
import type { IUser } from "@/app/models/User";

export async function GET(
  req: Request,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    await connectDB();

    // Required in Next.js 16 — params is a Promise
    const { userId } = await context.params;

    // Validate ID
    if (!Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { success: false, message: "Invalid user id" },
        { status: 400 }
      );
    }

    // Company email from query
    const url = new URL(req.url);
    const companyEmail = url.searchParams.get("companyEmail");

    if (!companyEmail) {
      return NextResponse.json(
        { success: false, message: "Missing company email" },
        { status: 400 }
      );
    }

    // Find logged-in company (typed!)
    const company = (await User.findOne({ email: companyEmail }).lean()) as
      | IUser
      | null;

    if (!company || company.role !== "company") {
      return NextResponse.json(
        { success: false, message: "Company not found" },
        { status: 404 }
      );
    }

    // Normalize category
    const companyCategory: string =
      (company.companyCategory as string).charAt(0).toUpperCase() +
      (company.companyCategory as string).slice(1).toLowerCase();

    // Fetch the target user (typed!)
    const user = (await User.findById(userId)
      .select("email createdAt country")
      .lean()) as IUser | null;

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Query supports both storage methods:
    // - userId (new records)
    // - userEmail (old records)
    const matchQuery = {
      $and: [
        {
          $or: [
            { userId: new Types.ObjectId(userId) },
            { userEmail: user.email as string },
          ],
        },
        { category: companyCategory },
      ],
    };

    const records = await ConsumptionHabit.find(matchQuery).lean();

    // If no consumption found
    if (!records.length) {
      return NextResponse.json(
        {
          success: true,
          data: {
            user,
            companyCategory,
            consumption: [],
          },
        },
        { status: 200 }
      );
    }

    // Return raw records (list)
    const formattedRecords = records.map(r => ({
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

    // Aggregate manually into a single object
    const totalValue = records.reduce((s, r) => s + r.value, 0);
    const avgValue = totalValue / records.length;

    const consumption = {
      category: companyCategory,
      totalValue,
      avgValue,
    };

    // Final response
    return NextResponse.json(
      {
        success: true,
        data: {
          user,
          companyCategory,
          consumption,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "GET /company/users/[userId]/details error:",
      error
    );

    return NextResponse.json(
      { success: false, message: "Failed to fetch user details" },
      { status: 500 }
    );
  }
}
