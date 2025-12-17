import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/app/lib/db";
import { User, IUser } from "@/app/models/User";
import { signJwt } from "@/app/lib/auth/jwt";

export async function POST(req: Request) {
  await connectDB();

  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 }
    );
  }

  // Find user by email
  const user = await User.findOne({ email }).lean<IUser>();

  if (!user || !user.password) {
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 }
    );
  }

  // Verify password
  const valid = await bcrypt.compare(password, user.password);

  if (!valid) {
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 }
    );
  }

  // Create JWT (same payload as social-login)
  const token = await signJwt({
    userId: String(user._id),
    email: user.email,
    role: user.role,
  });

  const response = NextResponse.json(
    {
      user: {
        _id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role,
        photo: user.photo,
        companyCategory: user.companyCategory,
      },
    },
    { status: 200 }
  );

  // 🔑 Store JWT in HttpOnly cookie
  response.cookies.set("ecotrack-token", token, {
    httpOnly: true,
    secure: false, 
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
