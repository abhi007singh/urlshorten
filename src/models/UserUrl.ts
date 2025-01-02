import { Document, model, Schema, Types } from "mongoose";

export interface IUserUrl extends Document {
  createdAt?: Date;
  updatedAt?: Date;
  userId: Types.ObjectId;
  userUrls?: Types.ObjectId[];
}

const userUrlSchema = new Schema<IUserUrl>(
  {
    userId: {
      ref: "User",
      required: true,
      type: Schema.Types.ObjectId,
      unique: true,
    },
    userUrls: [
      {
        ref: "Url",
        type: Schema.Types.ObjectId,
        unique: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const UserUrl = model<IUserUrl>("UserUrl", userUrlSchema);

export default UserUrl;
