
import { NextResponse } from "next/server";
import { User } from "@/app/models/User";
import { connectDB } from "@/app/lib/db";
import { ObjectId } from "mongodb";
import { ConsumptionHabit } from "@/app/models/ConsumptionHabit";


// GET /api/company/users
export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const all = searchParams.get("all");
    let users;
    if (all === "true") {
      // החזר את כל המסמכים בטבלת Consumptionhabits
      users = await ConsumptionHabit.find({}).lean();
      console.log('🔎 ConsumptionHabits count:', users.length);
    } else {
      const category = searchParams.get("category") || "electricity";
      // שלוף את כל הרשומות בקטגוריה המבוקשת
      const matching = await ConsumptionHabit.find({ category: { $regex: new RegExp(`^${category}$`, 'i') } }).lean();

      // קבץ לפי userEmail
      const userMap = new Map();
      for (const doc of matching) {
        if (!userMap.has(doc.userEmail)) {
          userMap.set(doc.userEmail, []);
        }
        userMap.get(doc.userEmail).push(doc);
      }

      // עבור כל משתמש, שלוף גם פרטי משתמש מה-User
      users = await Promise.all(Array.from(userMap.entries()).map(async ([email, records]) => {
        // מצא את value המקסימלי מכל הרשומות של המשתמש בקטגוריה
        const maxValueRecord = records.reduce((max: any, curr: any) => (curr.value > (max?.value ?? -Infinity) ? curr : max), null);
        // מיין לפי שנה וחודש יורד, קח 3 אחרונים לגרף
        const sorted = records.sort((a: any, b: any) => (b.year - a.year) || (b.month - a.month)).slice(0, 3).reverse();
        // שלוף פרטי משתמש
        const userDocArr = await User.find({ email }).lean();
        const userDoc = Array.isArray(userDocArr) ? userDocArr[0] : userDocArr;
        return {
          name: userDoc?.name || email || "לא ידוע",
          email,
          phone: userDoc?.phone || "",
          photo: userDoc?.photo || "",
          improvementScore: userDoc?.improvementScore || 0,
          valuesByMonth: sorted.map((r: any) => ({ month: r.month, year: r.year, value: r.value })),
          maxValue: maxValueRecord ? maxValueRecord.value : 0,
          talked: userDoc?.talked || false,
        };
      }));
      // מיין את כל המשתמשים לפי value המקסימלי בסדר יורד, קח 3 ראשונים
      users = users.sort((a, b) => (b.maxValue || 0) - (a.maxValue || 0)).slice(0, 3);
    }
    return NextResponse.json({ users });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

// PATCH /api/company/users/:email/talked
export async function PATCH(req: Request, { params }: { params: { email: string } }) {
  try {
    await connectDB();
    const userEmail = decodeURIComponent(params.email);

    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // אם השדה לא קיים, יוצרים אותו. אחרת הופכים את הערך
    const currentTalked = user.get("talked") || false;
    user.set("talked", !currentTalked);
    await user.save();

    return NextResponse.json({ success: true, talked: user.get("talked") });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update talk status" }, { status: 500 });
  }
}
