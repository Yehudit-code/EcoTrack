import { connectDB } from "@/app/services/server/mongodb";
import { ObjectId } from "mongodb";

export async function GET() {
  try {
    const db = await connectDB();
    const usersCollection = db.collection("Users");
    const habitsCollection = db.collection("ConsumptionHabits");

    const users = await usersCollection.find({}).toArray();
    const results: any[] = [];

    // ⬅️ תאריך תחילת החודש
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    for (const user of users) {
      const habits = await habitsCollection
        .find({
          userId: new ObjectId(user._id),
          createdAt: { $gte: monthStart }, // ⬅️ רק מהחודש הנוכחי
        })
        .toArray();

      if (!habits.length) continue;

      const percents = habits
        .filter((h: any) => h.previousValue && h.previousValue > 0)
        .map(
          (h: any) =>
            ((h.previousValue - h.value) / h.previousValue) * 100
        );

      const avgSaving =
        percents.length > 0
          ? percents.reduce((a: number, b: number) => a + b, 0) / percents.length
          : 0;

      results.push({
        name: user.name || "Unknown",
        email: user.email,
        photo: user.photo || null,
        avgSaving: Number(avgSaving.toFixed(1)),
      });
    }

    // מיון מהגדול לקטן
    results.sort((a, b) => b.avgSaving - a.avgSaving);

    // מחזיר רק את 4 המובילים
    return Response.json(results.slice(0, 4));
  } catch (err) {
    console.error("❌ Error in /api/savers:", err);
    return Response.json({ error: "failed" }, { status: 500 });
  }
}
