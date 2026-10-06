"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  getResumes,
  Resume,
} from "@/lib/api";

// ======================================================
// TYPES
// ======================================================

type ATSEvaluationResult = {
  score: number;
  keyword_match: number;
  skills_match: number;
  experience_match: number;
  education_match: number;
  matched_keywords: string[];
  missing_keywords: string[];
  suggestions: string[];
};

// ======================================================
// PAGE
// ======================================================

export default function ATSPage() {
  const router = useRouter();

  const [resumes, setResumes] =
    useState<Resume[]>([]);

  const [selectedResumeId, setSelectedResumeId] =
    useState("");

  const [jobDescription, setJobDescription] =
    useState("");

  const [result, setResult] =
    useState<ATSEvaluationResult | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [evaluating, setEvaluating] =
    useState(false);

  const [error, setError] =
    useState("");

  // ====================================================
  // LOAD RESUMES
  // ====================================================

  useEffect(() => {
    async function loadResumes() {
      const token =
        localStorage.getItem("access_token");

      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        setLoading(true);
        setError("");

        const data =
          await getResumes(token);

        setResumes(data);

        if (data.length > 0) {
          setSelectedResumeId(
            String(data[0].id)
          );
        }

      } catch (err) {
        console.error(
          "Failed to load resumes:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load your resumes."
        );

      } finally {
        setLoading(false);
      }
    }

    loadResumes();
  }, [router]);

  // ====================================================
  // EVALUATE RESUME
  // ====================================================

  async function handleEvaluate() {
    const token =
      localStorage.getItem("access_token");

    if (!token) {
      router.replace("/login");
      return;
    }

    if (!selectedResumeId) {
      setError(
        "Please select a resume."
      );
      return;
    }

    if (
      jobDescription.trim().length < 20
    ) {
      setError(
        "Please enter a job description with at least 20 characters."
      );
      return;
    }

    try {
      setEvaluating(true);
      setError("");
      setResult(null);

      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL ||
          "http://localhost:8000"
        }/api/v1/ats/evaluate`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            resume_id:
              Number(selectedResumeId),

            job_description:
              jobDescription.trim(),
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            "ATS evaluation failed."
        );
      }

      setResult(data);

    } catch (err) {
      console.error(
        "ATS evaluation error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to evaluate resume."
      );

    } finally {
      setEvaluating(false);
    }
  }

  // ====================================================
  // OPEN OPTIMIZATION
  // ====================================================

  function handleOptimize() {
    if (!selectedResumeId) {
      setError(
        "Please select a resume first."
      );
      return;
    }

    if (
      jobDescription.trim().length < 20
    ) {
      setError(
        "Please enter a valid job description first."
      );
      return;
    }

    const params = new URLSearchParams();

    params.set(
      "resume_id",
      selectedResumeId
    );

    params.set(
      "job_description",
      jobDescription.trim()
    );

    router.push(
      `/optimization?${params.toString()}`
    );
  }

  // ====================================================
  // LOADING
  // ====================================================

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--bg-base)]">
        <p className="text-[var(--text-muted)]">
          Loading your resumes...
        </p>
      </main>
    );
  }

  // ====================================================
  // PAGE
  // ====================================================

  return (
    <main className="min-h-screen bg-[var(--bg-base)] p-6 md:p-10">

      <div className="mx-auto max-w-6xl">

        {/* HEADER */}

        <div className="flex flex-col gap-4 border-b border-[var(--border)] pb-6 md:flex-row md:items-center md:justify-between">

          <div>

            <button
              type="button"
              onClick={() =>
                router.push("/dashboard")
              }
              className="text-sm text-[var(--text-muted)] hover:text-blue-400 transition"
            >
              ← Dashboard
            </button>

            <p className="mt-4 text-sm text-[var(--text-muted)]">
              Resumo
            </p>

            <h1 className="mt-1 text-3xl font-bold text-[var(--text-primary)]">
              ATS Evaluation
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-[var(--text-muted)]">
              Compare your resume against a job
              description and identify keywords and
              areas that need improvement.
            </p>

          </div>

        </div>


        {/* ERROR */}

        {error && (
          <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
            {error}
          </div>
        )}


        {/* INPUT AREA */}

        <div className="mt-8 grid gap-6 lg:grid-cols-2">

          {/* RESUME SELECTOR */}

          <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6">

            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              Select Resume
            </h2>

            <p className="mt-2 text-sm text-[var(--text-muted)]">
              Choose the resume you want to
              evaluate.
            </p>

            {resumes.length === 0 ? (

              <div className="mt-5 rounded-xl border border-dashed border-[var(--border)] p-5 text-center">

                <p className="text-sm text-[var(--text-muted)]">
                  You don&apos;t have any resumes yet.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      "/resume-builder"
                    )
                  }
                  className="mt-4 rounded-xl bg-blue-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                >
                  Create Resume
                </button>

              </div>

            ) : (

              <div className="mt-5 space-y-3">

                {resumes.map((resume) => (

                  <button
                    key={resume.id}
                    type="button"
                    onClick={() =>
                      setSelectedResumeId(
                        String(resume.id)
                      )
                    }
                    className={`w-full rounded-xl border p-4 text-left transition ${
                      selectedResumeId ===
                      String(resume.id)
                        ? "border-blue-500 bg-blue-500/10 text-[var(--text-primary)]"
                        : "border-[var(--border)] bg-[var(--bg-muted)] hover:border-blue-500/50"
                    }`}
                  >

                    <p className="font-medium text-[var(--text-primary)]">
                      {resume.title}
                    </p>

                    <p className="mt-1 text-xs text-[var(--text-muted)]">
                      Resume #{resume.id}
                    </p>

                  </button>

                ))}

              </div>

            )}

          </section>


          {/* JOB DESCRIPTION */}

          <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6">

            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              Job Description
            </h2>

            <p className="mt-2 text-sm text-[var(--text-muted)]">
              Paste the complete job description
              here.
            </p>

            <textarea
              value={jobDescription}
              onChange={(event) =>
                setJobDescription(
                  event.target.value
                )
              }
              placeholder="Paste the job description here..."
              rows={14}
              className="mt-5 w-full resize-y rounded-xl border border-[var(--border)] bg-[var(--bg-muted)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />

            <div className="mt-2 text-right text-xs text-[var(--text-muted)]">
              {jobDescription.length} characters
            </div>

          </section>

        </div>


        {/* EVALUATE BUTTON */}

        <div className="mt-6">

          <button
            type="button"
            onClick={handleEvaluate}
            disabled={
              evaluating ||
              !selectedResumeId ||
              jobDescription.trim().length < 20
            }
            className="w-full rounded-xl bg-blue-600 px-6 py-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {evaluating
              ? "Evaluating Resume..."
              : "Evaluate Resume"}
          </button>

        </div>


        {/* RESULTS */}

        {result && (
          <div className="mt-10 space-y-6">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <p className="text-sm text-[var(--text-muted)]">
                  ATS Evaluation Result
                </p>

                <h2 className="mt-1 text-2xl font-bold text-[var(--text-primary)]">
                  Resume Match
                </h2>

              </div>


              {/* OPTIMIZE BUTTON */}

              <button
                type="button"
                onClick={handleOptimize}
                className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                ✨ Optimize Resume →
              </button>

            </div>


            {/* SCORE */}

            <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-8">

              <div className="flex flex-col items-center justify-center">

                <div className="flex h-40 w-40 items-center justify-center rounded-full border-[12px] border-blue-600">

                  <div className="text-center">

                    <div className="text-5xl font-bold text-[var(--text-primary)]">
                      {result.score}
                    </div>

                    <div className="text-sm text-[var(--text-muted)]">
                      / 100
                    </div>

                  </div>

                </div>

                <h3 className="mt-5 text-xl font-semibold text-[var(--text-primary)]">
                  ATS Score
                </h3>

              </div>

            </section>


            {/* CATEGORY SCORES */}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

              <ScoreCard
                title="Keyword Match"
                score={
                  result.keyword_match
                }
              />

              <ScoreCard
                title="Skills Match"
                score={
                  result.skills_match
                }
              />

              <ScoreCard
                title="Experience Match"
                score={
                  result.experience_match
                }
              />

              <ScoreCard
                title="Education Match"
                score={
                  result.education_match
                }
              />

            </div>


            {/* KEYWORDS */}

            <div className="grid gap-6 lg:grid-cols-2">

              {/* MATCHED */}

              <KeywordSection
                title="Matched Keywords"
                keywords={
                  result.matched_keywords
                }
                emptyText="No matching keywords found."
                variant="matched"
              />


              {/* MISSING */}

              <KeywordSection
                title="Missing Keywords"
                keywords={
                  result.missing_keywords
                }
                emptyText="No major missing keywords detected."
                variant="missing"
              />

            </div>


            {/* SUGGESTIONS */}

            <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6">

              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                Improvement Suggestions
              </h2>

              <div className="mt-5 space-y-3">

                {result.suggestions.length === 0 ? (

                  <p className="text-sm text-[var(--text-muted)]">
                    No additional suggestions.
                  </p>

                ) : (

                  result.suggestions.map(
                    (suggestion, index) => (

                      <div
                        key={index}
                        className="rounded-xl border border-[var(--border)] bg-[var(--bg-muted)] p-4 text-sm text-[var(--text-primary)]"
                      >
                        <span className="font-semibold">
                          {index + 1}.
                        </span>{" "}
                        {suggestion}
                      </div>

                    )
                  )

                )}

              </div>

            </section>


            {/* OPTIMIZATION CTA */}

            <section className="rounded-2xl border border-blue-500/30 bg-blue-500/5 p-8">

              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                <div>

                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    Ready to improve your resume?
                  </p>

                  <p className="mt-2 max-w-2xl text-sm text-[var(--text-muted)]">
                    Use Gemini to improve your resume&apos;s
                    ATS alignment while keeping your
                    actual experience and qualifications
                    intact.
                  </p>

                </div>

                <button
                  type="button"
                  onClick={handleOptimize}
                  className="shrink-0 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  Optimize with AI →
                </button>

              </div>

            </section>

          </div>
        )}

      </div>

    </main>
  );
}


// ======================================================
// SCORE CARD
// ======================================================

function ScoreCard({
  title,
  score,
}: {
  title: string;
  score: number;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5">

      <p className="text-sm text-[var(--text-muted)]">
        {title}
      </p>

      <p className="mt-2 text-3xl font-bold text-[var(--text-primary)]">
        {score}

        <span className="text-sm font-normal text-[var(--text-muted)]">
          /100
        </span>
      </p>

    </div>
  );
}


// ======================================================
// KEYWORD SECTION
// ======================================================

function KeywordSection({
  title,
  keywords,
  emptyText,
  variant,
}: {
  title: string;
  keywords: string[];
  emptyText: string;
  variant: "matched" | "missing";
}) {
  const pillClass =
    variant === "matched"
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
      : "border-red-500/30 bg-red-500/10 text-red-400";

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6">

      <h2 className="text-lg font-semibold text-[var(--text-primary)]">
        {title}
      </h2>

      {keywords.length === 0 ? (

        <p className="mt-5 text-sm text-[var(--text-muted)]">
          {emptyText}
        </p>

      ) : (

        <div className="mt-5 flex flex-wrap gap-2">

          {keywords.map(
            (keyword, index) => (

              <span
                key={`${keyword}-${index}`}
                className={`rounded-full border px-3 py-1.5 text-sm ${pillClass}`}
              >
                {keyword}
              </span>

            )
          )}

        </div>

      )}

    </section>
  );
}