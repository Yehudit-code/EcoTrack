import { NextResponse } from "next/server";
import { connectDB } from "@/app/services/server/mongodb";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const db = await connectDB();
    const usersCollection = db.collection("Users");
    const user = await usersCollection.findOne({ email });

    // אם אין משתמש - לא ליצור קוקי
    if (!user) {
      return NextResponse.json(
        { exists: false, user: null },
        { status: 200 }
      );
    }

    // משתמש קיים - ליצור קוקי auth
    const res = NextResponse.json(
      { exists: true, user },
      { status: 200 }
    );

    res.cookies.set("auth", user.email, {
      path: "/",
      maxAge: 60 * 60 * 24, // יום שלם
      sameSite: "lax",
    });

    return res;

  } catch (error) {
    console.log("Error in check-user:", error);
    return NextResponse.json(
      { exists: false, user: null },
      { status: 500 }
    );
  }
}