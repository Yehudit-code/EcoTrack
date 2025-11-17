// app/api/route.ts
import { fetchCollection } from "@/app/services/server/EcoTrackCollection";

export async function GET() {
  try {
    const users = await fetchCollection("Users");
    return new Response(JSON.stringify(users), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.warn("⚠️ Database not available, returning empty data:", error);
    // Return empty array instead of error when DB is not available
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
}
