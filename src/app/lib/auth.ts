// // src/lib/auth.ts
// import jwt, { Secret, SignOptions, JwtPayload } from "jsonwebtoken";
// import bcrypt from "bcryptjs";

// const JWT_SECRET: Secret = (process.env.JWT_SECRET ?? "") as Secret; // Ensure Secret
// const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

// export function signToken(payload: object, options?: SignOptions) {
//   if (!JWT_SECRET) {
//     throw new Error("Missing JWT_SECRET environment variable");
//   }
//   // Minimal, explicit options merge
//   const signOpts: SignOptions = { expiresIn: JWT_EXPIRES_IN, ...(options ?? {}) };
//   return jwt.sign(payload, JWT_SECRET, signOpts); // OK: second arg is Secret
// }

// export function verifyToken<T extends string | JwtPayload = JwtPayload>(token: string): T | null {
//   try {
//     return jwt.verify(token, JWT_SECRET) as T; // Safe: same Secret type
//   } catch {
//     return null;
//   }
// }

// export async function hashPassword(plain: string) {
//   const salt = await bcrypt.genSalt(10);
//   return bcrypt.hash(plain, salt);
// }

// export async function comparePassword(plain: string, hash: string) {
//   return bcrypt.compare(plain, hash);
// }
