import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const client = new Groq({
    apiKey: process.env.GROQ_API_KEY!,
});

export async function POST(req: Request) {
    try {
        const { message, history = [] } = await req.json();

        if (!message || typeof message !== "string") {
            return NextResponse.json(
                { reply: "No message provided." },
                { status: 400 }
            );
        }

        // הכנת היסטוריית השיחה
        const formattedHistory = Array.isArray(history)
            ? history.map((msg: any) => ({
                role: msg.sender === "user" ? "user" : "assistant",
                content: msg.text,
            }))
            : [];

        // 👇 עקיפת הטייפים של Groq — ככה זה עובד בלי שגיאות
        const completion: any = await (client as any).chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages: [
                {
                    role: "system",
                    content: `
You are EcoTrack's sustainability intelligence assistant 🌿.
You ALWAYS answer with practical, concise advice about:
• saving water
• saving electricity
• reducing waste
• eco-friendly transportation
• EcoTrack features

If the user agrees ("yes give me", "yes", "ok"):
→ Give 3–5 actionable tips immediately.
If off-topic → politely redirect.
          `.trim(),
                },

                ...formattedHistory,

                {
                    role: "user",
                    content: message,
                },
            ],
            temperature: 0.6,
            max_tokens: 300,
        });

        const reply =
            completion?.choices?.[0]?.message?.content ||
            "Sorry, I had trouble responding this time.";

        return NextResponse.json({ reply }, { status: 200 });
    } catch (err: any) {
        console.error("❌ EcoTrack AI error:", err);

        return NextResponse.json(
            {
                reply:
                    "Oops! The EcoTrack AI had a problem talking to the server. Please try again later.",
            },
            { status: 500 }
        );
    }
}
