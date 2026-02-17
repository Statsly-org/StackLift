import { Router } from "express";
import { query } from "../db.js";
import { redis } from "../redis.js";

export const healthRouter = Router();

healthRouter.get("/health", async (_req, res) => {
  const status: Record<string, string> = {
    status: "ok",
    timestamp: new Date().toISOString(),
  };

  try {
    await query("SELECT 1");
    status.database = "connected";
  } catch {
    status.database = "error";
  }

  try {
    await redis.ping();
    status.redis = "connected";
  } catch {
    status.redis = "unavailable";
  }

  const pgadminUrl = process.env.PGADMIN_URL;
  if (pgadminUrl) {
    status.pgadmin_url = pgadminUrl;
  }

  const redisinsightUrl = process.env.REDISINSIGHT_URL;
  if (redisinsightUrl) {
    status.redisinsight_url = redisinsightUrl;
  }

  const isHealthy = status.database === "connected";
  res.status(isHealthy ? 200 : 503).json(status);
});
