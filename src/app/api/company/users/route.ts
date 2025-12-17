// src/app/api/company/users/route.ts
import { NextResponse } from "next/server";
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
    if (!companyDoc) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    const companyId = companyDoc._id.toString();
    console.log("GET COMPANY ID:", companyId);

    // --- Get category ---
    const { searchParams } = new URL(req.url);
    const rawCategory = searchParams.get("category") || "electricity";
    const category = categoryMap[rawCategory.toLowerCase()] || rawCategory;

    // --- Fetch habits ---
    const habits = await ConsumptionHabit.find({ category }).lean<HabitDoc[]>();

    // --- Group by email ---
    const grouped = new Map<string, HabitDoc[]>();
    habits.forEach((h) => {
      const cleanEmail = h.userEmail.trim().toLowerCase().normalize("NFKC");
      if (!grouped.has(cleanEmail)) grouped.set(cleanEmail, []);
      grouped.get(cleanEmail)!.push(h);
    });

    // --- Build final user objects ---
    let users = await Promise.all(
      Array.from(grouped.entries()).map(async ([email, records]) => {
        const cleanEmail = email.trim().toLowerCase().normalize("NFKC");

        const userFromEmail = await User.findOne({ email: cleanEmail }).lean<IUser | null>();
        if (!userFromEmail) {
          console.log("NO USER IN Users FOR EMAIL:", cleanEmail);
          return null;
        }

        const userDoc = await User.findById(userFromEmail._id).lean<IUser | null>();
        if (!userDoc) {
          console.log("USER DOC NOT FOUND FOR ID:", userFromEmail._id);
          return null;
        }

        console.log("FOUND USER:", cleanEmail, "->", userDoc._id);
        console.log("TALKED RAW:", userDoc.talkedByCompanies);
        console.log("TALKED FOR COMPANY:", userDoc.talkedByCompanies?.[companyId]);

        // --- Sort consumption values newest → oldest ---
        const sorted = records.sort((a, b) => {
          if (a.year !== b.year) return b.year - a.year;
          return b.month - a.month;
        });

        // --- Average consumption ---
        const avgValue =
          records.length === 0
            ? 0
            : records.reduce((sum, r) => sum + r.value, 0) / records.length;


        return {
          _id: userDoc._id.toString(),
          name: userDoc.name || cleanEmail.split("@")[0],
          email: cleanEmail,
          phone: userDoc.phone || "",
          photo: userDoc.photo || "",
          improvementScore: userDoc.improvementScore || 0,
          valuesByMonth: sorted,
          avgValue,
          talked: userDoc.talkedByCompanies?.[companyId] || false,
        };
      })
    );

    // --- Remove nulls + sort by consumption high → low ---
    users = users
      .filter((u) => u && u._id)
      .sort((a, b) => {
        const avgA = a?.avgValue ?? 0;
        const avgB = b?.avgValue ?? 0;
        return avgB - avgA; // גבוה → נמוך
      });

  return NextResponse.json({ users });
} catch (err) {
  console.error("GET /company/users error:", err);
  return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
}
}
