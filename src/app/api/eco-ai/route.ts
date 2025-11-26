import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const client = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
    try {
        const { message } = await req.json();

        if (!message || typeof message !== "string") {
            return NextResponse.json(
                { reply: "No message provided." },
                { status: 400 }
            );
        }

        const completion = await client.chat.completions.create({
            model: "llama-3.1-8b-instant", // המודל הזול והמהיר :contentReference[oaicite:2]{index=2}
            messages: [
                {
                    role: "system",
                    content: `
You are EcoTrack's sustainability intelligence assistant 🌿.
You ONLY answer questions related to:
- saving water
- saving electricity
- reducing waste
- eco-friendly transportation
- personal consumption improvement
- sustainability motivation
- environmental impact
- the EcoTrack platform features

If the user asks anything not related, respond briefly and politely redirect:
"I'm here to help you with EcoTrack and sustainable living 🌿. How can I help you reduce water, energy, waste, or transport impact?"

When users share success (like saving %, reducing CO₂, lowering water usage), celebrate warmly:
"Wow!! Amazing job 🌟 You're making a real environmental impact!"

Be warm, friendly, short, and motivational.
  `.trim(),
                }
                ,
                {
                    role: "user",
                    content: message,
                },
            ],
            temperature: 0.6,
            max_tokens: 300,
        });

        const reply =
            completion.choices[0]?.message?.content ||
            "Sorry, I had trouble responding this time.";

        return NextResponse.json({ reply }, { status: 200 });
    } catch (err: any) {
        console.error("❌ Groq API error:", err);

        // חשוב: תמיד להחזיר JSON כדי שה-frontend לא יקרוס
        return NextResponse.json(
            {
                reply:
                    "Oops! The EcoTrack AI had a problem talking to the server right now. Please try again later.",
            },
            { status: 500 }
        );
    }
}
