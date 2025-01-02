// db.ts
import mongoose from "mongoose";

let isConnected = false;

export async function connectToDatabase(env: string): Promise<void> {
  if (isConnected) { return; }
  await mongoose.connect(
    `${process.env.MONGO_URL}/${
      env === "development" ? "urlshortener" : "testDb"
    }`
  );
  isConnected = true;
}
