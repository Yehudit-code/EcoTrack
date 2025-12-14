import { NextRequest, NextResponse } from "next/server";
import { User, IUser } from "@/app/models/User";
import { ConsumptionHabit } from "@/app/models/ConsumptionHabit";
import { connectDB } from "@/app/lib/db";
import { requireAuth } from "@/app/lib/auth/serverAuth";
import type { HabitDoc, LeanUser } from "@/app/types/companyUsers";

/* ------------------------------------------------------------------ */
/* GET /api/company/users                                              */
/* ------------------------------------------------------------------ */

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth("company");
    if (!auth.ok) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const companyEmail = auth.user.email;
    const companyDoc = await User.findOne({ email: companyEmail }).lean<IUser>();
    if (!companyDoc) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    const companyId = companyDoc._id.toString();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");

    if (!category) {
      return NextResponse.json(
        { error: "Missing category" },
        { status: 400 }
      );
    }

    const habits = await ConsumptionHabit.find({
      category: { $regex: new RegExp(`^${category}$`, "i") },
    }).lean<HabitDoc[]>();

    const grouped = new Map<string, HabitDoc[]>();
    for (const h of habits) {
      if (!grouped.has(h.userEmail)) grouped.set(h.userEmail, []);
      grouped.get(h.userEmail)!.push(h);
    }

    const users = await Promise.all(
      Array.from(grouped.entries()).map(async ([email, records]) => {
        const user = await User.findOne({ email }).lean<LeanUser | null>();
        if (!user) return null;

        const maxValue = records.reduce(
          (m, r) => (r.value > m ? r.value : m),
          0
        );

        const lastThree = [...records]
          .sort((a, b) => b.year - a.year || b.month - a.month)
          .slice(0, 3)
          .reverse();

        return {
          _id: user._id.toString(),
          name: user.name || email,
          email,
          phone: user.phone || "",
          photo: user.photo || "",
          improvementScore: user.improvementScore || 0,
          valuesByMonth: lastThree,
          maxValue,
          talked: Boolean(user.talkedByCompanies?.[companyId]),
        };
      })
    );

    return NextResponse.json(
      users
        .filter(Boolean)
        .sort((a, b) => b!.maxValue - a!.maxValue)
        .slice(0, 3)
    );
  } catch (err) {
    console.error("GET /company/users error:", err);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
