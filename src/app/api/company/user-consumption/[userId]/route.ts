import { NextResponse } from "next/server";
import { connectDB } from "@/app/services/server/mongodb";
import { ConsumptionHabit } from "@/app/models/ConsumptionHabit";
import { User } from "@/app/models/User";
import type { IUser } from "@/app/models/User"; 
export async function GET(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    await connectDB();

    const userId = params.userId;

    // Read company email from query
    const url = new URL(req.url);
    const companyEmail = url.searchParams.get("companyEmail");

    if (!companyEmail) {
      return NextResponse.json(
        { success: false, message: "Missing companyEmail parameter" },
        { status: 400 }
      );
    }

    // Find company user (the logged-in company)
    const companyUser = await User.findOne({ email: companyEmail })
      .lean<IUser | null>(); // Explicit type for TS

    if (!companyUser) {
      return NextResponse.json(
        { success: false, message: "Company user not found" },
        { status: 404 }
      );
    }

    // Access company category safely
    const companyCategory = companyUser.companyCategory;

    if (!companyCategory) {
      return NextResponse.json(
        { success: false, message: "Company has no category defined" },
        { status: 400 }
      );
    }

    // Find all consumption records for this user and category
    const habits = await ConsumptionHabit.find({
      userId: userId,
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
