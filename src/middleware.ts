// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const PUBLIC_PATHS = ["/", "/signIn", "/signUp"];

const JWT_SECRET = process.env.JWT_SECRET;
const secretKey = JWT_SECRET ? new TextEncoder().encode(JWT_SECRET) : null;

async function validate(token: string) {
  const { payload } = await jwtVerify(token, secretKey!);
  return payload;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow static assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // Public pages
  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  const token = req.cookies.get("ecotrack-token")?.value;

  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/signIn";
    return NextResponse.redirect(url);
  }

  try {
    const user = await validate(token);

    // Company-only routes
    if (
      pathname.startsWith("/display-user") ||
      pathname.startsWith("/company")
    ) {
      if (user.role !== "company") {
        const url = req.nextUrl.clone();
        url.pathname = "/home";
        return NextResponse.redirect(url);
      }
    }

    return NextResponse.next();
  } catch {
    const url = req.nextUrl.clone();
    url.pathname = "/signIn";
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api).*)"
  ]
};

