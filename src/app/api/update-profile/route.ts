import { connectDB } from "@/app/services/server/mongodb";

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const {
      email,
      name,
      phone,
      birthDate,
      companies,

      bankName,
      branch,
      accountNumber,
      accountOwner,
    } = body;

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const db = await connectDB();
    const usersCollection = db.collection("Users");

    const updateFields: any = {
      name,
      phone,
      birthDate,
      companies,
      bankName,
      branch,
      accountNumber,
      accountOwner,
      updatedAt: new Date(),
    };

    const result = await usersCollection.updateOne(
      { email },
      { $set: updateFields }
    );

    if (result.modifiedCount === 0) {
      return new Response(
        JSON.stringify({ error: "User not found or no changes" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log(`✅ Profile updated for user: ${email}`);

    return new Response(
      JSON.stringify({ message: "Profile updated successfully" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("❌ Update profile error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
