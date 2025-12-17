import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import { User } from "@/app/models/User";
import { requireAuth } from "@/app/lib/auth/serverAuth";

export async function PATCH(req: Request, context: { params: { email: string } }) {
  try {
    const { email } = context.params; 

    console.log("PATCH TALKED FOR:", email);

    const auth = await requireAuth("company");
    if (!auth.ok) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const company = await User.findOne({ email: auth.user.email });
    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    const companyId = company._id.toString();
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const currentState = user.talkedByCompanies?.[companyId] || false;
    const newState = !currentState;

    user.talkedByCompanies = {
      ...user.talkedByCompanies,
      [companyId]: newState,
    };

    await user.save();

    console.log("UPDATED talkedByCompanies:", user.talkedByCompanies);

    return NextResponse.json({ success: true, talked: newState });
  } catch (err: any) {
    console.error("PATCH ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // 🔥 חובה ב־Next 15/16
    const { id } = await context.params;

    const auth = await requireAuth();
    if (!auth.ok) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById(id).lean();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (err) {
    console.error("GET /api/users/[id] error:", err);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}