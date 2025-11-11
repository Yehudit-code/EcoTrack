// src/models/Payment.ts
import { Schema, model, models, Types } from "mongoose";
import type { PaymentStatus } from "@/app/types/common";

export interface IPayment {
  userId: Types.ObjectId;
  companyId: Types.ObjectId;
  amount: number;
  ecoTrackFee: number;
  companyRevenue: number;
  description?: string;
  status: PaymentStatus; // "pending" | "paid" | "transferred" | "refunded"
  transactionId?: string;
  paymentGateway?: string; // "Stripe" | "CardCom" | "Tranzila" | ...
  createdAt?: Date;
  updatedAt?: Date;
}


const PaymentSchema = new Schema<IPayment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    companyId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    amount: { type: Number, required: true },
    ecoTrackFee: { type: Number, required: true },
    companyRevenue: { type: Number, required: true },
    description: { type: String },
    status: { type: String, enum: ["pending", "paid", "transferred", "refunded"], default: "pending", index: true },
    transactionId: { type: String },
    paymentGateway: { type: String },
  },
  { timestamps: true }
);

export const Payment = models.Payment || model<IPayment>("Payment", PaymentSchema);
