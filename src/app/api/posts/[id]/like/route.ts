import { connectDB } from "@/app/services/server/mongodb";
import { ObjectId } from "mongodb";

export async function POST(
  req: Request,
  context: { params: { id: string } }
) {
  const { id } = context.params;

  try {
    const db = await connectDB();
    const posts = db.collection("Posts");

    await posts.updateOne(
      { _id: new ObjectId(id) },
      { $inc: { likes: 1 } }
    );

    const updatedPost = await posts.findOne({ _id: new ObjectId(id) });

    return Response.json(updatedPost, { status: 200 });
  } catch (error) {
    console.error("LIKE ERROR:", error);
    return Response.json({ error: "Failed to like post" }, { status: 500 });
  }
}
