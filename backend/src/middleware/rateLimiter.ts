import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { redis } from "../config/redis";
import { env } from "../config/env";

const createStore = (prefix: string) =>
  new RedisStore({
    prefix,
    sendCommand: (command: string, ...args: string[]) =>
      redis.call(command, ...args) as any,
  });

export const globalRateLimiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.maxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  store: createStore("rl:global:"),
  message: {
    status: "error",
    message: "Too many requests, please try again later.",
  },
});

export const loginRateLimiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.loginMax,
  standardHeaders: true,
  legacyHeaders: false,
  store: createStore("rl:login:"),
  keyGenerator: (req) => ipKeyGenerator(req.ip ?? ""),
  message: {
    status: "error",
    message: "Too many login attempts, please try again in 15 minutes.",
  },
});
