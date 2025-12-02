
import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { connectDB } from "@/app/lib/db";
import { User } from "@/app/models/User";
import { ConsumptionHabit } from "@/app/models/ConsumptionHabit";

export async function GET(
  req: Request,
  context: { params: Promise<{ userId: string }> } // ⭐ params is a Promise in Next.js 16
) {
  try {
    await connectDB();

    // ⭐ MUST AWAIT params in Next 16
    const { userId } = await context.params;

    // Validate ObjectId
    if (!Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { success: false, message: "Invalid user id" },
        { status: 400 }
      );
    }

    // Fetch user and cast type clearly for TypeScript
    const user = (await User.findById(userId)
      .select("email createdAt")
      .lean()) as { email: string; country?: string; createdAt?: Date } | null;

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Support consumption documents that have either userId OR userEmail
    const matchQuery = {
      $or: [
        { userId: new Types.ObjectId(userId) },
        { userEmail: user.email },
      ],
    };

    // Aggregate consumption data
    const consumption = await ConsumptionHabit.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: "$category",
          totalValue: { $sum: "$value" },
          avgValue: { $avg: "$value" },
        },
      },
      {
        $project: {
          _id: 0,
          category: "$_id",
          totalValue: 1,
          avgValue: 1,
        },
      },
    ]);

    return NextResponse.json(
      {
        success: true,
        data: {
          user,
          consumption,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /company/users/[userId]/details error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch user details" },
      { status: 500 }
    );
  }
}
