import { Router, Request, Response } from "express";
import { runQuery } from "../db.js";
import { redis } from "../redis.js";
import { logger } from "../utils/logger.js";

const router = Router();
const taskListCacheKey = "tasks:all";
const cacheSeconds = 60;

function invalidateTaskCache(): void {
  redis.del(taskListCacheKey).catch(() => {
    logger.warn("cache invalidation failed");
  });
}

export const tasksRouter = router;

// TODO: pagination if task list grows
router.get("/", async (req: Request, res: Response) => {
  try {
    try {
      const cached = await redis.get(taskListCacheKey);
      if (cached) {
        return res.json(JSON.parse(cached));
      }
    } catch {
      // cache miss, using db
    }

    const result = await runQuery(
      "SELECT id, title, completed, created_at FROM tasks ORDER BY created_at DESC"
    );
    const tasks = result.rows;

    try {
      await redis.setex(taskListCacheKey, cacheSeconds, JSON.stringify(tasks));
    } catch {
      // skip cache write
    }

    res.json(tasks);
  } catch (err) {
    logger.error("list tasks failed", { err });
    res.status(500).json({ error: "Could not load tasks" });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid task ID" });

  try {
    const result = await runQuery(
      "SELECT id, title, completed, created_at FROM tasks WHERE id = $1",
      [id]
    );
    const row = result.rows[0];
    if (!row) return res.status(404).json({ error: "Task not found" });

    res.json(row);
  } catch (err) {
    logger.warn("couldn't fetch task", { err });
    res.status(500).json({ error: "Task not found" });
  }
});

router.post("/", async (req: Request, res: Response) => {
  const { title, completed = false } = req.body;

  if (!title || typeof title !== "string") {
    return res.status(400).json({ error: "Title is required" });
  }

  try {
    const result = await runQuery(
      "INSERT INTO tasks (title, completed) VALUES ($1, $2) RETURNING id, title, completed, created_at",
      [title.trim(), Boolean(completed)]
    );

    invalidateTaskCache();

    res.status(201).json(result.rows[0]);
  } catch (err) {
    logger.error("create failed", { err });
    res.status(500).json({ error: "Could not create task" });
  }
});

router.put("/:id", async (req: Request, res: Response) => {
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
    const result = await runQuery(
      `UPDATE tasks SET ${updates.join(", ")} WHERE id = $${paramIndex} RETURNING id, title, completed, created_at`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Task not found" });
    }

    invalidateTaskCache();

    res.json(result.rows[0]);
  } catch (err) {
    logger.error("update failed", { err });
    res.status(500).json({ error: "Could not update task" });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: "Invalid task ID" });
  }

  try {
    const result = await runQuery("DELETE FROM tasks WHERE id = $1 RETURNING id", [
      id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Task not found" });
    }

    invalidateTaskCache();

    res.status(204).send();
  } catch (err) {
    logger.warn("delete failed", { err });
    res.status(500).json({ error: "Could not delete task" });
  }
});
