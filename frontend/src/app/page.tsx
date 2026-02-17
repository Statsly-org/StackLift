"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getHealth, type HealthStatus } from "@/lib/api";

const STORAGE_KEY = "stacklift-dev-checklist";
const CUSTOM_KEY = "stacklift-custom-items";

const PRESETS: { id: string; label: string }[] = [
  { id: "docker-up", label: "Docker Compose running" },
  { id: "env-setup", label: ".env and pgpass configured" },
  { id: "migrations", label: "DB migrations applied" },
  { id: "frontend", label: "Frontend reachable at localhost:3000" },
  { id: "backend", label: "Backend API reachable at localhost:3001" },
  { id: "pgadmin", label: "pgAdmin set up for PostgreSQL" },
  { id: "redisinsight", label: "RedisInsight set up for Redis" },
];

type CustomItem = { id: string; label: string };

function readState(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    return s ? JSON.parse(s) : {};
  } catch {
    return {};
  }
}

function readCustom(): CustomItem[] {
  if (typeof window === "undefined") return [];
  try {
    const s = localStorage.getItem(CUSTOM_KEY);
    return s ? JSON.parse(s) : [];
  } catch {
    return [];
  }
}

export default function Home() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [healthError, setHealthError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [custom, setCustom] = useState<CustomItem[]>([]);
  const [newLabel, setNewLabel] = useState("");
  const [adding, setAdding] = useState(false);

  const fetchHealth = async () => {
    setLoading(true);
    setHealthError(null);
    try {
      const data = await getHealth();
      setHealth(data);
    } catch (e) {
      setHealthError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    setDone(readState());
    setCustom(readCustom());
  }, []);

  const flip = (id: string) => {
    const next = { ...done, [id]: !done[id] };
    setDone(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      console.warn("localStorage write failed");
    }
  };

  const addItem = (e: React.FormEvent) => {
    e.preventDefault();
    const label = newLabel?.trim();
    if (!label || adding) return;
    setAdding(true);
    const item: CustomItem = {
      id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      label,
    };
    const next = [...custom, item];
    setCustom(next);
    setNewLabel("");
    setAdding(false);
    try {
      localStorage.setItem(CUSTOM_KEY, JSON.stringify(next));
    } catch {
      console.warn("localStorage write failed");
    }
  };

  const dropItem = (id: string) => {
    const next = custom.filter((c) => c.id !== id);
    setCustom(next);
    const nextDone = { ...done };
    delete nextDone[id];
    setDone(nextDone);
    try {
      localStorage.setItem(CUSTOM_KEY, JSON.stringify(next));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextDone));
    } catch {
      console.warn("localStorage write failed");
    }
  };

  const allItems = [...PRESETS, ...custom];

  return (
    <div className="min-h-full">
      <div className="max-w-2xl mx-auto px-6 py-12 pb-16">
        <header className="mb-14 flex items-center justify-between">
          <div>
            <h1 className="font-mono text-3xl font-bold text-[var(--foreground)] tracking-tight" suppressHydrationWarning>
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
          <h2 className="text-xs font-semibold text-[var(--accent)] mb-4 uppercase tracking-widest">
            Dev Checklist
          </h2>

          <form onSubmit={addItem} className="flex gap-2 mb-5">
            <input
              type="text"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="Add your own..."
              className="flex-1 px-4 py-2.5 rounded-[var(--radius-sm)] border border-[var(--card-border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--foreground)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 transition-[var(--transition)]"
              disabled={adding}
            />
            <button
              type="submit"
              disabled={!newLabel?.trim() || adding}
              className="px-4 py-2.5 rounded-[var(--radius-sm)] bg-[var(--accent)] text-white font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-[var(--transition)]"
            >
              Add
            </button>
          </form>

          <ul className="space-y-1.5">
            {allItems.map((item) => (
              <li
                key={item.id}
                className="group flex items-center gap-3 py-3 px-4 rounded-lg border border-transparent hover:border-[var(--accent)]/20 hover:bg-[var(--background)]/50 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={!!done[item.id]}
                  onChange={() => flip(item.id)}
                  className="w-4 h-4 rounded border-[var(--card-border)] text-[var(--accent)] focus:ring-[var(--accent)] cursor-pointer shrink-0"
                />
                <span
                  className={`flex-1 text-[var(--foreground)] text-sm ${
                    done[item.id] ? "line-through opacity-55" : ""
                  }`}
                >
                  {item.label}
                </span>
                {custom.some((c) => c.id === item.id) && (
                  <button
                    type="button"
                    onClick={() => dropItem(item.id)}
                    className="opacity-0 group-hover:opacity-100 text-[var(--foreground)]/50 hover:text-red-500 text-xs transition-opacity"
                  >
                    Remove
                  </button>
                )}
              </li>
            ))}
          </ul>

          {allItems.length === 0 && (
            <p className="text-sm text-[var(--foreground)]/50 py-6 text-center">
              No items yet. Add one above.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
