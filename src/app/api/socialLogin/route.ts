import { connectDB } from "@/app/services/server/mongodb";

export async function POST(req: Request) {
  try {
    const { email, name, photo, provider } = await req.json();
    const db = await connectDB();
    const usersCollection = db.collection("Users");

    // בדיקה אם המשתמש קיים
    let user: any = await usersCollection.findOne({ email });

    if (!user) {
      const newUser = {
        email,
        name,
        provider,
        photo,
        createdAt: new Date(),
      };
      await usersCollection.insertOne(newUser);
      user = newUser;
      console.log("🆕 New social user added:", newUser);
    } else {
      console.log("✅ Existing user:", email);
    }

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
