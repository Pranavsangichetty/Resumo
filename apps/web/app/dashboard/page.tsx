"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import ExistingResumeUpload from "@/components/resume-editor/ExistingResumeUpload";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000";

interface ModuleItem {
  name: string;
  desc: string;
  action: string;
  route: string;
  icon: string;
  badge?: string;
}

const MODULES: ModuleItem[] = [
  {
    name: "Resume Builder",
    desc: "Create and edit formatted resumes with custom templates and section order",
    action: "Open Resume Builder →",
    route: "/resume-builder",
    icon: "📄",
    badge: "Core",
  },
  {
    name: "Job Description",
    desc: "Deconstruct requirements, extract keywords, and test resume compatibility",
    action: "Analyze Job Description →",
    route: "/job-description",
    icon: "🎯",
    badge: "Active",
  },
  {
    name: "ATS Evaluation",
    desc: "Score your resume against any target job description with full breakdown",
    action: "Evaluate Resume →",
    route: "/ats",
    icon: "⚡",
    badge: "Scanner",
  },
  {
    name: "Optimization Loop",
    desc: "AI content tailoring, bullet polishing, and automated keyword injection",
    action: "AI Optimizer →",
    route: "/ats",
    icon: "✨",
    badge: "AI Powered",
  },
  {
    name: "Cover Letter",
    desc: "Generate personalized, tone-calibrated cover letters in seconds",
    action: "Generate Cover Letter →",
    route: "/cover-letter",
    icon: "✉️",
    badge: "Active",
  },
  {
    name: "Job Search",
    desc: "Find matching tech opportunities scored in real-time against your skills",
    action: "Search Jobs →",
    route: "/job-search",
    icon: "💼",
    badge: "Active",
  },
  {
    name: "Applications",
    desc: "Kanban board to track submissions, interview stages, and job offers",
    action: "Open Tracker →",
    route: "/applications",
    icon: "📊",
    badge: "Tracker",
  },
  {
    name: "Mock Interview",
    desc: "AI-driven technical and STAR behavioral interview simulator",
    action: "Practice Questions →",
    route: "/mock-interview",
    icon: "🎙️",
    badge: "AI Simulator",
  },
  {
    name: "Analytics",
    desc: "ATS score distributions, keyword density, and interview funnel stats",
    action: "View Analytics →",
    route: "/analytics",
    icon: "📈",
    badge: "Active",
  },
  // {
  //   name: "Settings",
  //   desc: "Manage profile, credentials, notifications, and AI scoring preferences",
  //   action: "Open Settings →",
  //   route: "/settings",
  //   icon: "⚙️",
  //   badge: "Config",
  // },
];

interface User {
  id: number;
  name?: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

export default function Dashboard() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem("access_token");

      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/v1/auth/me`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          localStorage.removeItem("access_token");
          router.replace("/login");
          return;
        }

        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.error("Failed to load user:", error);
        localStorage.removeItem("access_token");
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, [router]);

  function handleLogout() {
    localStorage.removeItem("access_token");
    router.replace("/login");
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--bg-base)]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500/20 border-t-indigo-500" />
          <p className="text-sm text-[var(--text-muted)]">Loading your workspace...</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] p-6 md:p-12 relative overflow-hidden">
      {/* Subtle Background Glow Radial Accent */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-indigo-600/10 blur-[120px]" />

      <div className="relative mx-auto max-w-6xl space-y-10">
        {/* ==================================================
            HEADER
        ================================================== */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-[var(--border)] pb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-xs uppercase font-semibold tracking-wider text-indigo-400">
                Craft Better. Apply Smarter.
              </p>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-primary)]">
              Welcome to Resumo
            </h1>

            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Signed in as <span className="text-[var(--accent-light)] font-medium">{user.name ? `${user.name} (${user.email})` : user.email}</span>
            </p>
          </div>
        </div>

        {/* ==================================================
            DASHBOARD STATS / MOTIVATION
        ================================================== */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="card-glow rounded-2xl p-6">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-2">
              <span>💡</span>
              <span>Motivation</span>
            </div>
            <p className="text-lg font-medium text-[var(--text-primary)]">
              &ldquo;Progress starts with one better version.&rdquo;
            </p>
          </div>

          <div className="card-glow rounded-2xl p-6">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-2">
              <span>🚀</span>
              <span>Career Tip</span>
            </div>
            <p className="text-base text-[var(--text-secondary)]">
              Use measurable metrics and strong action verbs rather than generic responsibilities.
            </p>
          </div>
        </div>

        {/* ==================================================
            RESUME WORKSPACE
        ================================================== */}
        <section>
          <div className="mb-4">
            <h2 className="text-xl font-bold text-[var(--text-primary)]">Resume Workspace</h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Create a new resume or continue optimizing an existing one.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {/* Create New Resume Button */}
            <button
              type="button"
              onClick={() => router.push("/resume-builder")}
              className="card-glow rounded-2xl p-4 text-left group cursor-pointer flex flex-col justify-between min-h-[100px]"
            >
              <div>
                <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-base font-bold group-hover:bg-indigo-500 group-hover:text-white transition">
                  ＋
                </div>

                <h3 className="mt-3 text-base font-bold text-[var(--text-primary)] group-hover:text-indigo-400 transition">
                  Create New Resume
                </h3>

                <p className="mt-1 text-[11px] text-[var(--text-secondary)] leading-relaxed">
                  Start fresh with structured sections and clean modern typography.
                </p>
              </div>

              <p className="mt-3 text-[11px] font-bold text-indigo-400 group-hover:translate-x-1 transition inline-flex items-center gap-1">
                Open Resume Builder →
              </p>
            </button>

            {/* Upload Existing Resume */}
            <ExistingResumeUpload />
          </div>
        </section>

        {/* ==================================================
            PROJECT MODULES GRID
        ================================================== */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold text-[var(--text-primary)]">Project Modules</h2>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Full-suite career acceleration and resume engineering tools.
              </p>
            </div>
            <span className="text-[11px] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/30 px-3 py-1 rounded-full">
              9 Modules Active
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {MODULES.map((item) => (
              <button
                key={item.name}
                type="button"
                onClick={() => router.push(item.route)}
                className="card-glow rounded-2xl p-5 text-left group cursor-pointer flex flex-col justify-between min-h-[180px]"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-2xl">{item.icon}</span>
                    {item.badge && (
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {item.badge}
                      </span>
                    )}
                  </div>

                  <b className="text-[var(--text-primary)] text-base font-bold group-hover:text-indigo-400 transition block">
                    {item.name}
                  </b>

                  <p className="mt-2 text-xs text-[var(--text-secondary)] leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <p className="mt-5 text-xs font-bold text-indigo-400 group-hover:translate-x-1 transition inline-flex items-center gap-1">
                  {item.action}
                </p>
              </button>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}