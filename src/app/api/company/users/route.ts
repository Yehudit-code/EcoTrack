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
  waste: "Waste",
};

export async function GET(req: Request) {
  try {
    // --- Auth ---
    const auth = await requireAuth("company");
    if (!auth.ok) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // --- Get company ---
    const companyDoc = await User.findOne({ email: auth.user.email }).lean<IUser | null>();
    if (!companyDoc) return NextResponse.json({ error: "Company not found" }, { status: 404 });

    const companyId = companyDoc._id.toString();

    // --- Get category ---
    const { searchParams } = new URL(req.url);
    const rawCategory = searchParams.get("category") || "electricity";
    const category = categoryMap[rawCategory.toLowerCase()] || rawCategory;

    // --- Fetch habits ---
    const habits = await ConsumptionHabit.find({ category }).lean<HabitDoc[]>();

    // --- Group by email ---
    const grouped = new Map<string, HabitDoc[]>();
    habits.forEach((h) => {
      if (!grouped.has(h.userEmail)) grouped.set(h.userEmail, []);
      grouped.get(h.userEmail)!.push(h);
    });

    // --- Build final user objects ---
    let users = await Promise.all(
      Array.from(grouped.entries()).map(async ([email, records]) => {
        const userDoc = await User.findOne({ email }).lean<IUser | null>();

        const sorted = records
          .sort((a, b) => b.year - a.year || b.month - a.month)
          .slice(0, 3)
          .reverse();

        const maxValueRecord = records.reduce(
          (max, r) => (max === null || r.value > max.value ? r : max),
          null as HabitDoc | null
        );

        return {
          _id: userDoc?._id?.toString() || null,
          name: userDoc?.name || email.split("@")[0],
          email,
          phone: userDoc?.phone || "",
          photo: userDoc?.photo || "",
          improvementScore: userDoc?.improvementScore || 0,
          valuesByMonth: sorted,
          maxValue: maxValueRecord?.value ?? 0,
          talked: userDoc?.talkedByCompanies?.[companyId] || false,
        };
      })
    );

    users = users.filter((u) => u._id !== null).sort((a, b) => b.maxValue - a.maxValue).slice(0, 3);

    return NextResponse.json({ users });
  } catch (err) {
    console.error("GET /company/users error:", err);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

// --- PATCH ---
export async function PATCH(req: NextRequest) {
  try {
    const auth = await requireAuth("company");
    if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();

    const companyDoc = await User.findOne({ email: auth.user.email }).lean<IUser | null>();
    if (!companyDoc) return NextResponse.json({ error: "Company not found" }, { status: 404 });

    const companyId = companyDoc._id.toString();

    const url = new URL(req.url);
    const match = url.pathname.match(/\/api\/company\/users\/(.+)\/talked/);
    const userEmail = match ? decodeURIComponent(match[1]) : null;

    if (!userEmail) return NextResponse.json({ error: "Missing user email" }, { status: 400 });

    const user = await User.findOne({ email: userEmail });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const current = user.talkedByCompanies?.[companyId] || false;

    user.talkedByCompanies = {
      ...user.talkedByCompanies,
      [companyId]: !current,
    };

    await user.save();

    return NextResponse.json({ success: true, talked: !current });
  } catch (err) {
    console.error("PATCH /company/users error:", err);
    return NextResponse.json({ error: "Failed to update talk status" }, { status: 500 });
  }
}
