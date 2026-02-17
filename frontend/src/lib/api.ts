export const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
// TODO: retry on transient failures?

export interface Task {
  id: number;
  title: string;
  completed: boolean;
  created_at: string;
}

export interface HealthStatus {
  status: string;
  timestamp: string;
  database: string;
  redis: string;
  pgadmin_url?: string;
  redisinsight_url?: string;
}

export async function getHealth(): Promise<HealthStatus> {
  const res = await fetch(`${baseUrl}/health`);
  if (!res.ok) throw new Error("Health check failed");
  return res.json();
}

export async function loadTasks(): Promise<Task[]> {
  const res = await fetch(`${baseUrl}/api/tasks`);
  if (!res.ok) throw new Error("Could not load tasks");
  return res.json();
}

export async function createTask(title: string, completed = false): Promise<Task> {
  const res = await fetch(`${baseUrl}/api/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, completed }),
  });
  if (!res.ok) throw new Error("Create failed");
  return res.json();
}

export async function updateTask(
  id: number,
  data: { title?: string; completed?: boolean }
): Promise<Task> {
  const res = await fetch(`${baseUrl}/api/tasks/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Update failed");
  return res.json();
}

export async function deleteTask(id: number): Promise<void> {
  const res = await fetch(`${baseUrl}/api/tasks/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Delete failed");
}
