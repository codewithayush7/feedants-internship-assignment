import mongoose, { Schema, Document } from "mongoose";
import { IUser } from "../types";

export interface IUserDocument extends IUser, Document {}

const UserSchema = new Schema<IUserDocument>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    avatarUrl: { type: String, default: "" }
  },
  { timestamps: true }
);

export const User = mongoose.model<IUserDocument>("User", UserSchema);
