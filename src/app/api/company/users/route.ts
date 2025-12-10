import { NextResponse, NextRequest } from "next/server";
import { IUser, User } from "@/app/models/User";
import { connectDB } from "@/app/lib/db";
import { ConsumptionHabit } from "@/app/models/ConsumptionHabit";
import { requireAuth } from "@/app/lib/auth/serverAuth";

// GET /api/company/users
export async function GET(req: Request) {
  try {
    // Ensure only company users may access this endpoint
    const auth = await requireAuth("company");
    if (!auth.ok) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const all = searchParams.get("all");
    let users;

    if (all === "true") {
      users = await ConsumptionHabit.find({}).lean();
    } else {
      const category = searchParams.get("category") || "electricity";

      // Fetch all records in selected category (case-insensitive)
      const matching = await ConsumptionHabit.find({
        category: { $regex: new RegExp(`^${category}$`, "i") }
      }).lean();

      // Group habits by userEmail
      const userMap = new Map();
      for (const doc of matching) {
        if (!userMap.has(doc.userEmail)) {
          userMap.set(doc.userEmail, []);
        }
        userMap.get(doc.userEmail).push(doc);
      }

      // Build response for each user
      users = await Promise.all(
        Array.from(userMap.entries()).map(async ([email, records]) => {
          // Find max value record
          const maxValueRecord = records.reduce(
            (max: any, curr: any) =>
              curr.value > (max?.value ?? -Infinity) ? curr : max,
            null
          );

          // Sort by month/year and take last 3 for graph display
          const sorted = records
            .sort(
              (a: any, b: any) =>
                b.year - a.year || b.month - a.month
            )
            .slice(0, 3)
            .reverse();

          // Fetch user details
const userDoc = await User.findOne({ email }).lean<IUser | null>();

          return {
            name: userDoc?.name || email,
            email,
            phone: userDoc?.phone || "",
            photo: userDoc?.photo || "",
            improvementScore: userDoc?.improvementScore || 0,
            valuesByMonth: sorted.map((r: any) => ({
              month: r.month,
              year: r.year,
              value: r.value
            })),
            maxValue: maxValueRecord ? maxValueRecord.value : 0,
            talked: userDoc?.talked || false
          };
        })
      );

      // Sort users by max value (descending) and keep top 3
      users = users
        .sort((a, b) => (b.maxValue || 0) - (a.maxValue || 0))
        .slice(0, 3);
    }

    return NextResponse.json({ users });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// PATCH /api/company/users/:email/talked
export async function PATCH(req: NextRequest) {
  try {
    // Ensure only company users may update this field
    const auth = await requireAuth("company");
    if (!auth.ok) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    await connectDB();

    // Extract email from URL
    const url = new URL(req.url);
    const match = url.pathname.match(/\/api\/company\/users\/(.+)\/talked/);
    const userEmail = match ? decodeURIComponent(match[1]) : null;

    if (!userEmail) {
      return NextResponse.json(
        { error: "Missing email parameter" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Toggle the "talked" field
    const currentValue = user.get("talked") || false;
    user.set("talked", !currentValue);
    await user.save();

    return NextResponse.json({ success: true, talked: user.get("talked") });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to update talk status" },
      { status: 500 }
    );
  }
}
