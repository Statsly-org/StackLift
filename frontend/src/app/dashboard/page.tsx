"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchHealth, type HealthStatus } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

function StatusBadge({ status }: { status: string }) {
  const isOk = status === "connected" || status === "ok";
  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-[var(--transition)] ${
        isOk
          ? "bg-[var(--success-bg)] text-[var(--success)]"
          : "bg-[var(--error-bg)] text-[var(--error)]"
      }`}
    >
      <span
        className={`w-2 h-2 rounded-full ${isOk ? "bg-[var(--success)]" : "bg-[var(--error)]"}`}
      />
      {status}
    </span>
  );
}

export default function DashboardPage() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const loadHealth = async () => {
    try {
      const data = await fetchHealth();
      setHealth(data);
      setError(null);
      setLastUpdate(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connection failed");
      setHealth(null);
    }
  };

  useEffect(() => {
    loadHealth();
    const interval = setInterval(loadHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-full">
      <div className="max-w-2xl mx-auto px-6 py-12 pb-16">
        <header className="mb-14 flex items-center justify-between">
          <div>
            <Link
              href="/"
              className="text-sm text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors mb-3 inline-block"
            >
              ← Back to Dev Checklist
            </Link>
            <h1 className="font-mono text-3xl font-bold text-[var(--foreground)] tracking-tight">
              Health Dashboard
            </h1>
            <p className="text-[var(--foreground)]/60 mt-2 text-sm">
              Service status · auto-refresh every 10s
            </p>
          </div>
          {lastUpdate && (
            <span className="text-xs text-[var(--foreground)]/50 font-mono tabular-nums">
              {lastUpdate.toLocaleTimeString()}
            </span>
          )}
        </header>

        {error && (
          <div className="mb-6 p-6 rounded-[var(--radius)] border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10">
            <p className="text-red-600 dark:text-red-400">{error}</p>
            <button
              onClick={loadHealth}
              className="mt-3 text-sm font-medium text-red-600 hover:underline"
            >
              Retry
            </button>
          </div>
        )}

        {health && (
          <div className="space-y-6">
            <section className="group p-6 rounded-[var(--radius)] border border-[var(--card-border)] bg-[var(--card)] shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] hover:border-[var(--accent)]/20 transition-all duration-200">
              <h2 className="text-xs font-semibold text-[var(--accent)] mb-4 uppercase tracking-widest">
                Core Services
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 first:pt-0">
                  <span className="text-[var(--foreground)] font-medium">Backend API</span>
                  <StatusBadge status={health.status} />
                </div>
                <div className="flex items-center justify-between py-3 border-t border-[var(--card-border)]">
                  <span className="text-[var(--foreground)] font-medium">PostgreSQL</span>
                  <StatusBadge status={health.database} />
                </div>
                <div className="flex items-center justify-between py-3 border-t border-[var(--card-border)]">
                  <span className="text-[var(--foreground)] font-medium">Redis</span>
                  <StatusBadge status={health.redis} />
                </div>
              </div>
            </section>

            <section className="group p-6 rounded-[var(--radius)] border border-[var(--card-border)] bg-[var(--card)] shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] hover:border-[var(--accent)]/20 transition-all duration-200">
              <h2 className="text-xs font-semibold text-[var(--accent)] mb-4 uppercase tracking-widest">
                Admin Tools
              </h2>
              <div className="space-y-4">
                {health.pgadmin_url ? (
                  <div className="flex items-center justify-between py-3 first:pt-0">
                    <span className="text-[var(--foreground)] font-medium">pgAdmin</span>
                    <a
                      href={health.pgadmin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-[var(--radius-sm)] text-sm font-medium text-white bg-[var(--accent)] hover:bg-[var(--accent-hover)] transition-colors"
                    >
                      Open →
                    </a>
                  </div>
                ) : (
                  <div className="flex items-center justify-between py-3 text-[var(--foreground)]/50">
                    <span>pgAdmin</span>
                    <span className="text-xs">Not configured</span>
                  </div>
                )}
                {health.redisinsight_url ? (
                  <div className="flex items-center justify-between py-3 border-t border-[var(--card-border)]">
                    <span className="text-[var(--foreground)] font-medium">RedisInsight</span>
                    <a
                      href={health.redisinsight_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-[var(--radius-sm)] text-sm font-medium text-white bg-[var(--accent)] hover:bg-[var(--accent-hover)] transition-colors"
                    >
                      Open →
                    </a>
                  </div>
                ) : (
                  <div className="flex items-center justify-between py-3 border-t border-[var(--card-border)] text-[var(--foreground)]/50">
                    <span>RedisInsight</span>
                    <span className="text-xs">Not configured</span>
                  </div>
                )}
              </div>
            </section>

            <section className="group p-6 rounded-[var(--radius)] border border-[var(--card-border)] bg-[var(--card)] shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] hover:border-[var(--accent)]/20 transition-all duration-200">
              <h2 className="text-xs font-semibold text-[var(--accent)] mb-4 uppercase tracking-widest">
                API
              </h2>
              <a
                href={`${API_URL}/health`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors"
              >
                Health endpoint
                <span className="text-xs">↗</span>
              </a>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
