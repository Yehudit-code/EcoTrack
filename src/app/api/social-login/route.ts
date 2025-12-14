import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import { User } from "@/app/models/User";
import { signJwt } from "@/app/lib/auth/jwt";

export async function POST(req: Request) {
  try {
    await connectDB();

    const {
      email,
      name,
      photoURL,
      role,
      companyCategory,
    } = await req.json();

    if (!email || !name) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Find user by email
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user (Google sign-up)
      user = await User.create({
        name,
        email,
        role: role || "user",
        companyCategory: role === "company" ? companyCategory : undefined,
        photo: photoURL,
        provider: "google",
      });
    } else {
      // Update existing user without overriding a custom uploaded photo
      const hasCustomPhoto =
        user.photo &&
        typeof user.photo === "string" &&
        !user.photo.startsWith("http");

      user.name = name;
      user.role = role || user.role;
      user.companyCategory =
        role === "company"
          ? companyCategory ?? user.companyCategory
          : user.companyCategory;

      if (!hasCustomPhoto && photoURL) {
        user.photo = photoURL;
      }

      user.provider = "google";
      await user.save();
    }

    // Create JWT identical to regular signin/signup
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
          companyCategory: user.companyCategory,
          photo: user.photo,
        },
      },
      { status: 200 }
    );

    // Store JWT in httpOnly cookie (used by proxy/middleware)
    response.cookies.set("ecotrack-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("Social login error:", error);
    return NextResponse.json(
      { error: "Social login failed" },
      { status: 500 }
    );
  }
}
