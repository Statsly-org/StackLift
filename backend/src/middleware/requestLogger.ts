import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger.js";

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const t0 = Date.now();

  res.once("finish", () => {
    const elapsed = Date.now() - t0;
    logger.info("Request", {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      durationMs: elapsed,
    });
  });

  next();
}
