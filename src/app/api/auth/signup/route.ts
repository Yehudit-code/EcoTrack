import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "EcoTrack API is running" });
}
