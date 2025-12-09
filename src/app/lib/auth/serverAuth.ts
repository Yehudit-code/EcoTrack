import { cookies } from "next/headers";
import { verifyJwt, TokenPayload } from "./jwt";

// Extract user from HttpOnly cookie
export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("ecotrack-token")?.value;

  if (!token) return null;

  try {
    const payload = await verifyJwt(token);
    return payload;
  } catch {
    return null;
  }
}

// Ensure route/API is authenticated
export async function requireAuth(role?: "user" | "company") {
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false as const, reason: "unauthenticated" };
  }

  if (role && user.role !== role) {
    return { ok: false as const, reason: "forbidden", user };
  }

  return { ok: true as const, user };
}
