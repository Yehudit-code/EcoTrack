// src/models/CompanyRequest.ts
import { Schema, model, models, Types } from "mongoose";

export interface ICompanyRequest {
  companyId: Types.ObjectId;
  userId: Types.ObjectId;
  productName: string;
  description: string;
  price: number;
  status: "sent" | "accepted" | "declined";
  paymentId?: Types.ObjectId;
  createdAt?: Date;
}

const CompanyRequestSchema = new Schema<ICompanyRequest>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    productName: { type: String, required: true },
    description: { type: String },  
    price: { type: Number, required: true },
    status: { type: String, enum: ["sent", "accepted", "declined"], default: "sent", index: true },
    paymentId: { type: Schema.Types.ObjectId, ref: "Payment" },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);


export const CompanyRequest =
  models.CompanyRequest || model<ICompanyRequest>("CompanyRequest", CompanyRequestSchema);
