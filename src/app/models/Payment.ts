import { Schema, model, models, Types } from "mongoose";

export interface IPayment {
  userId: Types.ObjectId;
  companyId: Types.ObjectId;
  requestId: Types.ObjectId;
  amount: number;
  ecoTrackFee: number;
  companyRevenue: number;
  status: "pending" | "paid" | "failed" | "transferred";
  transactionId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    companyId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    requestId: { type: Schema.Types.ObjectId, ref: "CompanyRequest", required: true },
    amount: { type: Number, required: true },
    ecoTrackFee: { type: Number, required: true },
    companyRevenue: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "paid", "failed", "transferred"],
      default: "pending",
    },
    transactionId: { type: String },
  },
  { timestamps: true }
);

export const Payment =
  models.Payment || model<IPayment>("Payment", PaymentSchema);
