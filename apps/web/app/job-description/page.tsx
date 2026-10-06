"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface ResumeSummary {
  id: number;
  title: string;
}

interface AnalysisResult {
  role_detected: string;
  seniority_level: string;
  key_responsibilities: string[];
  required_skills: string[];
  preferred_skills: string[];
  top_keywords: string[];
  suggested_action_verbs: string[];
  resume_match_score?: number;
  matched_skills: string[];
  missing_skills: string[];
}

export default function JobDescriptionPage() {
  const router = useRouter();

  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [resumes, setResumes] = useState<ResumeSummary[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<number | undefined>(undefined);

  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    async function loadResumes() {
      const token = localStorage.getItem("access_token");
      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const res = await fetch(`${API_URL}/api/v1/resumes`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const list = await res.json();
          setResumes(list);
          if (list.length > 0) {
            setSelectedResumeId(list[0].id);
          }
        }
      } catch (err) {
        console.error("Error loading resumes:", err);
      }
    }

    loadResumes();
  }, [router]);

  async function handleAnalyze(e: React.FormEvent) {
    e.preventDefault();
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.replace("/login");
      return;
    }

    if (jobDescription.trim().length < 30) {
      setError("Please paste a job description with at least 30 characters.");
      return;
    }

    setAnalyzing(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/api/v1/job-description/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          job_title: jobTitle || undefined,
          company: company || undefined,
          job_description: jobDescription,
          resume_id: selectedResumeId || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Analysis failed.");
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || "Failed to analyze job description.");
    } finally {
      setAnalyzing(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-[var(--border)] bg-[var(--bg-muted)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

  return (
    <main className="min-h-screen bg-[var(--bg-base)] p-8 md:p-12 text-[var(--text-primary)]">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border)] pb-6 mb-8">
          <div>
            <button
              onClick={() => router.push("/dashboard")}
              className="text-sm text-[var(--text-muted)] hover:text-blue-400 transition mb-2"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold">Job Description Analyzer</h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              Deconstruct job requirements, extract required skillsets & keywords, and evaluate your match readiness.
            </p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-12">
          {/* Input Form Column */}
          <div className="lg:col-span-5 space-y-6">
            <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6">
              <h2 className="text-lg font-semibold mb-4">Job Details</h2>

              <form onSubmit={handleAnalyze} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
                    Job Title (optional)
                  </label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g. Senior Full Stack Engineer"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
                    Company Name (optional)
                  </label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Stripe, Google, Acme Corp"
                    className={inputClass}
                  />
                </div>

                {resumes.length > 0 && (
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
                      Compare Against Resume
                    </label>
                    <select
                      value={selectedResumeId}
                      onChange={(e) => setSelectedResumeId(Number(e.target.value))}
                      className={inputClass}
                    >
                      {resumes.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
                    Job Description Text <span className="text-blue-400">*</span>
                  </label>
                  <textarea
                    rows={10}
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    required
                    placeholder="Paste the full job description, qualifications, and responsibilities here..."
                    className={`${inputClass} resize-y font-sans leading-relaxed`}
                  />
                </div>

                {error && (
                  <div className="rounded-lg p-3 text-xs border border-red-500/30 bg-red-500/10 text-red-400">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={analyzing}
                  className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
                >
                  {analyzing ? "Analyzing Requirements..." : "Analyze Job Description →"}
                </button>
              </form>
            </section>
          </div>

          {/* Analysis Results Column */}
          <div className="lg:col-span-7">
            {!result ? (
              <div className="flex h-full min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border)] bg-[var(--bg-surface)] p-8 text-center">
                <div className="rounded-full bg-blue-600/10 p-4 text-3xl text-blue-400 mb-3">
                  🔍
                </div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                  Ready to analyze
                </h3>
                <p className="max-w-sm text-sm text-[var(--text-muted)] mt-1">
                  Paste a job description on the left to uncover core requirements, extract keywords, and test your resume compatibility.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Score & Role overview */}
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <span className="inline-block rounded-full bg-blue-500/10 border border-blue-500/20 px-3 py-1 text-xs font-medium text-blue-400 mb-2">
                        {result.seniority_level} Level
                      </span>
                      <h2 className="text-2xl font-bold">{result.role_detected}</h2>
                    </div>

                    {result.resume_match_score !== null && result.resume_match_score !== undefined && (
                      <div className="text-right">
                        <div className="text-3xl font-extrabold text-blue-400">
                          {result.resume_match_score}%
                        </div>
                        <p className="text-xs text-[var(--text-muted)]">Skill Match Rate</p>
                      </div>
                    )}
                  </div>

                  {result.resume_match_score !== null && result.resume_match_score !== undefined && (
                    <div className="mt-4 w-full bg-[var(--bg-muted)] h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          result.resume_match_score >= 80
                            ? "bg-emerald-500"
                            : result.resume_match_score >= 50
                            ? "bg-blue-500"
                            : "bg-amber-500"
                        }`}
                        style={{ width: `${result.resume_match_score}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* Skills breakdown */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5">
                    <h3 className="text-sm font-semibold text-emerald-400 mb-3 flex items-center gap-2">
                      <span>✓</span> Matched Skills ({result.matched_skills.length})
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {result.matched_skills.length > 0 ? (
                        result.matched_skills.map((s, i) => (
                          <span
                            key={i}
                            className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-xs text-emerald-400 font-medium"
                          >
                            {s}
                          </span>
                        ))
                      ) : (
                        <p className="text-xs text-[var(--text-muted)]">
                          Select a resume with matching skills to view matches.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5">
                    <h3 className="text-sm font-semibold text-amber-400 mb-3 flex items-center gap-2">
                      <span>＋</span> Missing Skills ({result.missing_skills.length})
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {result.missing_skills.length > 0 ? (
                        result.missing_skills.map((s, i) => (
                          <span
                            key={i}
                            className="rounded-lg bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 text-xs text-amber-400 font-medium"
                          >
                            {s}
                          </span>
                        ))
                      ) : (
                        <p className="text-xs text-[var(--text-muted)]">
                          No missing key skills detected!
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Key Responsibilities & Keywords */}
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6">
                  <h3 className="text-base font-semibold mb-3">Key Responsibilities</h3>
                  <ul className="space-y-2">
                    {result.key_responsibilities.map((r, i) => (
                      <li key={i} className="text-sm text-[var(--text-muted)] flex items-start gap-2">
                        <span className="text-blue-400 mt-0.5">•</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="border-t border-[var(--border)] pt-4 mt-5">
                    <h4 className="text-xs font-semibold uppercase text-[var(--text-muted)] mb-2">
                      Recommended Action Verbs
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {result.suggested_action_verbs.map((v, i) => (
                        <span
                          key={i}
                          className="rounded-full bg-blue-500/10 border border-blue-500/30 px-3 py-1 text-xs text-blue-400"
                        >
                          {v}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Next Steps Quick Actions */}
                <div className="rounded-2xl border border-blue-500/30 bg-blue-500/5 p-5">
                  <h4 className="text-sm font-semibold text-blue-400 mb-3">
                    Recommended Next Actions
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => router.push("/ats")}
                      className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-medium text-white transition hover:bg-blue-700"
                    >
                      Run Full ATS Simulation →
                    </button>
                    {selectedResumeId && (
                      <button
                        onClick={() =>
                          router.push(
                            `/optimization?resume_id=${selectedResumeId}&job_description=${encodeURIComponent(
                              jobDescription
                            )}`
                          )
                        }
                        className="rounded-xl border border-blue-500/30 bg-[var(--bg-surface)] px-4 py-2 text-xs font-medium text-[var(--text-primary)] transition hover:bg-[var(--bg-muted)]"
                      >
                        AI Optimize Resume →
                      </button>
                    )}
                    <button
                      onClick={() => router.push("/cover-letter")}
                      className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-2 text-xs font-medium text-[var(--text-primary)] transition hover:bg-[var(--bg-muted)]"
                    >
                      Generate Cover Letter →
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
