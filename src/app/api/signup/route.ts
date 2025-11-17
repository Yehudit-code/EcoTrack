import { connectDB } from "@/app/services/server/mongodb";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { name, email, password, role, photo } = await req.json();

    if (!email || !password) {
      return new Response(JSON.stringify({ error: "Email and password are required" }), {
        status: 400,
      });
    }

    const db = await connectDB();
    const usersCollection = db.collection("Users");

    // בדיקה אם המשתמש כבר קיים
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return new Response(JSON.stringify({ error: "User already exists" }), { status: 409 });
    }

    // הצפנת הסיסמה לפני שמירה
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      name,
      email,
      password: hashedPassword,
      role,
      photo,
      createdAt: new Date(),
    };

    await usersCollection.insertOne(newUser);

    console.log("✅ User registered:", newUser.email);

    return new Response(
      JSON.stringify({
        message: "User registered successfully",
        user: { name, email, role, photo },
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("❌ Signup error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
}
