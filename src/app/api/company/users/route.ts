// src/app/api/company/users/route.ts

import { NextRequest, NextResponse } from "next/server";
import { User, IUser } from "@/app/models/User";
import { ConsumptionHabit } from "@/app/models/ConsumptionHabit";
import { connectDB } from "@/app/lib/db";
import { requireAuth } from "@/app/lib/auth/serverAuth";

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

// Shape of a ConsumptionHabit document when using .lean()
interface HabitDoc {
  userEmail: string;
  month: number;
  year: number;
  value: number;
}

// IUser adapted for .lean() (Map -> plain object)
type LeanUser = Omit<IUser, "talkedByCompanies"> & {
  talkedByCompanies?: Record<string, boolean>;
};

/* ------------------------------------------------------------------ */
/* GET /api/company/users                                              */
/* ------------------------------------------------------------------ */

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth("company");
    if (!auth.ok) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    await connectDB();

    // Company identity
    const companyEmail = auth.user.email;
    const companyDoc = await User.findOne({ email: companyEmail }).lean<IUser>();
    if (!companyDoc) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
    }

    const companyId = companyDoc._id.toString();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");

    if (!category) {
      return NextResponse.json(
        { error: "Missing category parameter" },
        { status: 400 }
      );
    }

    // Fetch consumption habits by category (case-insensitive)
    const habits = await ConsumptionHabit.find({
      category: { $regex: new RegExp(`^${category}$`, "i") },
    }).lean<HabitDoc[]>();

    // Group habits by userEmail
    const habitsByUser = new Map<string, HabitDoc[]>();
    for (const h of habits) {
      if (!habitsByUser.has(h.userEmail)) {
        habitsByUser.set(h.userEmail, []);
      }
      habitsByUser.get(h.userEmail)!.push(h);
    }

    const users = await Promise.all(
      Array.from(habitsByUser.entries()).map(async ([email, records]) => {
        const userDoc = await User.findOne({ email }).lean<LeanUser | null>();
        if (!userDoc) return null;

        // Highest consumption value
        const maxValue = records.reduce(
          (max, r) => (r.value > max ? r.value : max),
          0
        );

        // Last 3 months (chronological)
        const lastThree = [...records]
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
          valuesByMonth: lastThree.map((r) => ({
            month: r.month,
            year: r.year,
            value: r.value,
          })),
          maxValue,
          talked: Boolean(userDoc.talkedByCompanies?.[companyId]),
        };
      })
    );

    // Remove nulls, sort by maxValue, take top 3
    const result = users
      .filter(Boolean)
      .sort((a, b) => (b!.maxValue ?? 0) - (a!.maxValue ?? 0))
      .slice(0, 3);

    return NextResponse.json(result);
  } catch (err) {
    console.error("GET /api/company/users error:", err);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

/* ------------------------------------------------------------------ */
/* PATCH /api/company/users/[email]/talked                             */
/* ------------------------------------------------------------------ */

export async function PATCH(req: NextRequest) {
  try {
    const auth = await requireAuth("company");
    if (!auth.ok) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    await connectDB();

    const companyEmail = auth.user.email;
    const companyDoc = await User.findOne({ email: companyEmail });
    if (!companyDoc) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
    }

    const companyId = companyDoc._id.toString();

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

    if (!user.talkedByCompanies) {
      user.talkedByCompanies = new Map<string, boolean>();
    }

    const current = user.talkedByCompanies.get(companyId) || false;
    user.talkedByCompanies.set(companyId, !current);

    await user.save();

    return NextResponse.json({
      success: true,
      talked: user.talkedByCompanies.get(companyId),
    });
  } catch (err) {
    console.error("PATCH /api/company/users error:", err);
    return NextResponse.json(
      { error: "Failed to update talk status" },
      { status: 500 }
    );
  }
}
