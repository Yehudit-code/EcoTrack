import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json(
    { success: true },
    { status: 200 }
  );

  // Delete JWT cookie
  response.cookies.set("ecotrack-token", "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });

  return response;
}
