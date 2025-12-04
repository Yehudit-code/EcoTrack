import { connectDB } from "@/app/lib/db";
import { ConsumptionHabit } from "@/app/models/ConsumptionHabit";
import { ok, fail } from "@/app/lib/api-helpers";

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);

    const userEmail = searchParams.get("userEmail");
    const category = searchParams.get("category") ?? undefined;
    const monthParam = searchParams.get("month");
    const yearParam = searchParams.get("year");

    if (!userEmail) {
      return fail("Missing user email", 400);
    }

    const query: any = { userEmail };

    if (category) query.category = category;
    if (monthParam) query.month = Number(monthParam);
    if (yearParam) query.year = Number(yearParam);

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

    const { userEmail, category, month, year } = body;

    if (!userEmail || !category || !month || !year) {
      return fail("Missing required fields", 400);
    }

    // Check if record exists for this user+category+month+year
    const existing = await ConsumptionHabit.findOne({
      userEmail,
      category,
      month,
      year,
    });

    if (existing) {
      // Update instead of creating a duplicate
      const updated = await ConsumptionHabit.findByIdAndUpdate(
        existing._id,
        body,
        { new: true }
      );
      return ok(updated);
    }

    const created = await ConsumptionHabit.create(body);
    return ok(created);
  } catch (err) {
    console.error("POST error:", err);
    return fail("Failed to create/update consumption", 500, err);
  }
}

export async function PUT(req: Request) {
  try {
    await connectDB();
    const body = await req.json();

    if (!body._id) {
      return fail("Missing _id", 400);
    }

    const updated = await ConsumptionHabit.findByIdAndUpdate(body._id, body, {
      new: true,
    });

    return ok(updated);
  } catch (err) {
    console.error("PUT error:", err);
    return fail("Failed to update consumption", 500);
  }
}