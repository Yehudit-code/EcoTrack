// src/models/User.ts
import { Schema, Types, model, models } from "mongoose";
import type { UserRole } from "@/app/types/common";

export interface IUser {
  _id: string | Types.ObjectId;
  name?: string;
  email: string;
  password: string;
  role: UserRole;
  companyCategory?: string;
  country?: string;
  phone?: string;
  improvementScore?: number;
  birthDate?: Date;
  photo?: string;

  talkedByCompanies?: Map<string, boolean>;

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
  improvementScore: Number,
  talkedByCompanies: {
    type: Map,
    of: Boolean,
    default: {},
  },
});

export const User = models.User || model("User", UserSchema, "Users");
