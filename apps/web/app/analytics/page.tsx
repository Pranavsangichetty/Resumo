"use client";

import { useRouter } from "next/navigation";

export default function AnalyticsPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[var(--bg-base)] p-8 md:p-12 text-[var(--text-primary)]">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-6 mb-8">
          <div>
            <button
              onClick={() => router.push("/dashboard")}
              className="text-sm text-[var(--text-muted)] hover:text-blue-400 transition mb-2"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold">Performance Analytics</h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              Visualize your resume ATS strength, keyword coverage, and application pipeline.
            </p>
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5">
            <p className="text-xs text-[var(--text-muted)]">Average ATS Score</p>
            <p className="text-3xl font-extrabold text-blue-400 mt-2">86%</p>
            <p className="text-xs text-emerald-400 mt-1">↑ +14% since optimization</p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5">
            <p className="text-xs text-[var(--text-muted)]">Active Applications</p>
            <p className="text-3xl font-extrabold text-[var(--text-primary)] mt-2">12</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">Across 8 companies</p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5">
            <p className="text-xs text-[var(--text-muted)]">Interview Conversion</p>
            <p className="text-3xl font-extrabold text-emerald-400 mt-2">33%</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">4 interviews booked</p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5">
            <p className="text-xs text-[var(--text-muted)]">Top Matched Skill</p>
            <p className="text-2xl font-bold text-blue-400 mt-2">TypeScript</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">98% match density</p>
          </div>
        </div>

        {/* Breakdown Charts */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6">
            <h3 className="text-base font-semibold mb-4">ATS Compatibility Breakdown</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Keyword Matching</span>
                  <span className="font-semibold text-blue-400">92%</span>
                </div>
                <div className="h-2 rounded-full bg-[var(--bg-muted)] overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full w-[92%]" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Formatting & Structure</span>
                  <span className="font-semibold text-emerald-400">95%</span>
                </div>
                <div className="h-2 rounded-full bg-[var(--bg-muted)] overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full w-[95%]" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Action Verbs & Impact</span>
                  <span className="font-semibold text-blue-400">84%</span>
                </div>
                <div className="h-2 rounded-full bg-[var(--bg-muted)] overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full w-[84%]" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Contact & Social Links</span>
                  <span className="font-semibold text-emerald-400">100%</span>
                </div>
                <div className="h-2 rounded-full bg-[var(--bg-muted)] overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full w-[100%]" />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6">
            <h3 className="text-base font-semibold mb-4">Top Tech Keyword Density</h3>
            <div className="flex flex-wrap gap-2.5">
              {[
                { name: "React", count: "14x" },
                { name: "TypeScript", count: "12x" },
                { name: "FastAPI", count: "9x" },
                { name: "Next.js", count: "9x" },
                { name: "PostgreSQL", count: "8x" },
                { name: "Docker", count: "7x" },
                { name: "REST APIs", count: "6x" },
                { name: "Tailwind CSS", count: "6x" },
                { name: "AWS", count: "5x" },
                { name: "CI/CD", count: "5x" },
              ].map((k, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-[var(--border)] bg-[var(--bg-muted)] px-3.5 py-2 flex items-center gap-2"
                >
                  <span className="text-sm font-medium">{k.name}</span>
                  <span className="rounded bg-blue-500/20 px-1.5 py-0.5 text-xs font-bold text-blue-400">
                    {k.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
