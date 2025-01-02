import mongoose from "mongoose";
import { connectToDatabase } from "./src/lib/db";

beforeAll(async () => {
  await connectToDatabase("test");
});

afterAll(async () => {
  await mongoose.disconnect();
});
