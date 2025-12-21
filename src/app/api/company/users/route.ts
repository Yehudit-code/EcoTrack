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

//  case-insensitive exact-match regex
function emailRegex(email: string) {
  const clean = decodeURIComponent(email).trim().normalize("NFKC");
  const escaped = clean.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`^${escaped}$`, "i");
}

//תומך גם ב-Map וגם ב-Object
function getTalkedValue(
  talkedByCompanies: any,
  companyId: string
): boolean {
  if (!talkedByCompanies) return false;
  if (talkedByCompanies instanceof Map) {
    return talkedByCompanies.get(companyId) ?? false;
  }
  if (typeof talkedByCompanies === "object") {
    return talkedByCompanies[companyId] ?? false;
  }
  return false;
}

export async function GET(req: Request) {
  try {
    // --- Auth ---
    const auth = await requireAuth("company");
    if (!auth.ok) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // --- Get company ( case-insensitive) ---
    const companyDoc = await User.findOne({
      email: emailRegex(auth.user.email),
    }).lean<IUser | null>();

    if (!companyDoc) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    const companyId = companyDoc._id.toString();
    console.log("GET COMPANY ID:", companyId);

    // --- Get category ---
    const { searchParams } = new URL(req.url);
    const rawCategory = searchParams.get("category") || "electricity";
    const mappedCategory = categoryMap[rawCategory.toLowerCase()] || rawCategory;

    const habits = await ConsumptionHabit.find({
      category: { $in: [mappedCategory, rawCategory, rawCategory.toLowerCase()] },
    }).lean<HabitDoc[]>();

    // --- Group by email 
    const grouped = new Map<string, HabitDoc[]>();
    habits.forEach((h) => {
      const key = (h.userEmail || "").trim().toLowerCase().normalize("NFKC");
      if (!key) return;
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(h);
    });

    // --- Build final user objects ---
    let users = await Promise.all(
      Array.from(grouped.entries()).map(async ([emailKey, records]) => {
        const userDoc = await User.findOne({
          email: emailRegex(emailKey),
          role: "user",
        }).lean<IUser | null>();

        if (!userDoc) {
          console.log("NO USER IN Users FOR EMAIL:", emailKey);
          return null;
        }

        // --- Sort consumption values newest → oldest ---
        const sorted = [...records].sort((a, b) => {
          if (a.year !== b.year) return b.year - a.year;
          return b.month - a.month;
        });

        // --- Average consumption ---
        const avgValue =
          records.length === 0
            ? 0
            : records.reduce((sum, r) => sum + Number(r.value || 0), 0) / records.length;

        const talked = getTalkedValue(userDoc.talkedByCompanies, companyId);

        return {
          _id: userDoc._id.toString(),
          name: userDoc.name || (userDoc.email ? userDoc.email.split("@")[0] : "User"),
          email: userDoc.email,
          phone: userDoc.phone || "",
          photo: userDoc.photo ||  "",
          improvementScore: userDoc.improvementScore || 0,
          valuesByMonth: sorted,
          avgValue,
          talked,
        };
      })
    );

    users = users
      .filter((u): u is NonNullable<typeof u> => Boolean(u && u._id))
      .sort((a, b) => (b.avgValue ?? 0) - (a.avgValue ?? 0));

    return NextResponse.json({ users });
  } catch (err) {
    console.error("GET /company/users error:", err);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
