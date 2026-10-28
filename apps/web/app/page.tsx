import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] p-8 md:p-16 relative overflow-hidden">
      {/* Background image: light/dark variants */}
      <div className="pointer-events-none fixed inset-0 h-screen w-screen bg-cover bg-center bg-no-repeat bg-[url('/bg-light.svg')] dark:bg-[url('/bg-dark.svg')]" />
      {/* Light overlay keeps text readable */}
      <div className="pointer-events-none fixed inset-0 bg-white/20 dark:bg-black/20" />

      {/* Background Radial Glow */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-[550px] w-[900px] rounded-full bg-indigo-600/15 blur-[140px]" />

      <nav className="relative mx-auto max-w-6xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.svg"
            alt="Resumo logo"
            className="h-10 w-10 rounded-xl object-contain"
          />
          <div>
            <b className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
              Resumo
            </b>
            <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">
              Craft Better. Apply Smarter.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/about"
            className="px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
          >
            About
          </Link>
          <Link
            href="/login"
            className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-2 text-xs font-semibold text-[var(--text-primary)] transition hover:border-indigo-500/40 hover:bg-[var(--bg-surface-elevated)]"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="btn-indigo-glow rounded-xl px-4 py-2 text-xs font-semibold text-white transition"
          >
            Get Started →
          </Link>
        </div>
      </nav>

      <section className="relative mx-auto max-w-4xl py-24 sm:py-32 text-center flex flex-col items-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold text-indigo-400 backdrop-blur-md">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
          Next-Gen AI Career Engineering Suite
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight sm:leading-tight text-[var(--text-primary)]">
          Build a stronger resume for every single opportunity.
        </h1>

        <p className="mt-6 text-base sm:text-lg text-[var(--text-secondary)] max-w-2xl leading-relaxed">
          AI resume optimization, precision ATS diagnostics, tailored cover letters, application tracking, and interactive mock interviews in one unified workspace.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href="/dashboard"
            className="btn-indigo-glow inline-flex items-center gap-2 rounded-2xl px-8 py-4 font-bold text-sm text-white transition hover:scale-105"
          >
            Open Workspace Dashboard →
          </Link>
          <Link
            href="/register"
            className="card-glow inline-flex items-center rounded-2xl px-8 py-4 font-semibold text-sm text-[var(--text-primary)] transition hover:border-indigo-500/50"
          >
            Create Free Account
          </Link>
        </div>

        {/* Feature badges */}
        <div className="mt-16 flex flex-wrap justify-center gap-2.5 max-w-3xl">
          {[
            "Resume Builder",
            "ATS Score Evaluation",
            "AI Keyword Optimization",
            "Job Description Analyzer",
            "Cover Letter Generator",
            "Job Search Board",
            "Applications Kanban",
            "STAR Mock Interview",
          ].map((f) => (
            <span
              key={f}
              className="rounded-full border border-[var(--border)] bg-[var(--bg-surface)]/80 px-3.5 py-1.5 text-xs font-medium text-[var(--text-secondary)] shadow-sm"
            >
              {f}
            </span>
          ))}
        </div>

      </section>
    </main>
  );
}
