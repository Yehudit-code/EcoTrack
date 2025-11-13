import { connectDB } from "@/app/services/server/mongodb";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // התחברות למסד
    const db = await connectDB();
    const usersCollection = db.collection("Users");

    // בדיקה אם המשתמש קיים
    const user = await usersCollection.findOne({ email });

    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
    }

    // השוואת סיסמה (אם היא מוצפנת)
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return new Response(JSON.stringify({ error: "Invalid password" }), { status: 401 });
    }

    // הצלחה
    console.log("✅ User signed in:", user.email);
    return new Response(
      JSON.stringify({ message: "Sign-in successful", user }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("❌ Sign-in API error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
