// src/proxy.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const PUBLIC_PATHS = ["/", "/signIn", "/signUp"];

// Read env
const JWT_SECRET = process.env.JWT_SECRET;

// Create key or null
const secretKey = JWT_SECRET ? new TextEncoder().encode(JWT_SECRET) : null;

// Safe validate function
async function validate(token: string) {
  if (!secretKey) {
    throw new Error("Missing JWT secret");
  }

  const { payload } = await jwtVerify(token, secretKey);
  return payload;
}

// ======================================================================
// MAIN PROXY FUNCTION — REQUIRED BY NEXT 16
// ======================================================================
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Public pages allowed without login
  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  // Static files allowed
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // Token read
  const token = req.cookies.get("ecotrack-token")?.value;

  // No token → redirect to signIn
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/signIn";
    return NextResponse.redirect(url);
  }

  // Validate JWT
  let user;
  try {
    user = await validate(token);
  } catch {
    const url = req.nextUrl.clone();
    url.pathname = "/signIn";
    return NextResponse.redirect(url);
  }

  // Restrict company pages
  if (pathname.startsWith("/company")) {
    if (user.role !== "company") {
      const url = req.nextUrl.clone();
      url.pathname = "/home";
      return NextResponse.redirect(url);
    }
  }

  // Restrict user pages
  if (pathname.startsWith("/user")) {
    if (user.role !== "user") {
      const url = req.nextUrl.clone();
      url.pathname = "/home";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

// ======================================================================
// MATCHER — required so proxy runs on all pages
// ======================================================================
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};
