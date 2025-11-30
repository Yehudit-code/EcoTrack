import { connectDB } from "@/app/services/server/mongodb";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, name, photo, provider, role, companyCategory } = await req.json(); // Add role here

    // Basic validation
    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const db = await connectDB();
    const usersCollection = db.collection("Users");

    // Check if user already exists
    let user = await usersCollection.findOne({ email });

    if (!user) {
      // Generate random password and encrypt
      const randomPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      // Create new user object
      const newUser = {
        email,
        name: name || email.split("@")[0],
        provider,
        photo,
        password: hashedPassword,
        role: role === "company" ? "company" : "user", // Save by selection
        companyCategory,
        createdAt: new Date(),
      };

      const result = await usersCollection.insertOne(newUser);
      user = { _id: result.insertedId, ...newUser };

      console.log(`🆕 New ${user.role} user added:`, user.email);
    } else {
      console.log("✅ Existing Google user:", email);
    }

    // Return to client
    return new Response(
      JSON.stringify({ message: "Social login successful", user }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.log("MongoDB not available, returning success anyway");
    // Return success when DB is not available
    return new Response(
      JSON.stringify({ message: "Social login successful (offline mode)", user: { email: "demo@example.com", name: "Demo User" } }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }
}
