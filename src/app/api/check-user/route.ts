import { connectDB } from "@/app/services/server/mongodb";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const db = await connectDB();
    const usersCollection = db.collection("Users");
    const user = await usersCollection.findOne({ email });

    return new Response(
      JSON.stringify({ exists: !!user, user }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.log("MongoDB not available, returning exists:false");
    return new Response(
      JSON.stringify({ exists: false, user: null }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }
}