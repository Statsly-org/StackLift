import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-[var(--card-border)] bg-[var(--card)]/80 backdrop-blur-sm py-6 shadow-[0_-4px_12px_-2px_rgba(0,0,0,0.05)] dark:shadow-[0_-4px_12px_-2px_rgba(0,0,0,0.3)]">
      <div className="max-w-2xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[var(--foreground)]/60">
        <span>
          StackLift by{" "}
          <a
            href="https://statsly.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors"
          >
            Statix
          </a>
        </span>
        <nav className="flex gap-6">
          <Link href="/" className="hover:text-[var(--foreground)] transition-colors">
            Dev Checklist
          </Link>
          <Link href="/dashboard" className="hover:text-[var(--foreground)] transition-colors">
            Health Dashboard
          </Link>
        </nav>
      </div>
    </footer>
  );
}
