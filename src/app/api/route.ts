// src/app/api/products/route.ts
import { fetch } from "@/src/app/services/server/EcoTrackCollection";

export async function GET() {
  try {
    const products = await fetch("Products");
    return new Response(JSON.stringify(products), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("API Error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch products" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
