"use server";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/app/services/server/mongodb";
import { ObjectId } from "mongodb";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const db = await connectDB();
    const users = db.collection("Users");
    let user;
    if (ObjectId.isValid(id)) {
      user = await users.findOne(
        { _id: new ObjectId(id) },
        { projection: { password: 0 } }
      );
    } else {
      user = await users.findOne(
        { email: id },
        { projection: { password: 0 } }
      );
    }
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ user }, { status: 200 });
  } catch (err) {
    console.error("❌ USER API ERROR:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const db = await connectDB();
    const users = db.collection("Users");
    const { talked } = await req.json();
    let filter;
    if (ObjectId.isValid(id)) {
      filter = { _id: new ObjectId(id) };
    } else {
      filter = { email: id };
    }
    const updateResult = await users.updateOne(filter, { $set: { talked } });
    if (updateResult.matchedCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ USER PATCH API ERROR:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
