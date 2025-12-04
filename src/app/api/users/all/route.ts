import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/app/services/server/mongodb";

export async function GET(req: NextRequest) {
  try {
    const db = await connectDB();
    const users = await db
      .collection("Users")
      .find({}, { projection: { password: 0 } })
      .toArray();

    return NextResponse.json({ users }, { status: 200 });
  } catch (err) {
    console.error("🔥 /api/users error:", err);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
