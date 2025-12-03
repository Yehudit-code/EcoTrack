import { NextResponse } from "next/server";
import { connectDB } from "@/app/services/server/mongodb";
import { ConsumptionHabit } from "@/app/models/ConsumptionHabit";
import { User } from "@/app/models/User";
import type { IUser } from "@/app/models/User";
import { Types } from "mongoose";

export async function GET(
  req: Request,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    await connectDB();

    // Unwrap params Promise (Next.js 16)
    const { userId } = await context.params;

    // Validate ObjectId
    if (!Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { success: false, message: "Invalid userId" },
        { status: 400 }
      );
    }

    // Extract company email from query string
    const url = new URL(req.url);
    const companyEmail = url.searchParams.get("companyEmail");

    if (!companyEmail) {
      return NextResponse.json(
        { success: false, message: "Missing companyEmail parameter" },
        { status: 400 }
      );
    }

    // Find the company user
    const companyUser = (await User.findOne({ email: companyEmail }).lean()) as
      | IUser
      | null;

    if (!companyUser) {
      return NextResponse.json(
        { success: false, message: "Company user not found" },
        { status: 404 }
      );
    }

    // Validate company category
    const companyCategory = companyUser.companyCategory;
    if (!companyCategory) {
      return NextResponse.json(
        { success: false, message: "Company has no category defined" },
        { status: 400 }
      );
    }

    // Fetch consumption data for this user and category
    const habits = await ConsumptionHabit.find({
      userId: new Types.ObjectId(userId),
      category: companyCategory,
    }).lean();

    return NextResponse.json(
      {
        success: true,
        data: habits,
        companyCategory,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error fetching filtered user consumption:", err);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch filtered consumption",
      },
      { status: 500 }
    );
  }
}
