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
const categoryMap: Record<string, string> = {
  electricity: "Electricity",
  water: "Water",
  gas: "Gas",
  transportation: "Transportation",
  waste: "Waste"
};

export async function GET(req: Request) {
  try {
    const auth = await requireAuth("company");
    console.log("Auth result:", auth);

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

    const { searchParams } = new URL(req.url);
    const all = searchParams.get("all");

    if (all === "true") {
      const habits = await ConsumptionHabit.find({}).lean<HabitDoc[]>();
      return NextResponse.json({ users: habits });
    }

    const rawCategory = searchParams.get("category") || "electricity";
    console.log("🔥 Raw category:", rawCategory);

    const category = categoryMap[rawCategory.toLowerCase()] || rawCategory;
    console.log("🔥 Final category:", category);

    const matching = await ConsumptionHabit.find({ category }).lean<HabitDoc[]>();
    console.log("🔥 Matching docs:", matching.length);

    const userMap = new Map<string, HabitDoc[]>();
    matching.forEach((doc) => {
      if (!userMap.has(doc.userEmail)) userMap.set(doc.userEmail, []);
      userMap.get(doc.userEmail)!.push(doc);
    });

    const users = await Promise.all(
      Array.from(userMap.entries()).map(async ([email, records]) => {
        const userDoc = await User.findOne({ email }).lean<IUser | null>();

        const maxValueRecord = records.reduce<HabitDoc | null>(
          (max, curr) => (!max || curr.value > max.value ? curr : max),
          null
        );

        const sorted = [...records]
          .sort((a, b) => b.year - a.year || b.month - a.month)
          .slice(0, 3)
          .reverse();

        const fallbackName = email.split("@")[0];

        return {
          _id: userDoc?._id?.toString() || null,
          name: userDoc?.name || fallbackName,
          email,
          phone: userDoc?.phone || "",
          photo: userDoc?.photo || "",
          improvementScore: userDoc?.improvementScore || 0,
          valuesByMonth: sorted.map((r) => ({
            month: r.month,
            year: r.year,
            value: r.value,
          })),
          maxValue: maxValueRecord?.value ?? 0,
          talked: userDoc?.talkedByCompanies?.[companyId] || false
        };
      })
    );

    return NextResponse.json({ users });
  } catch (err) {
    console.error("GET /company/users error:", err);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
} // ←←← סגירה נכונה של GET כאן!!!




// --------------------------------------------------
// PATCH
// --------------------------------------------------
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

    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.talkedByCompanies) user.talkedByCompanies = {};

    const current = user.talkedByCompanies[companyId] || false;
    user.talkedByCompanies[companyId] = !current;

    await user.save();

    return NextResponse.json({
      success: true,
      talked: user.talkedByCompanies[companyId]
    });
  } catch (err) {
    console.error("PATCH /company/users error:", err);
    return NextResponse.json(
      { error: "Failed to update talk status" },
      { status: 500 }
    );
  }
}


