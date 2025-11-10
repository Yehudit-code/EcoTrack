// src/app/api/chat-history/route.ts
import { connectDB } from "@/app/lib/db";
import { ChatHistory } from "@/app/models/ChatHistory";
import { fail, ok } from "@/app/lib/api-helpers";

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    if (!userId) return fail("Missing userId", 400);
    const items = await ChatHistory.find({ userId }).sort({ _id: -1 }).limit(100).lean();
    return ok(items);
  } catch {
    return fail("Failed to fetch chat history", 500);
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const item = await ChatHistory.create(body);
    return ok(item, 201);
  } catch (e) {
    return fail("Failed to add chat message", 500, (e as Error).message);
  }
}

export async function DELETE(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    if (!userId) return fail("Missing userId", 400);
    await ChatHistory.deleteMany({ userId });
    return ok({ cleared: true });
  } catch {
    return fail("Failed to clear chat history", 500);
  }
}
