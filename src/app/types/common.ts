// src/types/common.ts
export const ConsumptionCategory = {
  Water: "Water",
  Electricity: "Electricity",
  Gas: "Gas",
  Transportation: "Transportation",
  Waste: "Waste",
} as const;
export type ConsumptionCategory = typeof ConsumptionCategory[keyof typeof ConsumptionCategory];

export const PaymentStatus = {
  Pending: "pending",
  Paid: "paid",
  Transferred: "transferred",
  Refunded: "refunded",
} as const;
export type PaymentStatus = typeof PaymentStatus[keyof typeof PaymentStatus];

export const AlertLevel = {
  High: "high",
  Medium: "medium",
  Low: "low",
} as const;
export type AlertLevel = typeof AlertLevel[keyof typeof AlertLevel];

export type UserRole = "user" | "company";
