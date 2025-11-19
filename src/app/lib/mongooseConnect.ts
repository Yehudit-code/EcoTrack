import mongoose from "mongoose";

export async function dbConnect() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("Missing MONGODB_URI");

  // אם כבר מחוברים – אל תתחברי שוב
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection.asPromise();
  }

  return mongoose.connect(uri, {
    dbName: "Eco-Track",
  });
}
