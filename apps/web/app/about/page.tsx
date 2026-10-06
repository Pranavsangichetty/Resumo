import Link from "next/link";

const FEATURES = [
  {
    icon: "📄",
    title: "Resume Builder",
    description:
      "Create professional, ATS-friendly resumes with multiple templates. Upload an existing resume or build from scratch with guided sections.",
  },
  {
    icon: "⚡",
    title: "ATS Evaluation",
    description:
      "Scan your resume against any job description to get a compatibility score, keyword analysis, and actionable suggestions.",
  },
  {
    icon: "✦",
    title: "AI Optimizer",
    description:
      "Automatically enhance your resume content using AI to match target job descriptions while keeping your experience authentic.",
  },
  {
    icon: "✉",
    title: "Cover Letter Generator",
    description:
      "Generate tailored cover letters based on your resume and the specific job you're applying for.",
  },
  {
    icon: "💼",
    title: "Job Search",
    description:
      "Browse and discover job openings directly within Resumo. Find opportunities that match your skills and experience.",
  },
  {
    icon: "📊",
    title: "Application Tracker",
    description:
      "Keep all your job applications organized in one place. Track status, add notes, and monitor your pipeline.",
  },
  {
    icon: "🎙",
    title: "Mock Interview",
    description:
      "Practice with AI-powered mock interviews tailored to your target role. Get feedback on your answers in real time.",
  },
  {
    icon: "📈",
    title: "Analytics",
    description:
      "Gain insights into your job search with analytics on applications, interview success rates, and resume performance.",
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] relative overflow-hidden">
      {/* Background Glow */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-[550px] w-[900px] rounded-full bg-indigo-600/15 blur-[140px]" />

      {/* Nav */}
      <nav className="relative mx-auto max-w-6xl flex items-center justify-between p-8 md:px-16">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-extrabold text-xl shadow-[0_0_15px_rgba(99,102,241,0.25)]">
            R
          </div>
          <div>
            <b className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
              Resumo
            </b>
            <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">
              Craft Better. Apply Smarter.
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-3">
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

      {/* Hero */}
      <section className="relative mx-auto max-w-4xl px-8 pt-12 pb-16 text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight text-[var(--text-primary)]">
          About Resumo
        </h1>
        <p className="mt-6 text-base sm:text-lg text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
          Resumo is an AI-powered career engineering platform that helps job seekers build stronger resumes, ace interviews, and land their dream roles — all from one unified workspace.
        </p>
        <p className="mt-4 text-sm sm:text-base text-[var(--text-muted)] max-w-2xl mx-auto leading-relaxed">
          From intelligent resume tailoring to real-time mock interview simulations and organized pipeline tracking, Resumo bridges the gap between ambitious talent and today’s competitive hiring standards. We empower you to showcase your true potential with confidence and clarity.
        </p>
      </section>

      {/* Mission */}
      <section className="relative mx-auto max-w-4xl px-8 pb-16">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-8 md:p-10 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-lg">
              🎯
            </div>
            <h2 className="text-xl font-semibold">Our Mission</h2>
          </div>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            Job searching shouldn't feel like guesswork. We built Resumo to give every job seeker access to the same AI-powered tools that top career coaches use — resume optimization, ATS analysis, interview preparation, and application management — in a single, free platform. Whether you're a fresh graduate or a seasoned professional pivoting careers, Resumo helps you put your best foot forward with every application.
          </p>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            By translating modern Applicant Tracking System (ATS) algorithms and recruitment insights into actionable advice, we ensure your accomplishments never get lost in automated filters. Our goal is to make career advancement transparent, accessible, and stress-free for everyone.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="relative mx-auto max-w-5xl px-8 pb-16">
        <h2 className="text-2xl font-bold text-center mb-10">
          Everything you need to land your next role
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 transition hover:border-indigo-500/30"
            >
              <span className="text-2xl">{f.icon}</span>
              <h3 className="mt-3 text-sm font-semibold text-[var(--text-primary)]">
                {f.title}
              </h3>
              <p className="mt-1.5 text-xs text-[var(--text-muted)] leading-relaxed">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="relative mx-auto max-w-4xl px-8 pb-16">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-8 md:p-10">
          <h2 className="text-xl font-semibold mb-6 text-center">How It Works</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                step: "1",
                title: "Create your resume",
                desc: "Build or upload your resume. Choose from professional templates designed to pass ATS systems.",
              },
              {
                step: "2",
                title: "Optimize with AI",
                desc: "Paste a job description, run ATS evaluation, and let AI enhance your resume for maximum impact.",
              },
              {
                step: "3",
                title: "Apply & track",
                desc: "Generate cover letters, track applications, and prepare for interviews — all in one workspace.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/15 text-indigo-400 font-bold text-lg mb-3">
                  {item.step}
                </div>
                <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1.5">
                  {item.title}
                </h3>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative mx-auto max-w-4xl px-8 pb-20 text-center">
        <h2 className="text-2xl font-bold mb-3">Ready to level up your job search?</h2>
        <p className="text-sm text-[var(--text-muted)] mb-8">
          Join Resumo for free and start building smarter applications today.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/register"
            className="btn-indigo-glow inline-flex items-center gap-2 rounded-2xl px-8 py-4 font-bold text-sm text-white transition hover:scale-105"
          >
            Create Free Account →
          </Link>
          <Link
            href="/"
            className="card-glow inline-flex items-center rounded-2xl px-8 py-4 font-semibold text-sm text-[var(--text-primary)] transition hover:border-indigo-500/50"
          >
            Back to Home
          </Link>
        </div>
      </section>
    </main>
  );
}
