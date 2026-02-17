type LogLevel = "debug" | "info" | "warn" | "error";

const LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLevel: LogLevel = (process.env.LOG_LEVEL?.toLowerCase() as LogLevel) || "info";

function shouldLog(level: LogLevel): boolean {
  return LEVELS[level] >= LEVELS[currentLevel];
}

function formatTime(): string {
  const now = new Date();
  return now.toTimeString().slice(0, 8);
}

function formatMetaValue(v: unknown): string {
  if (v instanceof Error) return v.message;
  if (typeof v === "object" && v !== null) return JSON.stringify(v);
  return String(v);
}

function formatMessage(level: LogLevel, message: string, meta?: Record<string, unknown>): string {
  const time = formatTime();
  const levelTag = level.toUpperCase().padEnd(5);
  let line = `[${time}] ${levelTag}  ${message}`;
  if (meta && Object.keys(meta).length > 0) {
    const parts = Object.entries(meta)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => `${k}=${formatMetaValue(v)}`);
    if (parts.length > 0) {
      line += `  |  ${parts.join("  ")}`;
    }
  }
  return line;
}

function log(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
  if (!shouldLog(level)) return;
  const output = formatMessage(level, message, meta);
  if (level === "error") {
    console.error(output);
  } else if (level === "warn") {
    console.warn(output);
  } else {
    console.log(output);
  }
}

export const logger = {
  debug: (message: string, meta?: Record<string, unknown>) => log("debug", message, meta),
  info: (message: string, meta?: Record<string, unknown>) => log("info", message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => log("warn", message, meta),
  error: (message: string, meta?: Record<string, unknown>) => log("error", message, meta),
};
