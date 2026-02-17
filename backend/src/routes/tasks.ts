import { Router, Request, Response } from "express";
import { query } from "../db.js";
import { redis } from "../redis.js";
import { logger } from "../utils/logger.js";

export const tasksRouter = Router();
const CACHE_KEY = "tasks:all";
const CACHE_TTL = 60;

tasksRouter.get("/", async (req: Request, res: Response) => {
  try {
    try {
      const cached = await redis.get(CACHE_KEY);
      if (cached) {
        return res.json(JSON.parse(cached));
      }
    } catch {
      // Redis unavailable, fall through to DB
    }

    const result = await query(
      "SELECT id, title, completed, created_at FROM tasks ORDER BY created_at DESC"
    );
    const tasks = result.rows;

    try {
      await redis.setex(CACHE_KEY, CACHE_TTL, JSON.stringify(tasks));
    } catch {
      // Redis unavailable, ignore cache
    }

    res.json(tasks);
  } catch (err) {
    logger.error("GET /api/tasks failed", { err });
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

tasksRouter.get("/:id", async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: "Invalid task ID" });
  }

  try {
    const result = await query(
      "SELECT id, title, completed, created_at FROM tasks WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    logger.error("GET /api/tasks/:id failed", { err });
    res.status(500).json({ error: "Failed to fetch task" });
  }
});

tasksRouter.post("/", async (req: Request, res: Response) => {
  const { title, completed = false } = req.body;

  if (!title || typeof title !== "string") {
    return res.status(400).json({ error: "Title is required" });
  }

  try {
    const result = await query(
      "INSERT INTO tasks (title, completed) VALUES ($1, $2) RETURNING id, title, completed, created_at",
      [title.trim(), Boolean(completed)]
    );

    try {
      await redis.del(CACHE_KEY);
    } catch {
      // Redis unavailable
    }

    res.status(201).json(result.rows[0]);
  } catch (err) {
    logger.error("POST /api/tasks failed", { err });
    res.status(500).json({ error: "Failed to create task" });
  }
});

tasksRouter.put("/:id", async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: "Invalid task ID" });
  }

  const { title, completed } = req.body;

  const updates: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (typeof title === "string") {
    updates.push(`title = $${paramIndex++}`);
    values.push(title.trim());
  }
  if (typeof completed === "boolean") {
    updates.push(`completed = $${paramIndex++}`);
    values.push(completed);
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: "No valid fields to update" });
  }

  values.push(id);

  try {
    const result = await query(
      `UPDATE tasks SET ${updates.join(", ")} WHERE id = $${paramIndex} RETURNING id, title, completed, created_at`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Task not found" });
    }

    try {
      await redis.del(CACHE_KEY);
    } catch {
      // Redis unavailable
    }

    res.json(result.rows[0]);
  } catch (err) {
    logger.error("PUT /api/tasks/:id failed", { err });
    res.status(500).json({ error: "Failed to update task" });
  }
});

tasksRouter.delete("/:id", async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: "Invalid task ID" });
  }

  try {
    const result = await query("DELETE FROM tasks WHERE id = $1 RETURNING id", [
      id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Task not found" });
    }

    try {
      await redis.del(CACHE_KEY);
    } catch {
      // Redis unavailable
    }

    res.status(204).send();
  } catch (err) {
    logger.error("DELETE /api/tasks/:id failed", { err });
    res.status(500).json({ error: "Failed to delete task" });
  }
});
