import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/app/lib/db";
import { User } from "@/app/models/User";
import { signJwt } from "@/app/lib/auth/jwt";

export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();
    const { name, email, password, role, photo, companyCategory } = body || {};

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const existing = await User.findOne({ email }).lean();
    if (existing) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    const hashed = await bcrypt.hash(password, 10);

    const created = await User.create({
      name,
      email,
      password: hashed,
      role,
      companyCategory: role === "company" ? companyCategory : undefined,
      photo,
    });

    const token = await signJwt({
      userId: String(created._id),
      email: created.email,
      role: created.role,
    });

    const response = NextResponse.json(
      {
        user: {
          _id: String(created._id),
          name: created.name,
          email: created.email,
          role: created.role,
          companyCategory: created.companyCategory,
          photo: created.photo,
        },
      },
      { status: 201 }
    );

    response.cookies.set("ecotrack-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (err) {
    console.error("Sign-up error:", err);
    return NextResponse.json(
      { error: "Failed to sign up" },
      { status: 500 }
    );
  }
}
