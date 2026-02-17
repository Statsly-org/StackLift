"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  fetchHealth,
  fetchTasks,
  createTask,
  updateTask,
  deleteTask,
  type Task,
  type HealthStatus,
} from "@/lib/api";

export default function Home() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [healthError, setHealthError] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksError, setTasksError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const loadData = async () => {
    setLoading(true);
    setHealthError(null);
    setTasksError(null);

    try {
      const [healthData, tasksData] = await Promise.all([
        fetchHealth(),
        fetchTasks(),
      ]);
      setHealth(healthData);
      setTasks(tasksData);
    } catch (err) {
      setHealthError(err instanceof Error ? err.message : "Connection failed");
      setTasksError(err instanceof Error ? err.message : "Connection failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || submitting) return;
    setSubmitting(true);
    try {
      const task = await createTask(newTitle.trim());
      setTasks((prev) => [task, ...prev]);
      setNewTitle("");
    } catch (err) {
      setTasksError(err instanceof Error ? err.message : "Failed to create");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (task: Task) => {
    try {
      const updated = await updateTask(task.id, {
        completed: !task.completed,
      });
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? updated : t))
      );
    } catch (err) {
      setTasksError(err instanceof Error ? err.message : "Failed to update");
    }
  };

  const handleEdit = (task: Task) => {
    setEditingId(task.id);
    setEditTitle(task.title);
  };

  const handleSaveEdit = async () => {
    if (editingId === null) return;
    try {
      const updated = await updateTask(editingId, { title: editTitle.trim() });
      setTasks((prev) =>
        prev.map((t) => (t.id === editingId ? updated : t))
      );
      setEditingId(null);
      setEditTitle("");
    } catch (err) {
      setTasksError(err instanceof Error ? err.message : "Failed to update");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      setTasksError(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  return (
    <div className="min-h-full">
      <div className="max-w-2xl mx-auto px-6 py-12 pb-16">
        <header className="mb-14 flex items-center justify-between">
          <div>
            <h1 className="font-mono text-3xl font-bold text-[var(--foreground)] tracking-tight">
              StackLift
            </h1>
            <p className="text-[var(--foreground)]/60 mt-2 text-sm">
              by <a href="https://statsly.org" target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors">Statix</a>
            </p>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[var(--radius-sm)] text-sm font-medium text-white bg-[var(--accent)] hover:bg-[var(--accent-hover)] transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Health Dashboard
          </Link>
        </header>

        <section className="mb-8 p-6 rounded-[var(--radius)] border border-[var(--card-border)] bg-[var(--card)] shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] hover:border-[var(--accent)]/20 transition-all duration-200">
          <h2 className="text-xs font-semibold text-[var(--accent)] mb-3 uppercase tracking-widest">
            API Status
          </h2>
          {loading && !health ? (
            <p className="text-sm text-[var(--foreground)]/60">Checking connection...</p>
          ) : healthError ? (
            <p className="text-sm text-red-500">{healthError}</p>
          ) : health ? (
            <div className="flex flex-wrap gap-4">
              <span className="inline-flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${health.status === "ok" ? "bg-emerald-500" : "bg-red-500"}`} />
                <span className="text-sm">API {health.status}</span>
              </span>
              <span className="inline-flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${health.database === "connected" ? "bg-emerald-500" : "bg-red-500"}`} />
                <span className="text-sm">PostgreSQL</span>
              </span>
              <span className="inline-flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${health.redis === "connected" ? "bg-emerald-500" : "bg-amber-500"}`} />
                <span className="text-sm">Redis</span>
              </span>
            </div>
          ) : null}
        </section>

        <section className="p-6 rounded-[var(--radius)] border border-[var(--card-border)] bg-[var(--card)] shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] hover:border-[var(--accent)]/20 transition-all duration-200">
          <h2 className="text-xs font-semibold text-[var(--accent)] mb-5 uppercase tracking-widest">
            Dev Checklist
          </h2>

          <form onSubmit={handleCreate} className="flex gap-3 mb-6">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Add a dev reminder or note..."
              className="flex-1 px-4 py-2.5 rounded-[var(--radius-sm)] border border-[var(--card-border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--foreground)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 transition-[var(--transition)]"
              disabled={submitting}
            />
            <button
              type="submit"
              disabled={!newTitle.trim() || submitting}
              className="px-5 py-2.5 rounded-[var(--radius-sm)] bg-[var(--accent)] text-white font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-[var(--transition)]"
            >
              Add
            </button>
          </form>

          {tasksError && (
            <p className="text-sm text-red-500 mb-4">{tasksError}</p>
          )}

          {loading ? (
            <p className="text-sm text-[var(--foreground)]/60 py-4">Loading...</p>
          ) : (
            <ul className="space-y-2">
              {tasks.map((task) => (
                <li
                  key={task.id}
                  className="flex items-center gap-3 p-4 rounded-[var(--radius-sm)] border border-[var(--card-border)] bg-[var(--background)]/50 hover:border-[var(--accent)]/30 transition-[var(--transition)]"
                >
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => handleToggle(task)}
                    className="w-4 h-4 rounded border-[var(--card-border)] text-[var(--accent)] focus:ring-[var(--accent)]"
                  />
                  {editingId === task.id ? (
                    <>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleSaveEdit()
                        }
                        className="flex-1 px-3 py-1.5 rounded border border-[var(--card-border)] bg-[var(--card)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveEdit}
                          className="text-sm font-medium text-emerald-600 hover:text-emerald-500"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(null);
                            setEditTitle("");
                          }}
                          className="text-sm text-[var(--foreground)]/60 hover:text-[var(--foreground)]"
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <span
                        className={`flex-1 text-[var(--foreground)] ${
                          task.completed
                            ? "line-through opacity-60"
                            : ""
                        }`}
                      >
                        {task.title}
                      </span>
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleEdit(task)}
                          className="text-sm font-medium text-[var(--accent)] hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(task.id)}
                          className="text-sm font-medium text-red-500 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}

          {!loading && tasks.length === 0 && !tasksError && (
            <p className="text-sm text-[var(--foreground)]/60 py-8 text-center">
              Nothing here yet. Add a reminder above.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
