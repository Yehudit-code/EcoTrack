import { SignJWT, jwtVerify, JWTPayload } from "jose";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

const secretKey = new TextEncoder().encode(JWT_SECRET);

// JWT payload structure for the project
export interface TokenPayload extends JWTPayload {
  userId: string;
  email: string;
  role: "user" | "company";
}

// Create a signed JWT token (valid for 7 days)
export async function signJwt(payload: TokenPayload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey);
}

// Verify and decode JWT token
export async function verifyJwt(token: string) {
  const { payload } = await jwtVerify(token, secretKey);
  return payload as TokenPayload;
}
