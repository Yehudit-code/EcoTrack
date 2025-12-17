import { connectDB } from "@/app/services/server/mongodb";

export async function GET() {
    try {
        const db = await connectDB();
        const postsCollection = db.collection("Posts");

        const posts = await postsCollection
            .find({})
            .sort({ createdAt: -1 })
            .limit(50)
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
            likes: [],
            comments: [],
            shares: 0,
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


export async function PATCH(req: Request) {
    try {
        const db = await connectDB();
        const postsCollection = db.collection("Posts");

        const body = await req.json();
        const { postId, action, comment, userName, userPhoto } = body;

        if (!postId || !action) {
            return Response.json({ error: "Missing postId or action" }, { status: 400 });
        }

        const { ObjectId } = require("mongodb");
        const _id = new ObjectId(postId);

        if (action === "like") {
            const { userId } = body;
            if (!userId) {
                return Response.json(
                    { error: "Missing userId for like" },
                    { status: 400 }
                );
            }

            const post = await postsCollection.findOne({ _id });
            if (!post) {
                return Response.json({ error: "Post not found" }, { status: 404 });
            }

            let likes = Array.isArray(post.likes) ? post.likes : [];

            // Toggle
            if (likes.includes(userId)) {
                likes = likes.filter((id: string) => id !== userId);
            } else {
                likes.push(userId);
            }

            await postsCollection.updateOne(
                { _id },
                { $set: { likes } }
            );
        }


        if (action === "share") {
            await postsCollection.updateOne(
                { _id },
                { $inc: { shares: 1 } }
            );
        }

        if (action === "comment") {
            if (!comment || !userName) {
                return Response.json(
                    { error: "Missing comment or userName" },
                    { status: 400 }
                );
            }

            const newComment = {
                text: comment,
                userName,
                userPhoto: userPhoto || null,
                createdAt: new Date(),
            };

            await postsCollection.updateOne(
                { _id },
                { $push: { comments: newComment } }
            );
        }

        const updated = await postsCollection.findOne({ _id });

        return Response.json(updated, { status: 200 });

    } catch (err) {
        console.error("❌ Error in PATCH /api/posts:", err);
        return Response.json({ error: "Failed to update post" }, { status: 500 });
    }
}
