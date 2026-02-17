import "./config.js";
import cors from "cors";
import express from "express";
import { tasksRouter } from "./routes/tasks.js";
import { healthRouter } from "./routes/health.js";
import { requestLogger } from "./middleware/requestLogger.js";
import { logger } from "./utils/logger.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(requestLogger);
// health first, cuz I did it first
app.use("/", healthRouter);
app.use("/api/tasks", tasksRouter);

app.listen(PORT, () => {
  logger.info(`API listening on port ${PORT}`);
});