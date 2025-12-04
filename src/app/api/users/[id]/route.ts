import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/app/services/server/mongodb";
import { ObjectId } from "mongodb";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // ⬅️ חובה! מחכים ל־params כי הוא Promise
    const { id } = await context.params;

    const db = await connectDB();
    const users = db.collection("Users");

    let user;

    if (ObjectId.isValid(id)) {
      user = await users.findOne(
        { _id: new ObjectId(id) },
        { projection: { password: 0 } }
      );
    } else {
      user = await users.findOne(
        { email: id },
        { projection: { password: 0 } }
      );
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (err) {
    console.error("❌ USER API ERROR:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
