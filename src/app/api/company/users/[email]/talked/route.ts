import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import { User } from "@/app/models/User";
import { requireAuth } from "@/app/lib/auth/serverAuth";

// ✅ helper – חיפוש אימייל בלי תלות ב־case
function emailRegex(email: string) {
    const clean = decodeURIComponent(email).trim().normalize("NFKC");
    const escaped = clean.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`^${escaped}$`, "i");
}

export async function PATCH(
    req: Request,
    context: { params: Promise<{ email: string }> }
) {
    try {
        const { email } = await context.params;
        console.log("PATCH TALKED FOR:", email);

        const auth = await requireAuth("company");
        if (!auth.ok) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        // --- Company ---
        const company = await User.findOne({
            email: emailRegex(auth.user.email),
            role: "company",
        });

        if (!company) {
            return NextResponse.json({ error: "Company not found" }, { status: 404 });
        }

        const companyId = company._id.toString();

        // --- User (✅ case-insensitive) ---
        const user = await User.findOne({
            email: emailRegex(email),
            role: "user",
        });

        if (!user) {
            console.log("❌ USER NOT FOUND FOR EMAIL:", email);
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // --- talkedByCompanies ---
        if (!(user.talkedByCompanies instanceof Map)) {
            user.talkedByCompanies = new Map(Object.entries(user.talkedByCompanies || {}));
        }

        const currentState = user.talkedByCompanies.get(companyId) || false;
        const newState = !currentState;

        user.talkedByCompanies.set(companyId, newState);
        user.markModified("talkedByCompanies");

        await user.save();

        console.log("✅ TALKED UPDATED:", companyId, "=>", newState);

        return NextResponse.json({ success: true, talked: newState });
    } catch (err: any) {
        console.error("PATCH ERROR:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
