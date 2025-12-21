import { connectDB } from "@/app/lib/db";
import { ConsumptionHabit } from "@/app/models/ConsumptionHabit";
import { ok, fail } from "@/app/lib/api-helpers";

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);

    const userEmail = searchParams.get("userEmail");
    const categoryParam = searchParams.get("category");
    const category = categoryParam
      ? categoryParam.toLowerCase()
      : undefined;
    console.log("CATEGORY RECEIVED:", category);
    const monthParam = searchParams.get("month");
    const yearParam = searchParams.get("year");

    if (!userEmail) {
      return fail("Missing user email", 400);
    }

    const query: any = { userEmail };
    console.log("QUERY:", query);

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

    const {
      userEmail,
      category: rawCategory,
      month,
      year,
      value,
    } = body;

    const category = rawCategory?.toLowerCase();

    if (!userEmail || !category || !month || !year || value == null) {
      return fail("Missing required fields", 400);
    }

    const lastRecord = await ConsumptionHabit.findOne({
      userEmail,
      category,
    })
      .sort({ year: -1, month: -1 })
      .lean() as any;

    const previousValue = lastRecord?.value ?? null;

    const existing = await ConsumptionHabit.findOne({
      userEmail,
      category,
      month,
      year,
    });

    if (existing) {
      const updated = await ConsumptionHabit.findByIdAndUpdate(
        existing._id,
        {
          ...body,
          category,
          previousValue,
        },
        { new: true }
      );
      return ok(updated);
    }

    const created = await ConsumptionHabit.create({
      ...body,
      category,
      previousValue,
    });

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