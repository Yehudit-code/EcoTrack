import { connectDB } from "@/app/services/server/mongodb";
import { ObjectId } from "mongodb";

export async function POST(
  req: Request,
  context: { params: { id: string } }
) {
  const { id } = context.params;

  try {
    const body = await req.json();
    const { text, userName, userPhoto } = body;

    if (!text || !userName) {
      return Response.json({ error: "Missing fields" }, { status: 400 });
    }

    const db = await connectDB();
    const posts = db.collection("Posts");

    const comment = {
      text,
      userName,
      userPhoto: userPhoto || null,
      createdAt: new Date(),
    };

    await posts.updateOne(
      { _id: new ObjectId(id) },
      { $push: { comments: comment } }
    );

    const updated = await posts.findOne({ _id: new ObjectId(id) });

    return Response.json(updated, { status: 200 });
  } catch (error) {
    console.error("COMMENT ERROR:", error);
    return Response.json({ error: "Failed to post comment" }, { status: 500 });
  }
}
