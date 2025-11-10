import { client } from "@/src/app/services/server/mongodb";

export async function fetch(collectionName : string) {
  try {
    console.log("🚀 Connecting to MongoDB...");
    await client.connect();

    const db = client.db("Eco-Track");
    const products = await db.collection(collectionName).find().toArray();

    console.log("✅ Users fetched successfully:", products.length);
    return products;
  } catch (error) {
    console.error("❌ MongoDB connection or query error:", error);
    throw new Error("Failed to fetch products");
  }
}

