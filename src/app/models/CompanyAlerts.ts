import { Schema, model, models, Types } from "mongoose";

export interface ICompanyAlert {
  companyId: Types.ObjectId;
  userId: Types.ObjectId;
  category: "Water" | "Electricity" | "Gas" | "Transportation" | "Waste";
  alertLevel: "high" | "medium" | "low";
  lastUpdated: Date;
  isActive: boolean;
}

const CompanyAlertSchema = new Schema<ICompanyAlert>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    category: { type: String, enum: ["Water", "Electricity", "Gas", "Transportation", "Waste"], required: true },
    alertLevel: { type: String, enum: ["high", "medium", "low"], default: "high", index: true },
    lastUpdated: { type: Date, default: () => new Date() },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: false }
);

CompanyAlertSchema.index({ companyId: 1, userId: 1, category: 1 }, { unique: true });

export const CompanyAlert =
  models.CompanyAlert || model<ICompanyAlert>("CompanyAlert", CompanyAlertSchema);
