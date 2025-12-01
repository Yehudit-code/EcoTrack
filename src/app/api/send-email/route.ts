import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { to, subject, html } = await req.json();

    if (!to || !subject || !html) {
      return NextResponse.json(
        { error: "Missing fields (to, subject, html required)" },
        { status: 400 }
      );
    }

    const result = await resend.emails.send({
      from: "EcoTrack <onboarding@resend.dev>",
      to,
      subject,
      html,
    });

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Email error:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
