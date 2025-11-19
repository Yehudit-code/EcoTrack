// /app/api/savers/route.ts
import { connectDB } from "@/app/services/server/mongodb";

export async function GET() {
  try {
    const db = await connectDB();
    const usersCollection = db.collection("Users");
    const habitsCollection = db.collection("ConsumptionHabit");

    // שולף את כל המשתמשים
    const users = await usersCollection.find({}).toArray();

    const results: {
      name: string;
      email: string;
      avgSaving: number;
      photo: string | null;
    }[] = [];

    for (const user of users) {
      const habits = await habitsCollection
        .find({ userId: String(user._id) })
        .toArray();

      if (!habits || habits.length === 0) continue;

      // מחשב אחוז חיסכון לכל צריכה
      const percents = habits
        .filter((h: any) => h.previousValue && h.previousValue > 0)
        .map((h: any) => ((h.previousValue - h.value) / h.previousValue) * 100);

      const avgSaving =
        percents.length > 0
          ? percents.reduce((a: number, b: number) => a + b, 0) /
            percents.length
          : 0;

      results.push({
        name: user.name || "Unknown",
        email: user.email,
        photo: user.photo || null,
        avgSaving: Number(avgSaving.toFixed(1)),
      });
    }

    // ממיין מהחוסך הטוב ביותר והלאה
    results.sort((a, b) => b.avgSaving - a.avgSaving);

    return Response.json(results.slice(0, 4));
  } catch (err) {
    console.error("❌ Error in /api/savers:", err);
    return Response.json({ error: "failed" }, { status: 500 });
  }
}
