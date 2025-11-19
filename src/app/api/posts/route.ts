// src/app/api/posts/route.ts
import { connectDB } from "@/app/services/server/mongodb";

export async function GET() {
  try {
    const db = await connectDB();
    const postsCollection = db.collection("Posts");

    const posts = await postsCollection
      .find({})
      .sort({ createdAt: -1 })
      .limit(30)
      .toArray();

    return Response.json(posts, { status: 200 });
  } catch (err) {
    console.error("❌ Error in GET /api/posts:", err);
    return Response.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const db = await connectDB();
    const postsCollection = db.collection("Posts");

    const body = await req.json();
    const { userId, userName, userPhoto, content, imageUrl } = body;

    if (!userId || !content) {
      return Response.json(
        { error: "Missing userId or content" },
        { status: 400 }
      );
    }

    const newPost = {
      userId,
      userName: userName || "Unknown",
      userPhoto: userPhoto || null,
      content,
      imageUrl: imageUrl || null,
      createdAt: new Date(),
      likes: 0,
    };

    const result = await postsCollection.insertOne(newPost);

    return Response.json(
      { ...newPost, _id: result.insertedId },
      { status: 201 }
    );
  } catch (err) {
    console.error("❌ Error in POST /api/posts:", err);
    return Response.json({ error: "Failed to create post" }, { status: 500 });
  }
}
