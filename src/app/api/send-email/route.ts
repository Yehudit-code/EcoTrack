import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { to, subject, html } = await req.json();

    console.log("📧 Sending email to:", to);

    const data = await resend.emails.send({
      from: "EcoTrack <onboarding@resend.dev>",  // ← ← ← חשוב!!!
      to,
      subject,
      html,
    });

    console.log("📨 Resend response:", data);

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("❌ Email error:", err);
    return NextResponse.json(
      { error: "Failed to send email", details: String(err) },
      { status: 500 }
    );
  }
}
