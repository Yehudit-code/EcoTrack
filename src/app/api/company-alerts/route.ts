// src/app/api/company-alerts/route.ts
import { connectDB } from "@/app/lib/db";
import { CompanyAlert } from "@/app/models/CompanyAlerts";
import { fail, ok } from "@/app/lib/api-helpers";

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId");
    const userId = searchParams.get("userId");
    const active = searchParams.get("active");
    const q: any = {};
    if (companyId) q.companyId = companyId;
    if (userId) q.userId = userId;
    if (active !== null) q.isActive = active === "true";
    const items = await CompanyAlert.find(q).lean();
    return ok(items);
  } catch {
    return fail("Failed to fetch alerts", 500);
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const item = await CompanyAlert.create(body);
    return ok(item, 201);
  } catch (e) {
    return fail("Failed to create alert", 500, (e as Error).message);
  }
}

export async function PUT(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { _id, ...rest } = body || {};
    if (!_id) return fail("Missing _id", 400);
    const updated = await CompanyAlert.findByIdAndUpdate(_id, rest, { new: true });
    return ok(updated);
  } catch {
    return fail("Failed to update alert", 500);
  }
}

export async function DELETE(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return fail("Missing id", 400);
    await CompanyAlert.findByIdAndDelete(id);
    return ok({ deleted: true });
  } catch {
    return fail("Failed to delete alert", 500);
  }
}
