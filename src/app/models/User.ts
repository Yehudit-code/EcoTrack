// src/models/User.ts
import { Schema, model, models } from "mongoose";
import type { UserRole } from "@/app/types/common";

export interface IUser {
  email: string;
  password: string; // hashed
  role: UserRole; // "user" | "company"
  companyCategory?: string;
  country?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, unique: true, required: true, index: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "company"], required: true },
    companyCategory: { type: String },
    country: { type: String },
  },
  { timestamps: true }
);

export const User = models.User || model<IUser>("User", UserSchema);
