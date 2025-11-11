// src/types/api.ts
import { z } from "zod";
import { ConsumptionCategory } from "./common";

export const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["user", "company"]),
  companyCategory: z.string().optional(),
  country: z.string().optional(),
});
export type SignupInput = z.infer<typeof signupSchema>;

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const consumptionUpsertSchema = z.object({
  userId: z.string(),
  category: z.nativeEnum(ConsumptionCategory),
  value: z.number().nonnegative(),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2000),
  improvementScore: z.number().optional(),
  tipsGiven: z.array(z.string()).optional(),
});
export type ConsumptionUpsertInput = z.infer<typeof consumptionUpsertSchema>;
