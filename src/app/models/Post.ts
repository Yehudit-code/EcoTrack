// src/models/Post.ts
import { Schema, model, models } from "mongoose";

export interface IPost {
  userEmail: string;
  content: string;
  likes?: number;
  comments?: string[];
  createdAt?: Date;
}

const PostSchema = new Schema<IPost>(
  {
    userEmail: { type: String, required: true },
    content: { type: String, required: true },
    likes: { type: Number, default: 0 },
    comments: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const Post = models.Post || model<IPost>("Post", PostSchema);
