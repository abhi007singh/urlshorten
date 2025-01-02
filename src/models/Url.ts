import { Document, model, Schema, Types } from "mongoose";

export interface IClickByDate {
  clicks: number;
  date: {
    day: number;
    month: number;
    year: number;
  };
}

export interface IDeviceType {
  deviceName: string;
  uniqueClicks: number;
  uniqueUser: number;
}

export interface IOsType {
  osName: string;
  uniqueClicks: number;
  uniqueUser: number;
}

export interface IUrl {
  alias: string;
  clickByDates?: IClickByDate[];
  clicks?: number;
  createdAt?: Date;
  deviceType?: IDeviceType[];
  longUrl: string;
  osType?: IOsType[];
  topic: "acquisition" | "activation" | "retention";
  uniqueClicks?: number;
  updatedAt?: Date;
  userId: Types.ObjectId;
}

export const urlSchema = new Schema<IUrl>(
  {
    alias: {
      require: true,
      type: String,
      unique: true,
    },
    clickByDates: {
      default: [],
      type: [
        {
          clicks: Number,
          date: {
            day: {
              max: 31,
              min: 1,
              type: Number,
            },
            month: {
              max: 12,
              min: 1,
              type: Number,
            },
            year: {
              max: 2050,
              min: 1970,
              type: Number,
            },
          },
        },
      ],
    },
    clicks: {
      default: 0,
      type: Number,
    },
    deviceType: {
      default: [],
      type: [
        {
          name: String,
          uniqueClicks: Number,
          uniqueUser: Number,
        },
      ],
    },
    longUrl: {
      require: true,
      type: String,
      unique: true,
    },
    osType: {
      default: [],
      type: [
        {
          name: String,
          uniqueClicks: Number,
          uniqueUser: Number,
        },
      ],
    },
    topic: {
      default: "acquisition",
      enum: ["acquisition", "activation", "retention"],
      type: String,
    },
    uniqueClicks: {
      default: 0,
      type: Number,
    },
    userId: {
      ref: "User",
      type: Schema.Types.ObjectId,
    },
  },
  {
    timestamps: true,
  }
);

const Url = model("Url", urlSchema);

export default Url;
