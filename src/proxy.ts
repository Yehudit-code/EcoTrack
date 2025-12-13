// src/proxy.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const PUBLIC_PATHS = ["/", "/signIn", "/signUp"];

const JWT_SECRET = process.env.JWT_SECRET;
const secretKey = JWT_SECRET ? new TextEncoder().encode(JWT_SECRET) : null;

async function validate(token: string) {
  if (!secretKey) throw new Error("Missing JWT secret");
  const { payload } = await jwtVerify(token, secretKey);
  return payload;
}

export async function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Allow public routes
  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  // Allow static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/images") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get("ecotrack-token")?.value;

  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/signIn";
    return NextResponse.redirect(url);
  }

  let user;
  try {
    user = await validate(token);
    console.log("JWT payload:", user);

  } catch {
    const url = req.nextUrl.clone();
    url.pathname = "/signIn";
    return NextResponse.redirect(url);
  }

  // Company area
  if (pathname.startsWith("/company")) {
    if (user.role === "company") {
      return NextResponse.next();
    }
    const url = req.nextUrl.clone();
    url.pathname = "/home";
    return NextResponse.redirect(url);
  }

  // User area
  if (pathname.startsWith("/user")) {
    if (user.role === "user") {
      return NextResponse.next();
    }
    const url = req.nextUrl.clone();
    url.pathname = "/home";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// FIX: matcher that catches ALL dynamic routes
export const config = {
  matcher: [
    "/company/:path*",
    "/user/:path*",
    "/((?!_next/static|_next/image|favicon.ico|api).*)",
  ],
};