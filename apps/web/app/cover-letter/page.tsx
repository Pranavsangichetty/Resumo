"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface ResumeSummary {
  id: number;
  title: string;
}

interface CoverLetterResult {
  cover_letter: string;
  subject_line: string;
  key_highlights: string[];
  word_count?: number;
}

export default function CoverLetterPage() {
  const router = useRouter();

  // Basic Information
  const [company, setCompany] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [recipient, setRecipient] = useState("Hiring Team");

  // Required Job Description
  const [jobDescription, setJobDescription] = useState("");

  // Resume Selection
  const [resumes, setResumes] = useState<ResumeSummary[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<number | undefined>(undefined);
  const [loadingResumes, setLoadingResumes] = useState(true);

  // Customization Options
  const [keySkills, setKeySkills] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [tone, setTone] = useState("professional");
  const [length, setLength] = useState("standard");

  // State
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<CoverLetterResult | null>(null);
  const [copied, setCopied] = useState(false);

  // Load Saved Resumes
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
          const list: ResumeSummary[] = await res.json();
          setResumes(list);
          if (list.length > 0) {
            setSelectedResumeId(list[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to fetch resumes:", err);
      } finally {
        setLoadingResumes(false);
      }
    }
    loadResumes();
  }, [router]);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.replace("/login");
      return;
    }

    if (!company.trim()) {
      setError("Company Name is required.");
      return;
    }
    if (!jobTitle.trim()) {
      setError("Job Title is required.");
      return;
    }
    if (!jobDescription.trim()) {
      setError("Job Description is required to tailor the cover letter.");
      return;
    }

    setGenerating(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/api/v1/cover-letter/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          company_name: company.trim(),
          job_title: jobTitle.trim(),
          recipient_name: recipient.trim() || "Hiring Team",
          job_description: jobDescription.trim(),
          resume_id: selectedResumeId || undefined,
          key_skills: keySkills.trim() || undefined,
          additional_info: additionalInfo.trim() || undefined,
          tone: tone,
          length: length,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Failed to generate cover letter.");
      }
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Failed to generate cover letter. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  function copyToClipboard() {
    if (!result) return;
    navigator.clipboard.writeText(result.cover_letter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  const inputClass =
    "w-full rounded-xl border border-[var(--border)] bg-[var(--bg-muted)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

  return (
    <main className="min-h-screen bg-[var(--bg-base)] p-6 md:p-10 text-[var(--text-primary)]">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="border-b border-[var(--border)] pb-6 mb-8">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-sm text-[var(--text-muted)] hover:text-blue-400 transition mb-2 inline-flex items-center gap-1.5"
          >
            ← Back to Dashboard
          </button>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-3xl font-bold">Cover Letter Generator</h1>
              <p className="text-sm text-[var(--text-muted)] mt-1">
                Create customized, human-sounding cover letters tailored to your resume and target role.
              </p>
            </div>
            {result && (
              <button
                onClick={copyToClipboard}
                className="self-start sm:self-auto rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-xs font-semibold text-blue-400 transition hover:bg-blue-500/20"
              >
                {copied ? "✓ Copied to Clipboard!" : "Copy Full Text"}
              </button>
            )}
          </div>
        </div>

        {/* Two-Column Grid */}
        <div className="grid gap-8 lg:grid-cols-12 items-start">
          {/* Left Column: Form Details */}
          <div className="lg:col-span-6 space-y-6">
            <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6 shadow-sm">
              <h2 className="text-lg font-bold mb-4 flex items-center justify-between">
                <span>Letter Details</span>
                <span className="text-xs font-normal text-[var(--text-muted)]">
                  * indicates required
                </span>
              </h2>

              <form onSubmit={handleGenerate} className="space-y-4">
                {/* Company & Job Title in 2 columns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                      Company Name <span className="text-blue-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="e.g. Netflix, Microsoft"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                      Job Title <span className="text-blue-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="e.g. Senior Frontend Engineer"
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* Recipient */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                    Recipient / Hiring Manager
                  </label>
                  <input
                    type="text"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder="e.g. Sarah Jenkins or Hiring Team"
                    className={inputClass}
                  />
                </div>

                {/* Resume Selector */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                      Target Resume
                    </label>
                    {resumes.length === 0 && !loadingResumes && (
                      <button
                        type="button"
                        onClick={() => router.push("/resume-builder")}
                        className="text-xs text-blue-400 hover:underline"
                      >
                        + Create a resume
                      </button>
                    )}
                  </div>
                  {loadingResumes ? (
                    <div className="h-10 w-full animate-pulse rounded-xl bg-[var(--bg-muted)]" />
                  ) : resumes.length > 0 ? (
                    <select
                      value={selectedResumeId ?? ""}
                      onChange={(e) =>
                        setSelectedResumeId(
                          e.target.value ? Number(e.target.value) : undefined
                        )
                      }
                      className={inputClass}
                    >
                      {resumes.map((r) => (
                        <option key={r.id} value={r.id}>
                          📄 {r.title}
                        </option>
                      ))}
                      <option value="">None (Generate without resume)</option>
                    </select>
                  ) : (
                    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-muted)] p-3 text-xs text-[var(--text-muted)]">
                      No saved resumes found.{" "}
                      <button
                        type="button"
                        onClick={() => router.push("/resume-builder")}
                        className="text-blue-400 underline font-medium"
                      >
                        Build one in Resume Builder
                      </button>{" "}
                      for hyper-tailored results.
                    </div>
                  )}
                </div>

                {/* Job Description (Required) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                      Job Description <span className="text-blue-400">*</span>
                    </label>
                    <span className="text-[11px] text-[var(--text-muted)]">
                      Required for tailoring
                    </span>
                  </div>
                  <textarea
                    required
                    rows={5}
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the target job description or requirements here... Key skills and responsibilities will be extracted automatically."
                    className={`${inputClass} resize-y leading-relaxed font-sans`}
                  />
                </div>

                {/* Key Skills to Highlight */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                    Key Skills to Highlight
                  </label>
                  <input
                    type="text"
                    value={keySkills}
                    onChange={(e) => setKeySkills(e.target.value)}
                    placeholder="e.g. React, Next.js, Microservices, System Architecture"
                    className={inputClass}
                  />
                  <p className="text-[11px] text-[var(--text-muted)] mt-1">
                    Comma-separated skills from your resume you want prioritized.
                  </p>
                </div>

                {/* Tone & Length in 2 columns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                      Tone of Voice
                    </label>
                    <select
                      value={tone}
                      onChange={(e) => setTone(e.target.value)}
                      className={inputClass}
                    >
                      <option value="professional">Professional & Balanced</option>
                      <option value="confident">Confident & Impact-Driven</option>
                      <option value="enthusiastic">Enthusiastic & Passionate</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                      Letter Length
                    </label>
                    <select
                      value={length}
                      onChange={(e) => setLength(e.target.value)}
                      className={inputClass}
                    >
                      <option value="short">Short (150–200 words)</option>
                      <option value="standard">Standard (250–350 words)</option>
                      <option value="detailed">Detailed (400–500 words)</option>
                    </select>
                  </div>
                </div>

                {/* Additional Information */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                    Additional Information
                  </label>
                  <textarea
                    rows={2}
                    value={additionalInfo}
                    onChange={(e) => setAdditionalInfo(e.target.value)}
                    placeholder="e.g. Immediate joiner, willing to relocate, referenced by a colleague, etc."
                    className={`${inputClass} resize-y leading-relaxed font-sans`}
                  />
                </div>

                {/* Error Banner */}
                {error && (
                  <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
                    {error}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={generating}
                  className="w-full rounded-xl bg-blue-600 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50 shadow-md shadow-blue-600/20"
                >
                  {generating ? (
                    <span className="inline-flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Crafting Tailored Cover Letter...
                    </span>
                  ) : (
                    "Generate Cover Letter →"
                  )}
                </button>
              </form>
            </section>
          </div>

          {/* Right Column: Preview */}
          <div className="lg:col-span-6 lg:sticky lg:top-8">
            {!result ? (
              <div className="flex h-full min-h-[460px] flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border)] bg-[var(--bg-surface)] p-8 text-center">
                <div className="rounded-2xl bg-blue-600/10 p-5 text-4xl text-blue-400 mb-4 border border-blue-500/20">
                  ✉️
                </div>
                <h3 className="text-lg font-bold text-[var(--text-primary)]">
                  Your Cover Letter Preview
                </h3>
                <p className="max-w-sm text-sm text-[var(--text-muted)] mt-1.5 leading-relaxed">
                  Fill in the job description and company details on the left to generate a personalized, truthful cover letter.
                </p>
                <div className="mt-6 flex flex-wrap gap-2 justify-center max-w-xs text-xs text-[var(--text-muted)]">
                  <span className="rounded-lg bg-[var(--bg-muted)] border border-[var(--border)] px-2.5 py-1">
                    ✓ Uses Resume Highlights
                  </span>
                  <span className="rounded-lg bg-[var(--bg-muted)] border border-[var(--border)] px-2.5 py-1">
                    ✓ Matches Job Keywords
                  </span>
                  <span className="rounded-lg bg-[var(--bg-muted)] border border-[var(--border)] px-2.5 py-1">
                    ✓ Zero Fluff
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6 shadow-sm">
                  {/* Subject line & Copy */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border)] pb-4 mb-4">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                        Subject Line
                      </p>
                      <p className="text-sm font-semibold text-[var(--text-primary)] mt-0.5">
                        {result.subject_line}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {result.word_count && (
                        <span className="rounded-lg bg-[var(--bg-muted)] border border-[var(--border)] px-2.5 py-1 text-xs font-medium text-[var(--text-muted)]">
                          {result.word_count} words
                        </span>
                      )}
                      <button
                        onClick={copyToClipboard}
                        className="rounded-xl border border-blue-500/30 bg-blue-500/10 px-3.5 py-1.5 text-xs font-semibold text-blue-400 transition hover:bg-blue-500/20"
                      >
                        {copied ? "✓ Copied!" : "Copy Full Text"}
                      </button>
                    </div>
                  </div>

                  {/* Highlights Tags */}
                  {result.key_highlights && result.key_highlights.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {result.key_highlights.map((h, idx) => (
                        <span
                          key={idx}
                          className="rounded-md bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 text-[11px] font-medium text-blue-400"
                        >
                          {h}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Letter Body */}
                  <div className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-[var(--text-primary)] max-h-[580px] overflow-y-auto p-3 rounded-xl bg-[var(--bg-muted)] border border-[var(--border)]">
                    {result.cover_letter}
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
