import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    const { name, email, message } = await req.json();
    if (!name || !email || !message) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // הגדרות שרת מייל (SMTP)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "ecotrack33@gmail.com",
        pass: process.env.ECOTRACK_GMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: email,
      to: "ecotrack33@gmail.com",
      subject: `EcoTrack Contact from ${name}`,
      text: message,
      html: `<p><b>Name:</b> ${name}<br/><b>Email:</b> ${email}<br/><b>Message:</b><br/>${message}</p>`
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
