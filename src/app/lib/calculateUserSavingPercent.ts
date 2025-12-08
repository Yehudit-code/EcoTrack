import { ConsumptionHabit } from "@/app/models/ConsumptionHabit";
import { User } from "@/app/models/User";

export async function calculateUserSavingPercent() {
  console.log("Running calculateUserSavingPercent...");

  const users = await User.find();
  console.log("Users found:", users.length);

  const results: { email: string; avgSaving: number }[] = [];

  for (const user of users) {
    console.log("Checking user:", user.email);

    const habits = await ConsumptionHabit.find({ userId: user._id });
    console.log("Found habits:", habits.length);

    if (habits.length === 0) continue;

    const savingPercents = habits
      .filter((h) => h.previousValue && h.previousValue > 0)
      .map((h) => {
        const percent = ((h.previousValue! - h.value) / h.previousValue!) * 100;
        console.log(`${h.category} saving = ${percent}%`);
        return percent;
      });

    const avgSaving =
      savingPercents.length > 0
        ? savingPercents.reduce((a, b) => a + b, 0) / savingPercents.length
        : 0;

    console.log("Avg saving:", avgSaving);

    user.improvementScore = avgSaving;
    await user.save();

    results.push({ email: user.email, avgSaving });
  }

  console.log("Final results:", results);
  return results.sort((a, b) => b.avgSaving - a.avgSaving);
}
