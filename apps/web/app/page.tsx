"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Sparkles,
  Shuffle,
  Play,
  FileText,
  Target,
  Briefcase,
  ArrowRight,
  X,
} from "lucide-react";

interface HeroThumbnail {
  id: number;
  image: string;
  title: string;
  badge: string;
  description: string;
  accentGlow: string;
  accentColor: string;
}

const HERO_THUMBNAILS: HeroThumbnail[] = [
  {
    id: 1,
    image: "/thumbnails/hero-banner-1.jpg",
    title: "Build a Stronger Resume for Every Opportunity",
    badge: "AI Career Engineering Suite",
    description:
      "AI-powered resume optimization, ATS diagnostics, cover letters, application tracking and mock interviews — all in one unified workspace.",
    accentGlow: "rgba(99, 102, 241, 0.35)",
    accentColor: "#6366f1",
  },
  {
    id: 2,
    image: "/thumbnails/hero-banner-2.jpg",
    title: "From Resume to Opportunities",
    badge: "Proven ATS Optimization",
    description:
      "Create standout resumes, track applications, prepare for interviews and get job-ready with AI.",
    accentGlow: "rgba(14, 165, 233, 0.35)",
    accentColor: "#0ea5e9",
  },
  {
    id: 3,
    image: "/thumbnails/hero-banner-3.jpg",
    title: "Smarter Tools for a Brighter Career",
    badge: "One Suite for Your Career Growth",
    description:
      "Leverage AI to create tailored resumes, crack ATS filters, write impactful cover letters, track applications and practice interviews.",
    accentGlow: "rgba(168, 85, 247, 0.35)",
    accentColor: "#a855f7",
  },
  {
    id: 4,
    image: "/thumbnails/hero-banner-4.jpg",
    title: "Create. Apply. Track. Succeed.",
    badge: "100% ATS-Compliant Career Toolkit",
    description:
      "Your complete AI career companion from resume building to interview preparation with quantifiable metrics.",
    accentGlow: "rgba(59, 130, 246, 0.35)",
    accentColor: "#3b82f6",
  },
];

const STORAGE_KEY = "resumo_last_hero_thumb";

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const lastIndex = stored !== null ? parseInt(stored, 10) : -1;

      // Filter candidates to strictly exclude the last shown thumbnail
      const candidates = [0, 1, 2, 3].filter((i) => i !== lastIndex);
      const nextIndex =
        candidates[Math.floor(Math.random() * candidates.length)] ?? 0;

      localStorage.setItem(STORAGE_KEY, nextIndex.toString());
      setCurrentIndex(nextIndex);
    } catch {
      setCurrentIndex(Math.floor(Math.random() * 4));
    }
  }, []);

  function handleShuffle() {
    const candidates = [0, 1, 2, 3].filter((i) => i !== currentIndex);
    const next = candidates[Math.floor(Math.random() * candidates.length)] ?? 0;
    setCurrentIndex(next);
    try {
      localStorage.setItem(STORAGE_KEY, next.toString());
    } catch {}
  }

  function handleSelect(index: number) {
    setCurrentIndex(index);
    try {
      localStorage.setItem(STORAGE_KEY, index.toString());
    } catch {}
  }

  const activeThumb = HERO_THUMBNAILS[currentIndex] || HERO_THUMBNAILS[0];

  return (
    <main className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] px-4 py-6 sm:px-8 md:px-12 relative overflow-hidden transition-colors">
      {/* Dynamic Background Radial Glow tied to active thumbnail */}
      <div
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-[600px] w-[1000px] rounded-full blur-[160px] opacity-60 transition-all duration-700"
        style={{
          background: `radial-gradient(circle, ${activeThumb.accentGlow} 0%, rgba(0,0,0,0) 70%)`,
        }}
      />

      {/* ── Navbar ── */}
      <nav className="relative mx-auto max-w-7xl flex items-center justify-between pb-8 border-b border-[var(--border)]">
        <div className="flex items-center gap-3">
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
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
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
            className="btn-indigo-glow rounded-xl px-4 py-2 text-xs font-semibold text-white transition flex items-center gap-1.5"
          >
            <span>Get Started</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </nav>

      {/* ── Main Hero Section ── */}
      <section className="relative mx-auto max-w-7xl pt-8 pb-16 flex flex-col items-center">
        {/* Dynamic Rotation Badge & Switcher */}
        <div className="mb-6 flex flex-wrap items-center justify-center gap-2.5">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg-surface)]/90 backdrop-blur-md px-3.5 py-1.5 text-xs font-medium shadow-sm">
            <span
              className="h-2 w-2 rounded-full animate-pulse"
              style={{ backgroundColor: activeThumb.accentColor }}
            />
            <span className="text-[var(--text-secondary)]">
              {activeThumb.badge}
            </span>
            <span className="text-[var(--text-muted)]">·</span>
            <span className="text-[var(--text-muted)] text-[11px]">
              Thumbnail {currentIndex + 1} of 4 (Randomized on visit)
            </span>
          </div>

          {/* Interactive Thumbnails Selector / Shuffle Button */}
          <div className="flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--bg-surface)]/90 backdrop-blur-md p-1 shadow-sm">
            {HERO_THUMBNAILS.map((thumb, idx) => (
              <button
                key={thumb.id}
                type="button"
                onClick={() => handleSelect(idx)}
                title={`Switch to Thumbnail ${thumb.id}: ${thumb.title}`}
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition cursor-pointer ${
                  currentIndex === idx
                    ? "bg-[var(--text-primary)] text-[var(--bg-base)] shadow-sm scale-105"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-muted)]"
                }`}
              >
                {thumb.id}
              </button>
            ))}

            <button
              type="button"
              onClick={handleShuffle}
              title="Shuffle to another random thumbnail"
              className="flex items-center gap-1 rounded-full px-2 py-0.5 text-xs text-[var(--text-muted)] hover:text-indigo-400 hover:bg-indigo-500/10 transition cursor-pointer"
            >
              <Shuffle className="h-3 w-3" />
              <span className="text-[11px] font-semibold">Shuffle</span>
            </button>
          </div>
        </div>

        {/* ── Hero Thumbnail Showcase ── */}
        <div className="relative w-full max-w-5xl group">
          {/* Ambient Glow Frame */}
          <div
            className="absolute -inset-1.5 rounded-3xl opacity-70 blur-xl transition-all duration-700 group-hover:opacity-100"
            style={{
              background: `linear-gradient(135deg, ${activeThumb.accentColor} 0%, rgba(99,102,241,0.2) 50%, rgba(0,0,0,0) 100%)`,
            }}
          />

          {/* Image Container Card */}
          <div className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] shadow-2xl transition-all duration-300">
            {/* Aspect Ratio 2:1 Hero Image */}
            <div className="relative w-full aspect-[2/1] overflow-hidden bg-zinc-950">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeThumb.image}
                alt={activeThumb.title}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.015]"
                loading="eager"
              />

              {/* Subtle top glare overlay */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-white/5" />
            </div>

            {/* Quick interactive action strip below thumbnail */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 sm:p-5 border-t border-[var(--border)] bg-[var(--bg-surface)]/95 backdrop-blur-md">
              <div className="text-left">
                <p className="text-xs uppercase tracking-wider font-bold text-indigo-400">
                  {activeThumb.badge}
                </p>
                <h2 className="text-sm sm:text-base font-bold text-[var(--text-primary)] mt-0.5">
                  {activeThumb.title}
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowDemoModal(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--bg-muted)] hover:bg-[var(--bg-surface-elevated)] px-4 py-2.5 text-xs font-semibold text-[var(--text-primary)] transition shadow-sm cursor-pointer"
                >
                  <Play className="h-3.5 w-3.5 text-indigo-400 fill-indigo-400" />
                  <span>Watch Demo Tour</span>
                </button>

                <Link
                  href="/register"
                  className="btn-indigo-glow inline-flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-xs font-bold text-white transition shadow-sm hover:scale-105"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>

                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 px-4 py-2.5 text-xs font-semibold text-indigo-300 transition shadow-sm"
                >
                  <span>Open Dashboard →</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ── Feature Highlights Grid ── */}
        <div className="mt-16 w-full max-w-5xl">
          <div className="text-center mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              One Unified AI Platform
            </span>
            <h3 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] mt-1">
              Everything you need to crack applications and interviews
            </h3>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "AI Resume Builder",
                desc: "100% parsable ATS templates, live score audits & 1-click profile autofill.",
                icon: FileText,
                href: "/resume-builder",
                tag: "ATS 98%+",
              },
              {
                title: "ATS Score Checker",
                desc: "Scan resumes against real job descriptions to identify missing keywords.",
                icon: Target,
                href: "/ats",
                tag: "Precision Match",
              },
              {
                title: "Cover Letter Generator",
                desc: "Tailored, high-impact letters generated in seconds for any target role.",
                icon: Sparkles,
                href: "/cover-letter",
                tag: "AI Powered",
              },
              {
                title: "Job Applications Kanban",
                desc: "Track status across Applied, Interview, Offer, and Rejected in one hub.",
                icon: Briefcase,
                href: "/applications",
                tag: "Pipeline Tracker",
              },
            ].map((card) => {
              const Icon = card.icon;
              return (
                <Link
                  key={card.title}
                  href={card.href}
                  className="group rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 text-left transition hover:border-indigo-500/40 hover:bg-[var(--bg-surface-elevated)] shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:scale-110 transition">
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-full">
                        {card.tag}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-[var(--text-primary)] group-hover:text-indigo-400 transition">
                      {card.title}
                    </h4>
                    <p className="text-xs text-[var(--text-muted)] mt-1.5 leading-relaxed">
                      {card.desc}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-indigo-400 group-hover:translate-x-1 transition">
                    <span>Explore</span>
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Quick Demo Modal ── */}
      {showDemoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-2xl rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6 shadow-2xl">
            <button
              onClick={() => setShowDemoModal(false)}
              className="absolute top-4 right-4 rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-muted)] hover:text-[var(--text-primary)] transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <span className="rounded-full bg-indigo-500/10 border border-indigo-500/30 px-2.5 py-0.5 text-xs font-semibold text-indigo-400">
                Resumo Suite Overview
              </span>
            </div>

            <h3 className="text-xl font-bold">Interactive Platform Walkthrough</h3>
            <p className="text-xs text-[var(--text-muted)] mt-1 mb-5">
              Get an instant preview of the core tools included in Resumo.
            </p>

            <div className="space-y-3">
              {[
                {
                  title: "1. Build Your Verified ATS Resume",
                  detail: "Use 9+ proven ATS templates (Harvard, Modern, Executive). Autofill personal details directly from your Candidate Profile.",
                },
                {
                  title: "2. Scan Against Any Job Description",
                  detail: "Instant compatibility score (0-100%), matching keyword breakdown, skills density, and actionable improvement steps.",
                },
                {
                  title: "3. Direct Career Portals & Job Search",
                  detail: "Apply directly to verified official job postings with 1-click application tracking.",
                },
                {
                  title: "4. STAR Method AI Mock Interviews",
                  detail: "Practice real interview questions with instant voice/text AI coaching and scoring.",
                },
              ].map((step, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-[var(--border)] bg-[var(--bg-muted)] p-3 text-xs"
                >
                  <p className="font-bold text-[var(--text-primary)]">{step.title}</p>
                  <p className="text-[var(--text-secondary)] mt-0.5">{step.detail}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-[var(--border)]">
              <button
                type="button"
                onClick={() => setShowDemoModal(false)}
                className="rounded-xl border border-[var(--border)] px-4 py-2 text-xs font-medium text-[var(--text-muted)] hover:bg-[var(--bg-muted)] transition cursor-pointer"
              >
                Close Preview
              </button>
              <Link
                href="/dashboard"
                className="btn-indigo-glow rounded-xl px-5 py-2 text-xs font-bold text-white transition cursor-pointer"
              >
                Open Workspace Dashboard →
              </Link>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
