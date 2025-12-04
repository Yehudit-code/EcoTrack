// src/app/api/payments/[id]/route.ts
import { connectDB } from "@/app/services/server/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function GET(req: Request, context: RouteParams) {
    try {
        const { id } = await context.params;

        if (!id || !ObjectId.isValid(id)) {
            console.error("❌ Invalid payment id:", id);
            return NextResponse.json({ error: "Invalid id" }, { status: 400 });
        }

        const db = await connectDB();
        const paymentsCol = db.collection("Payments");
        const requestsCol = db.collection("CompanyRequests");
        const usersCol = db.collection("Users");

        // 1️⃣ קבלת התשלום
        const payment = await paymentsCol.findOne({ _id: new ObjectId(id) });

        if (!payment) {
            console.error("❌ Payment not found for:", id);
            return NextResponse.json({ error: "Payment not found" }, { status: 404 });
        }

        // ======== 2️⃣ שליפת פרטי הבקשה (מוצר, מחיר) ========
        let productName = "";
        let price = payment.amount || 0;
        let userId = payment.userId;
        let requestId = payment.requestId;

        if (requestId && ObjectId.isValid(requestId)) {
            const requestDoc = await requestsCol.findOne({
                _id: new ObjectId(requestId),
            });

            if (requestDoc) {
                productName = requestDoc.productName || "";
                price = requestDoc.price || payment.amount || 0;
                userId = requestDoc.userId || userId;
            }
        }

        // ======== 3️⃣ שליפת פרטי החברה (הספק) ========
        let companyName = "";
        if (payment.companyId && ObjectId.isValid(payment.companyId)) {
            const company = await usersCol.findOne({
                _id: new ObjectId(payment.companyId),
            });

            if (company) {
                companyName = company.name || "";
            }
        }

        // ======== 4️⃣ שליפת פרטי המשתמש (הלקוח) ========
        let userName = "";
        let userEmail = "";
        let fullUser = null;

        if (userId && ObjectId.isValid(userId)) {
            const user = await usersCol.findOne({
                _id: new ObjectId(userId),
            });

            if (user) {
                userName = user.name || "";
                userEmail = user.email || "";
                // ⭐ שמור את כל המשתמש
                fullUser = {
                    _id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    phone: user.phone || "",
                    role: user.role,
                    companies: user.companies || {},
                    photo: user.photo || "",
                    createdAt: user.createdAt || null,
                };
            }
        }

        const response = {
            _id: payment._id.toString(),
            amount: payment.amount ?? payment.price ?? 0,
            status: payment.status,
            productName,
            companyName,
            userId: payment.userId?.toString() || "",
            userName,
            userEmail,
            fullUser,
        };



        console.log("💚 Payment API response →", response);

        return NextResponse.json(response, { status: 200 });
    } catch (err) {
        console.error("❌ Error loading payment:", err);
        return NextResponse.json(
            { error: "Failed to load payment" },
            { status: 500 }
        );
    }
}
