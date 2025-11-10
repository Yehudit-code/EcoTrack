// src/models/ChatHistory.ts
import { Schema, model, models, Types } from "mongoose";

export interface IChatHistory {
  userId: Types.ObjectId;
  role: "user" | "assistant";
  message: string;
  createdAt?: Date;
}

const ChatHistorySchema = new Schema<IChatHistory>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    role: { type: String, enum: ["user", "assistant"], required: true },
    message: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const ChatHistory =
  models.ChatHistory || model<IChatHistory>("ChatHistory", ChatHistorySchema);
