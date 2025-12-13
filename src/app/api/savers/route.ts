import { connectDB } from "@/app/services/server/mongodb";

export async function GET() {
  try {
    const db = await connectDB();
    const usersCollection = db.collection("Users");
    const habitsCollection = db.collection("ConsumptionHabits");

    const users = await usersCollection.find({}).toArray();
    const results: any[] = [];

    for (const user of users) {
      const habits = await habitsCollection
        .find({ userEmail: user.email })
        .sort({ year: 1, month: 1 }) // לא חובה כאן, אבל מסודר יפה
        .toArray();

      if (habits.length === 0) continue;

      const savings: number[] = [];

      for (const h of habits) {
        if (h.previousValue && h.previousValue > 0) {
          const savingPercent =
            ((h.previousValue - h.value) / h.previousValue) * 100;

          savings.push(savingPercent);
        }
      }

      if (savings.length === 0) continue;

      const avgSaving =
        savings.reduce((a, b) => a + b, 0) / savings.length;

      results.push({
        name: user.name || "Unknown",
        email: user.email,
        photo: user.photo || null,
        avgSaving: Number(avgSaving.toFixed(1)),
      });
    }

    // ממיין מהכי חוסך (אחוז גבוה) להכי פחות
    results.sort((a, b) => b.avgSaving - a.avgSaving);

    return Response.json(results.slice(0, 4));

  } catch (err) {
    console.error("❌ Error in /api/savers:", err);
    return Response.json({ error: "failed" }, { status: 500 });
  }
}
