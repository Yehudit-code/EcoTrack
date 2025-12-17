import { Schema, model, models } from "mongoose";

export interface ITip {
  category: "Water" | "Electricity" | "Gas" | "Transportation" | "Waste";
  text: string;
  level: "basic" | "advanced";
  createdAt?: Date;
}

const TipSchema = new Schema<ITip>(
  {
    category: { type: String, enum: ["Water", "Electricity", "Gas", "Transportation", "Waste"], required: true, index: true },
    text: { type: String, required: true },
    level: { type: String, enum: ["basic", "advanced"], default: "basic" },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Tip = models.Tip || model<ITip>("Tip", TipSchema);
