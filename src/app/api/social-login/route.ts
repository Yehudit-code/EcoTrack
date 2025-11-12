import { connectDB } from "@/app/services/server/mongodb";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, name, photo, provider, role } = await req.json(); // נוסיף את role כאן

    // בדיקה בסיסית
    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const db = await connectDB();
    const usersCollection = db.collection("Users");

    // נבדוק אם המשתמש כבר קיים
    let user = await usersCollection.findOne({ email });

    if (!user) {
      // יצירת סיסמה רנדומלית והצפנה
      const randomPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      // יצירת אובייקט המשתמש החדש
      const newUser = {
        email,
        name: name || email.split("@")[0],
        provider,
        photo,
        password: hashedPassword,
        role: role === "company" ? "company" : "user", // ✅ שמירה לפי הבחירה
        createdAt: new Date(),
      };

      const result = await usersCollection.insertOne(newUser);
      user = { _id: result.insertedId, ...newUser };

      console.log(`🆕 New ${user.role} user added:`, user.email);
    } else {
      console.log("✅ Existing Google user:", email);
    }

    // החזרה ללקוח
    return new Response(
      JSON.stringify({ message: "Social login successful", user }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("❌ Social login error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
