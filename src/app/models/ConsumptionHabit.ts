// src/models/ConsumptionHabit.ts
import { Schema, model, models, Types } from "mongoose";
import type { ConsumptionCategory } from "@/app/types/common";


export interface IConsumptionHabit {
  userId?: Types.ObjectId; // Keep for backwards compatibility
  userEmail: string; // Use email as identifier
  category: ConsumptionCategory;
  value: number; // current consumption
  previousValue?: number; // last month’s consumption
  month: number; // 1-12
  year: number;
  improvementScore?: number;
  savingPercent?: number; // calculated ((prev - curr)/prev)*100
  tipsGiven?: string[];
  createdAt?: Date;
}

const ConsumptionHabitSchema = new Schema<IConsumptionHabit>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true }, // Optional for backwards compatibility
    userEmail: { type: String, required: true, index: true }, // Primary identifier
    category: {
      type: String,
      enum: ["Water", "Electricity", "Gas", "Transportation", "Waste"],
      required: true,
      index: true,
    },
    value: { type: Number, required: true },
    previousValue: { type: Number, default: null },
    month: { type: Number, min: 1, max: 12, required: true },
    year: { type: Number, required: true },
    improvementScore: { type: Number, default: 0 },
    savingPercent: { type: Number, default: 0 },
    tipsGiven: [{ type: String }],
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

ConsumptionHabitSchema.index({ userEmail: 1, category: 1, year: 1, month: 1 }, { unique: true });

export const ConsumptionHabit =
  models.ConsumptionHabit || model<IConsumptionHabit>("ConsumptionHabit", ConsumptionHabitSchema, "ConsumptionHabits");
