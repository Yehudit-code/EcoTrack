import { Schema, Types, model, models } from "mongoose";
import type { UserRole } from "@/app/types/common";

export interface IUser {
  _id: string | Types.ObjectId;
  name?: string;
  email: string;
  password?: string;
  role: UserRole;
  companyCategory?: string;
  country?: string;
  phone?: string;
  improvementScore?: number;
  birthDate?: Date;
  photo?: string;

  bankName?: string;
  branch?: string;
  accountNumber?: string;
  accountOwner?: string;

  talkedByCompanies?: Record<string, boolean>;

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

const UserSchema = new Schema(
  {
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

    bankName: String,
    branch: String,
    accountNumber: String,
    accountOwner: String,

    talkedByCompanies: {
      type: Map,
      of: Boolean,
      default: {},
    },


    companies: {
      electricity: String,
      water: String,
      transport: String,
      recycling: String,
      solar: String,
    },
  },
  { timestamps: true }
);


export const User = models.User || model("User", UserSchema, "Users");
