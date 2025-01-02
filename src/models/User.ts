import mongoose from "mongoose";

export interface IUser extends mongoose.Document {
  displayName: string;
  email: string;
  googleId: string;
}

const userSchema = new mongoose.Schema(
  {
    displayName: { type: String, required: true },
    email: { type: String, required: true },
    googleId: { type: String, required: true },
  },
  { timestamps: true }
);

const User = mongoose.model<IUser>("User", userSchema);

export default User;
