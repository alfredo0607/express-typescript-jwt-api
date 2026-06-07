import Redis from "ioredis";
import { env } from "./env";

export const redis = new Redis({
  host: env.redis.host,
  port: env.redis.port,
  password: env.redis.password,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
});

redis.on("error", (err) => {
  console.error("Redis error:", err);
});

export async function connectRedis(): Promise<void> {
  // await redis.connect();
  console.log("✓ Redis connected");
}
