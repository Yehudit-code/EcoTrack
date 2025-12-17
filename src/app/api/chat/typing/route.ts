import { pusherServer } from "@/app/lib/pusher";

export async function POST(req: Request) {
  const { userName } = await req.json();

  await pusherServer.trigger("chat-channel", "typing", {
    userName,
  });

  return Response.json({ ok: true });
}
