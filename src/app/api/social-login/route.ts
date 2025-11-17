import { connectDB } from "@/app/services/server/mongodb";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, name, photo, provider, role } = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const db = await connectDB();
    const usersCollection = db.collection("Users");

    // בדיקה אם המשתמש קיים
    let user = await usersCollection.findOne({ email });

    if (!user) {
      // random password
      const randomPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      const newUser = {
        email,
        name: name || email.split("@")[0],
        photo,
        provider,
        password: hashedPassword,
        role: role === "company" ? "company" : "user",
        createdAt: new Date(),

        // שדות נוספים (אם תרצי)
        country: "Israel",
        birthDate: null,
        companyCategory: null,
      };

      const result = await usersCollection.insertOne(newUser);
      user = { _id: result.insertedId, ...newUser };

      console.log("🆕 Created social-login user:", user.email);
    }

    return new Response(
      JSON.stringify({ success: true, user }),
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
