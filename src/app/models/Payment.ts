import { Schema, model, models, Types } from "mongoose";

export interface IPayment {
  userId: Types.ObjectId;
  companyId: Types.ObjectId;
  amount: number;
  ecoTrackFee: number;
  companyRevenue: number;
  description: string;
  status: "pending" | "paid" | "transferred" | "refunded";
  transactionId?: string;
  paymentGateway?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    companyId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    ecoTrackFee: { type: Number, required: true },
    companyRevenue: { type: Number, required: true },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "paid", "transferred", "refunded"],
      default: "pending",
    },
    transactionId: { type: String },
    paymentGateway: { type: String },
  },
  { timestamps: true }
);

export const Payment = models.Payment || model<IPayment>("Payment", PaymentSchema);
