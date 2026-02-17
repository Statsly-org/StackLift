import Redis from "ioredis";

const redisAddr = process.env.REDIS_URL || "redis://localhost:6379";

export const redis = new Redis(redisAddr, {
  maxRetriesPerRequest: 2,
  retryStrategy: () => null,
  lazyConnect: true,
});

redis.on("error", () => {
  // fail silently, routes will handle it. Tho you can do it here if you prefer.
});
