// src/app/api/payments/route.ts
import { connectDB } from "@/app/lib/db";
import { Payment } from "@/app/models/Payment";
import { fail, ok } from "@/app/lib/api-helpers";

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const companyId = searchParams.get("companyId");
    const q: any = {};
    if (userId) q.userId = userId;
    if (companyId) q.companyId = companyId;
    const items = await Payment.find(q).lean();
    return ok(items);
  } catch {
    return fail("Failed to fetch payments", 500);
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const item = await Payment.create(body);
    return ok(item, 201);
  } catch (e) {
    return fail("Failed to create payment", 500, (e as Error).message);
  }
}

export async function PUT(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { _id, ...rest } = body || {};
    if (!_id) return fail("Missing _id", 400);
    const updated = await Payment.findByIdAndUpdate(_id, rest, { new: true });
    return ok(updated);
  } catch {
    return fail("Failed to update payment", 500);
  }
}

export async function DELETE(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return fail("Missing id", 400);
    await Payment.findByIdAndDelete(id);
    return ok({ deleted: true });
  } catch {
    return fail("Failed to delete payment", 500);
  }
}
