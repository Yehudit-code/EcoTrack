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

    if (!user) {
      return NextResponse.json(
        { exists: false, user: null },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { exists: true, user },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error in check-user:", error);
    return NextResponse.json(
      { exists: false, user: null },
      { status: 500 }
    );
  }
}
