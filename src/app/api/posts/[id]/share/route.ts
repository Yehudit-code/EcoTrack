import { connectDB } from "@/app/services/server/mongodb";
import { ObjectId } from "mongodb";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    const db = await connectDB();
    const posts = db.collection("Posts");

    await posts.updateOne(
      { _id: new ObjectId(id) },
      { $inc: { shares: 1 } }
    );

    const updated = await posts.findOne({ _id: new ObjectId(id) });

    return Response.json(updated, { status: 200 });
  } catch (error) {
    console.error("SHARE ERROR:", error);
    return Response.json({ error: "Failed to share post" }, { status: 500 });
  }
}
