import { NextResponse } from "next/server";
import { connectDB } from "@/app/services/server/mongodb";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, name, photoURL, role, companyCategory } = await req.json();

    const db = await connectDB();
    const usersCollection = db.collection("Users");

    let user = await usersCollection.findOne({ email });

    // 🟢 אם המשתמש קיים – לעדכן אותו!
    if (user) {
      const updatedUser = {
        ...user,
        name: name || user.name,
        photo: photoURL || user.photo,
        photoURL: photoURL || user.photoURL,
        provider: "google",
        role: role || user.role,
        companyCategory: companyCategory ?? user.companyCategory,
      };

      await usersCollection.updateOne(
        { email },
        { $set: updatedUser }
      );

      user = updatedUser;
    }

    if (user) {
      // האם למשתמש יש תמונה שהועלתה ידנית? (base64 או קובץ)
      const hasCustomPhoto =
        user.photo &&
        typeof user.photo === "string" &&
        !user.photo.startsWith("http");

      const updatedUser = {
        ...user,
        name: name || user.name,

        // 🟢 אם יש תמונה שהמשתמש העלה — אל תדרסי!
        photo: hasCustomPhoto
          ? user.photo
          : photoURL || user.photo,

        // 🟢 שמירת תמונת גוגל בנפרד
        photoURL: photoURL || user.photoURL,

        provider: "google",
        role: role || user.role,
        companyCategory: companyCategory ?? user.companyCategory,
      };

      await usersCollection.updateOne(
        { email },
        { $set: updatedUser }
      );

      user = updatedUser;
    }


    const res = NextResponse.json(
      { user, message: "Social login successful" },
      { status: 200 }
    );

    res.cookies.set("auth", user.email, {
      path: "/",
      maxAge: 60 * 60 * 24,
      sameSite: "lax",
    });

    return res;

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}