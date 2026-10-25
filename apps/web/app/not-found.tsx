"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-md w-full text-center">
        <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-extrabold text-2xl mb-4">
          404
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Page Not Found</h1>
        <p className="text-sm text-[var(--text-muted)] mt-2">
          The page you are looking for doesn&apos;t exist, has been removed, or is private.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/dashboard"
            className="rounded-xl bg-[var(--accent)] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[var(--accent-hover)] transition shadow-sm"
          >
            ← Return to Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
