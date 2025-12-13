// src/app/api/company/users/route.ts

import { NextResponse, NextRequest } from "next/server";
import { IUser, User } from "@/app/models/User";
import { connectDB } from "@/app/lib/db";
import { ConsumptionHabit } from "@/app/models/ConsumptionHabit";
import { requireAuth } from "@/app/lib/auth/serverAuth";

interface HabitDoc {
  userEmail: string;
  month: number;
  year: number;
  value: number;
}

export async function GET(req: Request) {
  try {
    const auth = await requireAuth("company");
    if (!auth.ok) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    await connectDB();

    // Get company info
    const companyEmail = auth.user.email;
    const companyDoc = await User.findOne({ email: companyEmail }).lean<IUser>();
    if (!companyDoc) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    const companyId = companyDoc._id.toString();

    const { searchParams } = new URL(req.url);
    const all = searchParams.get("all");

    let users: any[] = [];

    if (all === "true") {
      const habits = await ConsumptionHabit.find({}).lean<HabitDoc[]>();
      return NextResponse.json({ users: habits });
    }

    const category = searchParams.get("category") || "electricity";

    // Fetch category habits
    const matching = await ConsumptionHabit.find({
      category: { $regex: new RegExp(`^${category}$`, "i") }
    }).lean<HabitDoc[]>();

    // Group by userEmail
    const userMap = new Map<string, HabitDoc[]>();
    matching.forEach((doc) => {
      if (!userMap.has(doc.userEmail)) userMap.set(doc.userEmail, []);
      userMap.get(doc.userEmail)!.push(doc);
    });

    users = await Promise.all(
      Array.from(userMap.entries()).map(async ([email, records]) => {
        const userDoc = await User.findOne({ email }).lean<IUser | null>();
        if (!userDoc) return null;

        const maxValueRecord = records.reduce<HabitDoc | null>(
          (max, curr) => (!max || curr.value > max.value ? curr : max),
          null
        );

        const sorted = [...records]
          .sort((a, b) => b.year - a.year || b.month - a.month)
          .slice(0, 3)
          .reverse();

        return {
          _id: userDoc._id.toString(),
          name: userDoc.name || email,
          email,
          phone: userDoc.phone || "",
          photo: userDoc.photo || "",
          improvementScore: userDoc.improvementScore || 0,
          valuesByMonth: sorted.map((r) => ({
            month: r.month,
            year: r.year,
            value: r.value
          })),
          maxValue: maxValueRecord?.value ?? 0,
          talked: userDoc.talkedByCompanies?.get(companyId) || false
        };
      })
    );

    users = users.filter((u) => u !== null);

    users = users
      .sort((a, b) => (b.maxValue ?? 0) - (a.maxValue ?? 0))
      .slice(0, 3);

    return NextResponse.json({ users });
  } catch (err) {
    console.error("GET /company/users error:", err);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// PATCH — NO TS ERRORS
export async function PATCH(req: NextRequest) {
  try {
    const auth = await requireAuth("company");
    if (!auth.ok) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    await connectDB();

    const companyEmail = auth.user.email;
    const companyDoc = await User.findOne({ email: companyEmail }).lean<IUser>();
    if (!companyDoc) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    const companyId = companyDoc._id.toString();

    const url = new URL(req.url);
    const match = url.pathname.match(/\/api\/company\/users\/(.+)\/talked/);
    const userEmail = match ? decodeURIComponent(match[1]) : null;

    if (!userEmail) {
      return NextResponse.json({ error: "Missing email parameter" }, { status: 400 });
    }

    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.talkedByCompanies) user.talkedByCompanies = new Map<string, boolean>();

    const current = user.talkedByCompanies.get(companyId) || false;
    user.talkedByCompanies.set(companyId, !current);

    await user.save();

    return NextResponse.json({
      success: true,
      talked: user.talkedByCompanies.get(companyId)
    });
  } catch (err) {
    console.error("PATCH /company/users error:", err);
    return NextResponse.json(
      { error: "Failed to update talk status" },
      { status: 500 }
    );
  }
}
