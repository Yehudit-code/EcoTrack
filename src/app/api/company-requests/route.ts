import { connectDB } from "@/app/services/server/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export async function GET(req: Request) {
  try {
    const db = await connectDB();
    const collection = db.collection("CompanyRequests");

    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId");
    const userId = searchParams.get("userId");

    const match: any = {};
    if (companyId) match.companyId = new ObjectId(companyId);
    if (userId) match.userId = new ObjectId(userId);

    const pipeline: any[] = [
      { $match: match },

      // 🔵 הבאת פרטי המשתמש (לקוח)
      {
        $lookup: {
          from: "Users",
          localField: "userId",
          foreignField: "_id",
          as: "userData",
        },
      },
      { $unwind: { path: "$userData", preserveNullAndEmptyArrays: true } },

      // 🟢 הבאת פרטי החברה (החברה שהציעה את ההצעה)
      {
        $lookup: {
          from: "Users",
          localField: "companyId",
          foreignField: "_id",
          as: "companyData",
        },
      },
      { $unwind: { path: "$companyData", preserveNullAndEmptyArrays: true } },

      { $sort: { createdAt: -1 } },

      {
        $project: {
          productName: 1,
          price: 1,
          status: 1,
          paymentId: 1,
          createdAt: 1,
          userId: 1,
          companyId: 1,

          // פרטי המשתמש
          "userData.name": 1,
          "userData.email": 1,
          "userData.phone": 1,

          // פרטי החברה
          companyName: "$companyData.name",
          companyEmail: "$companyData.email",
          companyCategory: "$companyData.companyCategory",
        },
      }

    ];

    const items = await collection.aggregate(pipeline).toArray();

    return NextResponse.json(items, { status: 200 });
  } catch (e) {
    console.error("❌ GET /api/company-requests error:", e);
    return NextResponse.json(
      { error: "Failed to fetch company requests" },
      { status: 500 }
    );
  }
}


export async function POST(req: Request) {
  try {
    const { userId, companyId, productName, description, price } =
      await req.json();

    const db = await connectDB();

    const companyRequests = db.collection("CompanyRequests");
    const payments = db.collection("Payments");

    const userObjectId = new ObjectId(userId);
    const companyObjectId = new ObjectId(companyId);

    // 1️⃣ Create company request
    const requestRes = await companyRequests.insertOne({
      userId: userObjectId,
      companyId: companyObjectId,
      productName,
      description: description || "",
      price,
      status: "sent",
      createdAt: new Date(),
    });

    const ecoTrackFee = price * 0.1;
    const companyRevenue = price - ecoTrackFee;

    // 2️⃣ Create payment
    const paymentRes = await payments.insertOne({
      userId: userObjectId,
      companyId: companyObjectId,
      requestId: requestRes.insertedId,
      amount: price,
      ecoTrackFee,
      companyRevenue,
      status: "pending",
      createdAt: new Date(),
    });

    // 3️⃣ Save paymentId on request
    await companyRequests.updateOne(
      { _id: requestRes.insertedId },
      { $set: { paymentId: paymentRes.insertedId } }
    );

    return Response.json(
      {
        success: true,
        paymentId: paymentRes.insertedId.toString(),
        requestId: requestRes.insertedId.toString(),
      },
      { status: 201 }
    );
  } catch (e) {
    console.error("❌ POST /api/company-requests error:", e);
    return NextResponse.json(
      { error: "Failed to create company request" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const db = await connectDB();
    const collection = db.collection("CompanyRequests");

    const body = await req.json();
    const { _id, ...rest } = body;

    if (!_id) {
      return NextResponse.json({ error: "Missing _id" }, { status: 400 });
    }

    await collection.updateOne(
      { _id: new ObjectId(_id) },
      { $set: rest }
    );

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (e) {
    console.error("❌ PUT /api/company-requests error:", e);
    return NextResponse.json(
      { error: "Failed to update request" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const db = await connectDB();
    const collection = db.collection("CompanyRequests");

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    await collection.deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (e) {
    console.error("❌ DELETE /api/company-requests error:", e);
    return NextResponse.json(
      { error: "Failed to delete request" },
      { status: 500 }
    );
  }
}
