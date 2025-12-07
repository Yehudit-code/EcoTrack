import { NextResponse } from "next/server";
import { connectDB } from "@/app/services/server/mongodb";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { name, email, password, role, photo, companyCategory } = await req.json();

    const db = await connectDB();
    const users = db.collection("Users");

    const exists = await users.findOne({ email });

    if (exists) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 10);

    const newUser = {
      name,
      email,
      password: hashed,
      role,
      photo: photo || null,
      companyCategory: role === "company" ? companyCategory : null,
      provider: "email",
    };

    await users.insertOne(newUser);

    const res = NextResponse.json(
      { message: "User registered", user: newUser },
      { status: 201 }
    );

    // ⭐ יצירת cookie
    res.cookies.set("auth", email, {
      path: "/",
      maxAge: 60 * 60 * 24,
      sameSite: "lax",
    });

    return res;

  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
