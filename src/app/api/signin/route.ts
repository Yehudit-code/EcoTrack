import { NextResponse } from "next/server";
<<<<<<< HEAD
=======
import { connectDB } from "@/app/services/server/mongodb";
>>>>>>> 909fb81e7e3b5ceec1ff457d2524774abe6985d8
import bcrypt from "bcryptjs";
import { connectDB } from "@/app/lib/db";
import { IUser, User } from "@/app/models/User";
import { signJwt } from "@/app/lib/auth/jwt";

export async function POST(req: Request) {
<<<<<<< HEAD
  await connectDB();

  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 }
    );
=======
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
>>>>>>> 909fb81e7e3b5ceec1ff457d2524774abe6985d8
  }

  // const user = await User.findOne({ email }).lean();
  const user = await User.findOne({ email }).lean<IUser>();
  if (!user) {
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 }
    );
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 }
    );
  }

  const token = await signJwt({
    userId: String(user._id),
    email: user.email,
    role: user.role
  });

  const response = NextResponse.json(
    {
      user: {
        _id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role,
        photo: user.photo,
        companyCategory: user.companyCategory
      }
    },
    { status: 200 }
  );

  response.cookies.set("ecotrack-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  });

  return response;
}
