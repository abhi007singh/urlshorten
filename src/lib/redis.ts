// redis.ts
import { createClient } from "redis";

const redisClient = createClient({ url: process.env.REDIS_URL });
export async function connectToRedis() {
  await redisClient.connect();
}
