import { connectDB } from "@/app/services/server/mongodb";

/**
 * טיפוס של רשומת צריכה
 */
interface ConsumptionHabit {
  userEmail: string;
  category: string;
  month: number;
  year: number;
  value: number;
}

export async function GET() {
  try {
    const db = await connectDB();
    const usersCollection = db.collection("Users");
    const habitsCollection = db.collection("ConsumptionHabits");

    const users = await usersCollection.find({}).toArray();
    const results: any[] = [];

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const previousYear =
      currentMonth === 1 ? currentYear - 1 : currentYear;

    for (const user of users) {
      const habits = (await habitsCollection
        .find({ userEmail: user.email })
        .toArray()) as ConsumptionHabit[];

      if (habits.length === 0) continue;

      // 🔹 צריכה חודש נוכחי
      const currentHabits = habits.filter(
        (h: ConsumptionHabit) =>
          h.month === currentMonth && h.year === currentYear
      );

      // 🔹 צריכה חודש קודם
      const previousHabits = habits.filter(
        (h: ConsumptionHabit) =>
          h.month === previousMonth && h.year === previousYear
      );

      if (currentHabits.length === 0 || previousHabits.length === 0) continue;

      // 🔹 סכימת צריכה
      const totalCurrent = currentHabits.reduce(
        (sum: number, h: ConsumptionHabit) =>
          sum + Number(h.value || 0),
        0
      );

      const totalPrevious = previousHabits.reduce(
        (sum: number, h: ConsumptionHabit) =>
          sum + Number(h.value || 0),
        0
      );

      if (totalPrevious <= 0) continue;

      // 🔹 חישוב אחוז חסכון
      const savingPercent =
        ((totalPrevious - totalCurrent) / totalPrevious) * 100;

      // ❗ מסננים תוצאות לא הגיוניות
      if (savingPercent <= 0 || savingPercent > 50) continue;

      results.push({
        name: user.name || "Unknown",
        email: user.email,
        photo: user.photo || null,
        avgSaving: Number(savingPercent.toFixed(1)),
      });
    }

    // 🔹 מיון לפי חסכון
    results.sort((a, b) => b.avgSaving - a.avgSaving);

    return Response.json(results.slice(0, 4));
  } catch (err) {
    console.error("❌ Error in /api/savers:", err);
    return Response.json({ error: "failed" }, { status: 500 });
  }
}
