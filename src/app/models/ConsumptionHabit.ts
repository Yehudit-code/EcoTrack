// src/models/ConsumptionHabit.ts
import { Schema, model, models, Types } from "mongoose";
import type { ConsumptionCategory } from "@/app/types/common";

export interface IConsumptionHabit {
  userId: Types.ObjectId;
  category: ConsumptionCategory;
  value: number;
  month: number; // 1-12
  year: number;
  improvementScore?: number;
  tipsGiven?: string[];
  createdAt?: Date;
}

const ConsumptionHabitSchema = new Schema<IConsumptionHabit>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    category: {
      type: String,
      enum: ["Water", "Electricity", "Gas", "Transportation", "Waste"],
      required: true,
      index: true,
    },
    value: { type: Number, required: true },
    month: { type: Number, min: 1, max: 12, required: true },
    year: { type: Number, required: true },
    improvementScore: { type: Number, default: 0 },
    tipsGiven: [{ type: String }],
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

ConsumptionHabitSchema.index({ userId: 1, category: 1, year: 1, month: 1 }, { unique: true });

export const ConsumptionHabit =
  models.ConsumptionHabit || model<IConsumptionHabit>("ConsumptionHabit", ConsumptionHabitSchema);
