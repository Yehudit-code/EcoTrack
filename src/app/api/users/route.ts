import { NextRequest } from "next/server";
import { connectDB } from "@/app/services/server/mongodb";
import { ObjectId } from "mongodb";  // הכי חשוב!!!

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = await connectDB();

    const user = await db
      .collection("Users")
      .findOne(
        { _id: new ObjectId(params.id) },
        { projection: { password: 0 } }
      );

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    return Response.json(user);
  } catch (error) {
    console.error("🔥 API ERROR:", error);
    return Response.json({ error: "Failed to load user" }, { status: 500 });
  }
}
