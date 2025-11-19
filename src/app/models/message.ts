// src/models/Message.ts
import { Schema, model, models } from "mongoose";

export interface IMessage {
  senderEmail: string;
  receiverEmail: string;
  message: string;
  sentAt?: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    senderEmail: { type: String, required: true },
    receiverEmail: { type: String, required: true },
    message: { type: String, required: true },
  },
  { timestamps: { createdAt: "sentAt" } }
);

export const Message =
  models.Message || model<IMessage>("Message", MessageSchema);
