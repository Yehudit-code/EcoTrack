import mongoose from "mongoose";

let cached = (global as any)._mongoose;
if (!cached) {
  cached = (global as any)._mongoose = { conn: null as typeof mongoose | null, promise: null as Promise<typeof mongoose> | null };
}

export async function connectDB() {
  if (cached.conn) return cached.conn; // Reuse existing connection in dev

  if (!cached.promise) {
    const uri = process.env.MONGODB_URI; // Read env at call-time, not module load
    if (!uri) {
      throw new Error("Missing MONGODB_URI"); // Fail only when actually connecting
    }
    cached.promise = mongoose.connect(uri).then((m) => m);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
