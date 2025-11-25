import { connectDB } from "@/app/lib/db";
import { ConsumptionHabit } from "@/app/models/ConsumptionHabit";
import { ok, fail } from "@/app/lib/api-helpers";

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);

    const userEmail = searchParams.get("userEmail");
    const category = searchParams.get("category");

    if (!userEmail) {
      return fail("Missing user email", 400);
    }

    const query: any = { userEmail };

    if (category) {
      query.category = category;
    }

    const items = await ConsumptionHabit.find(query).lean();
    return ok(items);
  } catch (err) {
    console.error("GET error:", err);
    return fail("Failed to fetch consumption", 500);
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();

    const item = await ConsumptionHabit.create(body);
    return ok(item);
  } catch (err) {
    console.error("POST error:", err);
    return fail("Failed to create consumption", 500, err);
  }
}

export async function PUT(req: Request) {
  try {
    await connectDB();
    const body = await req.json();

    if (!body._id) {
      return fail("Missing _id", 400);
    }

    const updated = await ConsumptionHabit.findByIdAndUpdate(
      body._id,
      body,
      { new: true }
    );

    return ok(updated);
  } catch (err) {
    console.error("PUT error:", err);
    return fail("Failed to update consumption", 500);
  }
}
