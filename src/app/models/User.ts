// src/models/User.ts
import { Schema, model, models } from "mongoose";
import type { UserRole } from "@/app/types/common";


export interface IUser {
  email: string;
  password: string; // hashed or plain
  role: UserRole; // "user" | "company"
  companyCategory?: string;
  country?: string;
  phone?: string;
  birthDate?: Date;
  photo?: string;
  companies?: {
    electricity?: string;
    water?: string;
    transport?: string;
    recycling?: string;
    solar?: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema = new Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  password: String,
  photo: String,
  provider: String,
  role: String,
  country: String,
  birthDate: Date,
  companyCategory: String,
  improvementScore: Number
});

export const User = models.User || model("User", UserSchema);

