import { connectDB } from "@/app/services/server/mongodb";
import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";

export async function POST(req: Request) {
  try {
    const { name, email, password, role, photo, companyCategory } = await req.json();

    if (!email || !password) {
      return new Response(JSON.stringify({ error: "Email and password are required" }), {
        status: 400,
      });
    }

    const db = await connectDB();
    const usersCollection = db.collection("Users");

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return new Response(JSON.stringify({ error: "User already exists" }), { status: 409 });
    }

    // Encrypt password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      name,
      email,
      password: hashedPassword,
      role,
      photo: photo || null,
      companyCategory: role === "company" ? companyCategory || null : null,
      provider: "email",
      createdAt: new Date(),
    };

    // Insert user
    const result = await usersCollection.insertOne(newUser);

    // ⬅️ FETCH full user exactly as stored in DB
    const savedUser = await usersCollection.findOne({ _id: result.insertedId });

    console.log("✅ User registered:", savedUser?.email);

    return new Response(
      JSON.stringify({
        message: "User registered successfully",
        user: savedUser, // ✔️ full user object
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
