"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  createResume,
  deleteResume,
  getResumes,
  Resume,
} from "@/lib/api";
import {
  SAMPLE_RESUME_DATA,
  SAMPLE_RESUME_TITLE,
} from "@/lib/sample-resume";
import { emptyResumeData } from "@/lib/resume-types";
import TemplateRenderer from "@/components/template/TemplateRenderer";
import { ResumeTemplate } from "@/lib/template-types";

export default function ResumeBuilderPage() {
  const router = useRouter();

  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Sample Resume Preview Modal state
  const [showSampleModal, setShowSampleModal] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<ResumeTemplate>("ats");

  // ======================================================
  // LOAD RESUMES
  // ======================================================

  useEffect(() => {
    async function loadResumes() {
      const token = localStorage.getItem("access_token");

      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const data = await getResumes(token);
        setResumes(data);
      } catch (error) {
        console.error("Failed to load resumes:", error);
      } finally {
        setLoading(false);
      }
    }

    loadResumes();
  }, [router]);

  // ======================================================
  // CREATE BLANK RESUME
  // ======================================================

  async function handleCreateResume() {
    const token = localStorage.getItem("access_token");

    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      setCreating(true);
      const newResume = await createResume(token, {
        title: "Untitled Resume",
        content: JSON.stringify(emptyResumeData),
      });

      router.push(`/resume-builder/${newResume.id}`);
    } catch (error) {
      console.error("Failed to create resume:", error);
      alert("Unable to create resume.");
      setCreating(false);
    }
  }

  // ======================================================
  // CREATE RESUME FROM ATS SAMPLE
  // ======================================================

  async function handleCreateFromSample() {
    const token = localStorage.getItem("access_token");

    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      setCreating(true);
      const newResume = await createResume(token, {
        title: SAMPLE_RESUME_TITLE,
        content: JSON.stringify(SAMPLE_RESUME_DATA),
      });

      router.push(`/resume-builder/${newResume.id}`);
    } catch (error) {
      console.error("Failed to create resume from sample:", error);
      alert("Unable to initialize sample resume.");
      setCreating(false);
    }
  }

  // ======================================================
  // DELETE RESUME
  // ======================================================

  async function handleDeleteResume(
    resumeId: number,
    resumeTitle: string
  ) {
    const token = localStorage.getItem("access_token");

    if (!token) {
      router.replace("/login");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${resumeTitle}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(resumeId);

      await deleteResume(token, resumeId);

      // Immediately remove it from the page
      setResumes((currentResumes) =>
        currentResumes.filter(
          (resume) => resume.id !== resumeId
        )
      );
    } catch (error) {
      console.error("Failed to delete resume:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Unable to delete resume."
      );
    } finally {
      setDeletingId(null);
    }
  }

  // ======================================================
  // PAGE
  // ======================================================

  return (
    <main className="min-h-screen bg-[var(--bg-base)] p-6 md:p-12">
      <div className="mx-auto max-w-6xl">
        {/* Back */}
        <button
          onClick={() => router.push("/dashboard")}
          className="mb-8 text-sm text-[var(--text-muted)] transition hover:text-blue-400"
        >
          ← Back to dashboard
        </button>

        {/* Heading */}
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-400 border border-blue-500/20">
                Resumo Workspace
              </span>
              <span className="rounded-md bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
                ✓ 100% ATS Friendly
              </span>
            </div>
            <h1 className="mt-2 text-4xl font-bold tracking-tight text-[var(--text-primary)]">
              Resume Builder
            </h1>
            <p className="mt-2 max-w-2xl text-sm md:text-base text-[var(--text-muted)]">
              Build high-scoring, ATS-compliant resumes with structured templates, instant formatting, and ready-to-use sample data.
            </p>
          </div>
        </div>

        {/* ====================================================== */}
        {/* ATS SAMPLE RESUME HERO BANNER (BEFORE STARTING)         */}
        {/* ====================================================== */}
        <div className="relative mt-8 overflow-hidden rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-950/40 via-[var(--bg-surface)] to-[var(--bg-surface)] p-6 md:p-8 shadow-xl">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300 border border-emerald-500/30">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Featured: Pre-Built ATS Sample Resume
              </div>

              <h2 className="mt-3 text-2xl font-bold text-white">
                Start with a Verified ATS-Friendly Sample Resume
              </h2>

              <p className="mt-2 text-sm leading-relaxed text-zinc-300">
                Not sure how to structure your resume? Before starting from scratch, you can inspect or clone our proven sample resume (Alex Morgan · Senior Engineer). It contains quantifiable achievements, action verbs, and an ATS-optimized skills matrix that you can customize as you want.
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <span className="text-emerald-400">✓</span> 98+ ATS Compatibility Score
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-emerald-400">✓</span> Single-Column Parsable
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-emerald-400">✓</span> Quantified Metrics & Bullets
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-emerald-400">✓</span> Fully Editable
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 min-w-[220px]">
              <button
                onClick={handleCreateFromSample}
                disabled={creating}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50"
              >
                <span>⚡</span>
                {creating ? "Setting up..." : "Use Sample Resume"}
              </button>

              <button
                onClick={() => setShowSampleModal(true)}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800/80 px-5 py-3 text-sm font-medium text-zinc-200 transition hover:bg-zinc-700/80 hover:text-white"
              >
                <span>👁️</span>
                Preview Sample Resume
              </button>
            </div>
          </div>
        </div>

        {/* Quick Action Cards */}
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {/* Create Blank Resume */}
          <button
            onClick={handleCreateResume}
            disabled={creating}
            className="group rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6 text-left transition hover:bg-[var(--bg-muted)] hover:border-blue-500/50"
          >
            <div className="flex items-center justify-between">
              <div className="text-2xl text-blue-500">＋</div>
              <span className="text-xs font-medium text-zinc-500 group-hover:text-zinc-400">
                From scratch
              </span>
            </div>

            <h2 className="mt-4 text-lg font-semibold text-[var(--text-primary)]">
              Create Blank Resume
            </h2>

            <p className="mt-1 text-xs text-[var(--text-muted)] leading-relaxed">
              Start with an empty document and build section by section using Resumo&apos;s structured editor.
            </p>
          </button>

          {/* Upload Resume */}
          <button
            onClick={() => router.push("/ats")}
            className="group rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6 text-left transition hover:bg-[var(--bg-muted)] hover:border-blue-500/50"
          >
            <div className="flex items-center justify-between">
              <div className="text-2xl text-indigo-400">↑</div>
              <span className="text-xs font-medium text-zinc-500 group-hover:text-zinc-400">
                Existing file
              </span>
            </div>

            <h2 className="mt-4 text-lg font-semibold text-[var(--text-primary)]">
              Scan & Optimize with ATS
            </h2>

            <p className="mt-1 text-xs text-[var(--text-muted)] leading-relaxed">
              Upload your existing resume to check its ATS match against job descriptions and keyword gaps.
            </p>
          </button>
        </div>

        {/* My Resumes Section */}
        <div className="mt-12">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">
              My Resumes
            </h2>

            <span className="text-sm text-[var(--text-muted)]">
              {resumes.length} {resumes.length === 1 ? "resume" : "resumes"}
            </span>
          </div>

          {/* Loading */}
          {loading && (
            <div className="mt-4 rounded-2xl border border-dashed border-[var(--border)] p-12 text-center">
              <p className="text-sm text-[var(--text-muted)]">
                Loading resumes...
              </p>
            </div>
          )}

          {/* No Resumes */}
          {!loading && resumes.length === 0 && (
            <div className="mt-4 rounded-2xl border border-dashed border-[var(--border)] p-10 text-center bg-[var(--bg-surface)]">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-500/10 text-2xl text-blue-400">
                📄
              </div>
              <p className="mt-4 text-base font-semibold text-[var(--text-primary)]">
                No resumes created yet
              </p>
              <p className="mx-auto mt-2 max-w-md text-sm text-[var(--text-muted)]">
                Before starting, you can start with our ATS-friendly sample resume and customize it with your own details, or start with a blank one.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <button
                  onClick={handleCreateFromSample}
                  disabled={creating}
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
                >
                  ⚡ Start with Sample Resume
                </button>
                <button
                  onClick={handleCreateResume}
                  disabled={creating}
                  className="rounded-xl border border-zinc-700 bg-zinc-800 px-5 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-700"
                >
                  ＋ Create Blank Resume
                </button>
              </div>
            </div>
          )}

          {/* Resume Cards */}
          {!loading && resumes.length > 0 && (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {resumes.map((resume) => {
                const isSample = resume.title.toLowerCase().includes("sample") || resume.title.toLowerCase().includes("alex morgan");

                return (
                  <div
                    key={resume.id}
                    className="flex flex-col justify-between rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6 transition hover:border-blue-500/50"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs text-[var(--text-muted)]">
                          Resume #{resume.id}
                        </span>
                        {isSample && (
                          <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                            ATS Sample
                          </span>
                        )}
                      </div>

                      <h3 className="mt-2 text-base font-semibold text-[var(--text-primary)] line-clamp-2">
                        {resume.title}
                      </h3>
                    </div>

                    {/* Actions */}
                    <div className="mt-6 flex items-center justify-between gap-4 border-t border-[var(--border)] pt-4">
                      <button
                        onClick={() =>
                          router.push(`/resume-builder/${resume.id}`)
                        }
                        className="text-sm font-medium text-blue-400 transition hover:text-blue-300"
                      >
                        Edit Resume →
                      </button>

                      <button
                        onClick={() =>
                          handleDeleteResume(resume.id, resume.title)
                        }
                        disabled={deletingId === resume.id}
                        className="text-xs text-red-500 transition hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {deletingId === resume.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ====================================================== */}
      {/* SAMPLE RESUME PREVIEW MODAL                            */}
      {/* ====================================================== */}
      {showSampleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="relative flex max-h-[92vh] w-full max-w-5xl flex-col rounded-2xl bg-zinc-900 border border-zinc-700 shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 px-6 py-4 bg-zinc-900/90">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white">
                    ATS-Optimized Sample Resume Preview
                  </h3>
                  <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/30">
                    ⭐ ATS Score 98%
                  </span>
                </div>
                <p className="text-xs text-zinc-400">
                  Alex Morgan · Senior Full Stack Software Engineer (6+ yrs experience)
                </p>
              </div>

              {/* Template switcher inside modal */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400">Template:</span>
                <select
                  value={previewTemplate}
                  onChange={(e) => setPreviewTemplate(e.target.value as ResumeTemplate)}
                  className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs text-white"
                >
                  <option value="ats">ATS Professional (Recommended)</option>
                  <option value="harvard">Harvard (Classic ATS)</option>
                  <option value="modern">Modern</option>
                  <option value="executive">Executive</option>
                  <option value="google">Google</option>
                  <option value="minimal">Minimal</option>
                  <option value="creative">Creative</option>
                  <option value="elegant">Elegant</option>
                  <option value="cloud">Cloud</option>
                </select>

                <button
                  onClick={() => setShowSampleModal(false)}
                  className="ml-2 rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 bg-zinc-950/60 flex justify-center">
              <div className="w-full max-w-[850px] shadow-2xl rounded-lg overflow-hidden bg-white text-zinc-900">
                <TemplateRenderer
                  data={SAMPLE_RESUME_DATA}
                  template={previewTemplate}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-zinc-800 px-6 py-4 bg-zinc-900">
              <p className="text-xs text-zinc-400">
                ✨ Ready to personalize? Click below to clone this sample into your editor.
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowSampleModal(false)}
                  className="rounded-lg border border-zinc-700 px-4 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-800"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowSampleModal(false);
                    handleCreateFromSample();
                  }}
                  disabled={creating}
                  className="rounded-lg bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow hover:bg-blue-500 disabled:opacity-50"
                >
                  {creating ? "Creating..." : "⚡ Use This Sample & Start Editing"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}