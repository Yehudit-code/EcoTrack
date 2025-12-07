import { NextResponse } from "next/server";
import { connectDB } from "@/app/services/server/mongodb";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    const db = await connectDB();
    const usersCollection = db.collection("Users");

    const user = await usersCollection.findOne({ email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isPasswordValid =
      user.password.startsWith("$2b$")
        ? await bcrypt.compare(password, user.password)
        : password === user.password;

    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    // ⭐ יצירת cookie כמו שצריך
    const res = NextResponse.json(
      { message: "Sign-in successful", user },
      { status: 200 }
    );

    res.cookies.set("auth", user.email, {
      path: "/",
      maxAge: 60 * 60 * 24,
      sameSite: "lax",
    });

    return res;

  } catch (error) {
    console.error("Signin error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
