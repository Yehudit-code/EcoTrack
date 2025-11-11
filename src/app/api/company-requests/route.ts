// src/app/api/company-requests/route.ts
import { connectDB } from "@/app/lib/db";
import { CompanyRequest } from "@/app/models/CompanyRequest";
import { fail, ok } from "@/app/lib/api-helpers";

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId");
    const userId = searchParams.get("userId");
    const q: any = {};
    if (companyId) q.companyId = companyId;
    if (userId) q.userId = userId;
    const items = await CompanyRequest.find(q).lean();
    return ok(items);
  } catch {
    return fail("Failed to fetch company requests", 500);
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const item = await CompanyRequest.create(body);
    return ok(item, 201);
  } catch (e) {
    return fail("Failed to create company request", 500, (e as Error).message);
  }
}

export async function PUT(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { _id, ...rest } = body || {};
    if (!_id) return fail("Missing _id", 400);
    const updated = await CompanyRequest.findByIdAndUpdate(_id, rest, { new: true });
    return ok(updated);
  } catch {
    return fail("Failed to update company request", 500);
  }
}

export async function DELETE(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return fail("Missing id", 400);
    await CompanyRequest.findByIdAndDelete(id);
    return ok({ deleted: true });
  } catch {
    return fail("Failed to delete company request", 500);
  }
}
