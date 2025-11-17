// services/server/EcoTrackCollection.ts
import { connectDB } from "@/app/services/server/mongodb";

export async function fetchCollection(collectionName: string) {
  try {
    const db = await connectDB();
    const collection = db.collection(collectionName);
    const data = await collection.find().toArray();

    console.log(`✅ Fetched ${data.length} items from ${collectionName}`);
    return data;
  } catch (error) {
    console.warn(`⚠️ Database not available for ${collectionName}, returning empty data:`, error);
    // Return empty array instead of throwing error
    return [];
  }
}
