import { connectDB } from "@/app/lib/db";
import { ConsumptionHabit } from "@/app/models/ConsumptionHabit";
import { fail, ok } from "@/app/lib/api-helpers";
import { consumptionUpsertSchema } from "@/app/types/api";

// CRUD API for monthly consumption data
export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const category = searchParams.get("category") ?? undefined;
    const q: any = userId ? { userId } : {};
    if (category) q.category = category;
    const items = await ConsumptionHabit.find(q).lean();
    return ok(items);
  } catch (err) {
    return fail("Failed to fetch consumption", 500);
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const parsed = consumptionUpsertSchema.safeParse(body);
    if (!parsed.success) return fail("Invalid payload", 400);

    const { userId, category, month, year, value } = parsed.data;
    const existing = await ConsumptionHabit.findOne({ userId, category, month, year });

    // Update if record exists, else create new
    if (existing) {
      existing.value = value;
      await existing.save();
      return ok(existing, 200);
    }

    const item = await ConsumptionHabit.create(parsed.data);
    return ok(item, 201);
  } catch (e: any) {
    if (e.code === 11000) return fail("Duplicate month. Try PUT instead.", 409);
    return fail("Failed to create consumption", 500);
  }
}

export async function PUT(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { _id, ...rest } = body || {};
    if (!_id) return fail("Missing _id", 400);
    const updated = await ConsumptionHabit.findByIdAndUpdate(_id, rest, { new: true });
    return ok(updated);
  } catch {
    return fail("Failed to update consumption", 500);
  }
}

export async function DELETE(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return fail("Missing id", 400);
    await ConsumptionHabit.findByIdAndDelete(id);
    return ok({ deleted: true });
  } catch {
    return fail("Failed to delete consumption", 500);
  }
}