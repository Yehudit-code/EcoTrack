import { NextResponse } from "next/server";
import { User } from "@/app/models/User"; // המודל שלך
import { connectDB } from "@/app/lib/db";
import { ObjectId } from "mongodb";

// GET /api/company/users
export async function GET(req: Request) {
  try {
    await connectDB();

    // מאפשר לקבל companyCategory מ-query param או להשתמש בברירת מחדל
    const { searchParams } = new URL(req.url);
    const companyCategory = searchParams.get("category") || "electricity";

    // שולף משתמשים לפי הקטגוריה, ממיין לפי improvementScore
    const users = await User.find({ companyCategory })
      .select("-password")
      .sort({ improvementScore: -1 })
      .limit(4)
      .lean();

    return NextResponse.json({ users });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

// PATCH /api/company/users/:id/talked
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const userId = params.id;

    if (!ObjectId.isValid(userId)) {
      return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // אם השדה לא קיים, יוצרים אותו. אחרת הופכים את הערך
    const currentTalked = user.get("talked") || false;
    user.set("talked", !currentTalked);
    await user.save();

    return NextResponse.json({ success: true, talked: user.get("talked") });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update talk status" }, { status: 500 });
  }
}
