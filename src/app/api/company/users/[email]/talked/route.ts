import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import { User } from "@/app/models/User";
import { requireAuth } from "@/app/lib/auth/serverAuth";

export async function PATCH(
    req: Request,
    context: { params: Promise<{ email: string }> }
) {
    try {
        const { email } = await context.params;
        const normalizedEmail = email.toLowerCase();
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

        const user = await User.findOne({
            email: normalizedEmail,
            role: "user"
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // ודא שזו MAP
        if (!(user.talkedByCompanies instanceof Map)) {
            user.talkedByCompanies = new Map();
        }

        console.log("TALKED BEFORE:", user.talkedByCompanies);

        const currentState = user.talkedByCompanies.get(companyId) || false;
        const newState = !currentState;

        user.talkedByCompanies.set(companyId, newState);

        // חובה עבור MAP
        user.markModified("talkedByCompanies");

        console.log("SETTING:", companyId, "=>", newState);

        await user.save();
        console.log("AFTER SAVE:", user.talkedByCompanies);

        return NextResponse.json({ success: true, talked: newState });
    } catch (err: any) {
        console.error("PATCH ERROR:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
