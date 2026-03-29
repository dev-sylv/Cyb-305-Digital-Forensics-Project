import mongoose, { Schema, Document } from "mongoose";
import { UserRole } from "../types";

export interface IUser extends Document {
  fullName: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  badgeNumber: string;
  createdAt: Date;
  lastLogin?: Date;
}

const UserSchema = new Schema<IUser>({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  role: {
    type: String,
    enum: ["submitter", "verifier", "admin"],
    required: true,
  },
  badgeNumber: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date },
});

export default mongoose.model<IUser>("User", UserSchema);
