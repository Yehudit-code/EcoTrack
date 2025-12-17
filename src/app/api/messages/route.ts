import { connectDB } from "@/app/services/server/mongodb";
import { pusherServer } from "@/app/lib/pusher";


export async function GET() {
  try {
    const db = await connectDB();
    const messagesCollection = db.collection("Messages");

    const messages = await messagesCollection
      .find({})
      .sort({ createdAt: 1 }) 
      .limit(100)
      .toArray();

    return Response.json(messages, { status: 200 });
  } catch (err) {
    console.error("❌ Error in GET /api/messages:", err);
    return Response.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const db = await connectDB();
    const messagesCollection = db.collection("Messages");

    const body = await req.json();
    const { userId, userName, userPhoto, message } = body;

    if (!userId || !message) {
      return Response.json(
        { error: "Missing userId or message" },
        { status: 400 }
      );
    }

    const newMessage = {
      userId,
      userName: userName || "Unknown",
      userPhoto: userPhoto || null,
      message,
      createdAt: new Date(),
    };

    const result = await messagesCollection.insertOne(newMessage);

    const createdMessage = { ...newMessage, _id: result.insertedId };

    await pusherServer.trigger("chat-channel", "new-message", createdMessage);

    return Response.json(createdMessage, { status: 201 });

  } catch (err) {
    console.error("❌ Error in POST /api/messages:", err);
    return Response.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
