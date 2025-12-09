// scripts/fix-previous-values.cjs

// 1. טוען משתני סביבה מתוך .env.local (או .env)
require("dotenv").config({ path: ".env.local" });

const mongoose = require("mongoose");

// 2. חיבור למונגו
const uri = process.env.MONGODB_URI || process.env.MONGODB_URL;

if (!uri) {
  console.error("❌ Missing MONGODB_URI in .env.local");
  process.exit(1);
}

// 3. הגדרת סכימה מינימלית ל-ConsumptionHabit (רק לשימוש סקריפט)
const consumptionHabitSchema = new mongoose.Schema(
  {
    userEmail: { type: String, required: true },
    category: { type: String, required: true },
    value: { type: Number, required: true },
    previousValue: { type: Number, default: null },
    month: { type: Number, required: true },
    year: { type: Number, required: true },
  },
  {
    collection: "ConsumptionHabits",
  }
);

const ConsumptionHabit =
  mongoose.models.ConsumptionHabit ||
  mongoose.model("ConsumptionHabit", consumptionHabitSchema);

async function run() {
  try {
    console.log("🔌 Connecting to Mongo...");
    await mongoose.connect(uri);
    console.log("✅ Connected");

    // מביא את כל הרשומות, ממוין לפי יוזר+קטגוריה+תאריך
    const habits = await ConsumptionHabit.find({})
      .sort({ userEmail: 1, category: 1, year: 1, month: 1 })
      .lean();

    console.log(`📦 Found ${habits.length} habits`);

    if (!habits.length) {
      console.log("⚠️ No documents, nothing to update.");
      process.exit(0);
    }

    // קיבוץ לפי userEmail+category
    const grouped = {};
    for (const h of habits) {
      const key = `${h.userEmail}__${h.category}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(h);
    }

    let updatedCount = 0;

    for (const key of Object.keys(grouped)) {
      const list = grouped[key];

      // list כבר ממוין לפי year+month
      for (let i = 1; i < list.length; i++) {
        const prev = list[i - 1];
        const curr = list[i];

        // אם כבר יש previousValue, לא נוגעים
        if (curr.previousValue !== null && curr.previousValue !== undefined) {
          continue;
        }

        const newPrev = prev.value ?? null;

        await ConsumptionHabit.updateOne(
          { _id: curr._id },
          { $set: { previousValue: newPrev } }
        );

        updatedCount++;
      }
    }

    console.log(`✅ Done. Updated ${updatedCount} documents.`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Error running script:", err);
    process.exit(1);
  }
}

run();
