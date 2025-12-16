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

    let user = await User.findOne({ email });
    let isNewUser = false;

    if (!user) {
      // New user – role is allowed only on creation
      isNewUser = true;

      user = await User.create({
        email,
        name,
        role: role || "user",
        companyCategory:
          role === "company" ? companyCategory : undefined,
        photo: photoURL,
        provider: "google",
      });
    } else {
      // Existing user – role & category must NOT change
      user.name = name;

      const hasCustomPhoto =
        user.photo &&
        typeof user.photo === "string" &&
        !user.photo.startsWith("http");

      if (!hasCustomPhoto && photoURL) {
        user.photo = photoURL;
      }

      user.provider = "google";
      await user.save();
    }

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
        isNewUser,
      },
      { status: 200 }
    );

    response.cookies.set("ecotrack-token", token, {
      httpOnly: true,
      secure: false, // local dev
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
