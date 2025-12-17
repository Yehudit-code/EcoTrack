import { connectDB } from "@/app/lib/db";
import { Tip } from "@/app/models/Tip";
import { fail, ok } from "@/app/lib/api-helpers";

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") ?? undefined;
    const q: any = {};
    if (category) q.category = category;
    const items = await Tip.find(q).lean();
    return ok(items);
  } catch {
    return fail("Failed to fetch tips", 500);
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const item = await Tip.create(body);
    return ok(item, 201);
  } catch (e) {
    return fail("Failed to create tip", 500, (e as Error).message);
  }
}

export async function PUT(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { _id, ...rest } = body || {};
    if (!_id) return fail("Missing _id", 400);
    const updated = await Tip.findByIdAndUpdate(_id, rest, { new: true });
    return ok(updated);
  } catch {
    return fail("Failed to update tip", 500);
  }
}

export async function DELETE(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return fail("Missing id", 400);
    await Tip.findByIdAndDelete(id);
    return ok({ deleted: true });
  } catch {
    return fail("Failed to delete tip", 500);
  }
}
