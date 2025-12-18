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
        .sort({ year: -1, month: -1 }) 
        .limit(2)                    
        .toArray();

      if (habits.length < 2) continue;

      const [current, previous] = habits;

      if (!previous.value || previous.value <= 0) continue;

      const savingPercent =
        ((previous.value - current.value) / previous.value) * 100;

      if (savingPercent <= 0) continue;

      results.push({
        name: user.name || "Unknown",
        email: user.email,
        photo: user.photo || null,
        avgSaving: Number(savingPercent.toFixed(1)),
      });
    }

    results.sort((a, b) => b.avgSaving - a.avgSaving);

    return Response.json(results.slice(0, 4));
  } catch (err) {
    console.error("❌ Error in /api/savers:", err);
    return Response.json({ error: "failed" }, { status: 500 });
  }
}
