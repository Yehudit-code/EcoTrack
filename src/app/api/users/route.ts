// src/app/api/users/route.ts
import { connectDB } from "@/app/lib/db";
import { User } from "@/app/models/User";
import { fail, ok } from "@/app/lib/api-helpers";

export async function GET() {
  try {
    await connectDB();
    const items = await User.find().select("-password").lean();
    return ok(items);
  } catch {
    return fail("Failed to fetch users", 500);
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    // For admin-only bulk create; prefer /auth/signup for normal flow:
    const item = await User.create(body);
    return ok(item, 201);
  } catch {
    return fail("Failed to create user", 500);
  }
}

export async function PUT(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { _id, ...rest } = body || {};
    if (!_id) return fail("Missing _id", 400);
    const updated = await User.findByIdAndUpdate(_id, rest, { new: true }).select("-password");
    return ok(updated);
  } catch {
    return fail("Failed to update user", 500);
  }
}

export async function DELETE(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return fail("Missing id", 400);
    await User.findByIdAndDelete(id);
    return ok({ deleted: true });
  } catch {
    return fail("Failed to delete user", 500);
  }
}
