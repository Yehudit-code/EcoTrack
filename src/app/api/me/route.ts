import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { connectDB } from "@/app/lib/db";
import { User } from "@/app/models/User";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function GET() {
  try {
    // Read cookies (Next.js returns a Promise)
    const cookieStore = await cookies();
    const token = cookieStore.get("ecotrack-token")?.value;

    if (!token) {
      return NextResponse.json(
        { user: null },
        { status: 401 }
      );
    }

    // Verify JWT
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(JWT_SECRET)
    );

    // Load user from database
    await connectDB();
    const user = await User.findById(payload.userId)
      .select("-password")
      .lean();

    if (!user) {
      return NextResponse.json(
        { user: null },
        { status: 401 }
      );
    }

    // Return authenticated user
    return NextResponse.json({ user });
  } catch (error) {
    console.error("GET /api/me failed:", error);
    return NextResponse.json(
      { user: null },
      { status: 401 }
    );
  }
}
