import { connectDB } from "@/app/services/server/mongodb";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // Connect to database
    const db = await connectDB();
    const usersCollection = db.collection("Users");

    // Check if user exists
    const user = await usersCollection.findOne({ email });

    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
    }

    let isPasswordValid = false;

    // 🔹 If password is stored encrypted
    if (user.password && user.password.startsWith("$2b$")) {
      isPasswordValid = await bcrypt.compare(password, user.password);
    } else {
      // 🔹 If password is stored as plain text
      isPasswordValid = password === user.password;
    }

    if (!isPasswordValid) {
      return new Response(JSON.stringify({ error: "Invalid password" }), { status: 401 });
    }

    // Success
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
