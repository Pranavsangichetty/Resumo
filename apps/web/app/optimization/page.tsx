"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ======================================================
// TYPES
// ======================================================

type OptimizationResult = {
  resume_id: number;
  original_content: string;
  optimized_content: string;
  changes: string[];
  added_keywords: string[];
  warnings: string[];
};

// ======================================================
// PAGE
// ======================================================

function OptimizationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [result, setResult] =
    useState<OptimizationResult | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ----------------------------------------------------
  // Read URL parameters
  // ----------------------------------------------------

  const resumeId = searchParams.get("resume_id");
  const jobDescription =
    searchParams.get("job_description");

  // ======================================================
  // RUN AI OPTIMIZATION
  // ======================================================

  useEffect(() => {
    async function optimizeResume() {
      const token =
        localStorage.getItem("access_token");

      // --------------------------------------------------
      // Authentication check
      // --------------------------------------------------

      if (!token) {
        router.replace("/login");
        return;
      }

      // --------------------------------------------------
      // Validate URL parameters
      // --------------------------------------------------

      if (!resumeId || !jobDescription) {
        setError(
          "Resume ID or job description is missing."
        );

        setLoading(false);
        return;
      }

      const parsedResumeId = Number(resumeId);

      if (
        !Number.isInteger(parsedResumeId) ||
        parsedResumeId <= 0
      ) {
        setError("Invalid resume ID.");
        setLoading(false);
        return;
      }

      if (jobDescription.trim().length < 20) {
        setError(
          "The job description is too short."
        );

        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        // ------------------------------------------------
        // Call optimization API
        // ------------------------------------------------

        const response = await fetch(
          `${API_URL}/api/v1/optimization/optimize`,
          {
            method: "POST",

            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },

            body: JSON.stringify({
              resume_id: parsedResumeId,
              job_description: jobDescription,
            }),
          }
        );

        // ------------------------------------------------
        // Parse response
        // ------------------------------------------------

        const data = await response
          .json()
          .catch(() => null);

        // ------------------------------------------------
        // Authentication failure
        // ------------------------------------------------

        if (response.status === 401) {
          localStorage.removeItem(
            "access_token"
          );

          router.replace("/login");
          return;
        }

        // ------------------------------------------------
        // Other API errors
        // ------------------------------------------------

        if (!response.ok) {
          throw new Error(
            data?.detail ||
              data?.message ||
              "Unable to optimize resume."
          );
        }

        // ------------------------------------------------
        // Store successful result
        // ------------------------------------------------

        setResult({
          resume_id: data.resume_id,
          original_content:
            data.original_content || "",
          optimized_content:
            data.optimized_content || "",
          changes:
            Array.isArray(data.changes)
              ? data.changes
              : [],
          added_keywords:
            Array.isArray(data.added_keywords)
              ? data.added_keywords
              : [],
          warnings:
            Array.isArray(data.warnings)
              ? data.warnings
              : [],
        });
      } catch (err) {
        console.error(
          "Optimization error:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while optimizing the resume."
        );
      } finally {
        setLoading(false);
      }
    }

    optimizeResume();
  }, [
    resumeId,
    jobDescription,
    router,
  ]);

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--bg-base)] p-8 md:p-12">
        <div className="mx-auto max-w-5xl">

          <p className="text-sm text-[var(--text-muted)]">
            AI Resume Optimization
          </p>

          <h1 className="mt-2 text-3xl font-bold text-[var(--text-primary)]">
            Optimizing your resume...
          </h1>

          <p className="mt-3 text-[var(--text-muted)]">
            Our AI is comparing your resume
            with the job description and
            improving the content.
          </p>

          <div className="mt-10 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-8">
            <div className="flex items-center gap-4">

              <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--border)] border-t-blue-500" />

              <p className="text-sm text-[var(--text-muted)]">
                Generating optimized resume...
              </p>

            </div>
          </div>

        </div>
      </main>
    );
  }

  // ======================================================
  // ERROR
  // ======================================================

  if (error) {
    return (
      <main className="min-h-screen bg-[var(--bg-base)] p-8 md:p-12">
        <div className="mx-auto max-w-3xl">

          <button
            type="button"
            onClick={() => router.back()}
            className="mb-6 text-sm text-[var(--text-muted)] hover:text-blue-400 transition"
          >
            ← Back
          </button>

          <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-6">

            <h1 className="text-xl font-semibold text-red-400">
              Optimization failed
            </h1>

            <p className="mt-3 text-sm text-[var(--text-muted)]">
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                window.location.reload()
              }
              className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              Try Again
            </button>

          </div>

        </div>
      </main>
    );
  }

  // ======================================================
  // NO RESULT
  // ======================================================

  if (!result) {
    return null;
  }

  // ======================================================
  // SUCCESS
  // ======================================================

  return (
    <main className="min-h-screen bg-[var(--bg-base)] p-8 md:p-12">
      <div className="mx-auto max-w-6xl">

        {/* HEADER */}

        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">

          <div>

            <p className="text-sm text-[var(--text-muted)]">
              AI Resume Optimization
            </p>

            <h1 className="mt-2 text-4xl font-bold text-[var(--text-primary)]">
              Your resume has been optimized
            </h1>

            <p className="mt-3 max-w-2xl text-sm text-[var(--text-muted)]">
              We analyzed your resume against
              the job description and generated
              an improved version using AI.
            </p>

          </div>

          <button
            type="button"
            onClick={() =>
              router.push("/dashboard")
            }
            className="rounded-xl border border-[var(--border)] px-5 py-3 text-sm font-medium text-[var(--text-primary)] transition hover:bg-[var(--bg-muted)]"
          >
            ← Dashboard
          </button>

        </div>

        {/* ==================================================
            SUCCESS BANNER
        ================================================== */}

        <div className="mt-8 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6">

          <div className="flex items-start gap-4">

            <div className="text-2xl text-emerald-400">
              ✓
            </div>

            <div>

              <h2 className="font-semibold text-[var(--text-primary)]">
                Optimization completed successfully
              </h2>

              <p className="mt-1 text-sm text-[var(--text-muted)]">
                Your resume was tailored to
                the provided job description.
              </p>

            </div>

          </div>

        </div>

        {/* ==================================================
            CHANGES + KEYWORDS
        ================================================== */}

        <div className="mt-8 grid gap-6 lg:grid-cols-2">

          {/* ------------------------------------------------
              CHANGES
          ------------------------------------------------ */}

          <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6">

            <h2 className="text-xl font-semibold text-[var(--text-primary)]">
              Changes made
            </h2>

            <p className="mt-2 text-sm text-[var(--text-muted)]">
              Improvements identified by
              the AI optimizer.
            </p>

            <div className="mt-5">

              {result.changes.length > 0 ? (
                <ul className="space-y-3">

                  {result.changes.map(
                    (change, index) => (
                      <li
                        key={index}
                        className="flex gap-3 text-sm text-[var(--text-primary)]"
                      >

                        <span className="mt-1 text-emerald-400">
                          ✓
                        </span>

                        <span>
                          {change}
                        </span>

                      </li>
                    )
                  )}

                </ul>
              ) : (
                <p className="text-sm text-[var(--text-muted)]">
                  No specific changes were returned.
                </p>
              )}

            </div>

          </section>

          {/* KEYWORDS */}

          <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6">

            <h2 className="text-xl font-semibold text-[var(--text-primary)]">
              Added keywords
            </h2>

            <p className="mt-2 text-sm text-[var(--text-muted)]">
              Important job-related keywords
              added to improve ATS matching.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">

              {result.added_keywords.length > 0 ? (

                result.added_keywords.map(
                  (keyword, index) => (
                    <span
                      key={index}
                      className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1.5 text-sm text-blue-400"
                    >
                      {keyword}
                    </span>
                  )
                )

              ) : (

                <p className="text-sm text-[var(--text-muted)]">
                  No additional keywords returned.
                </p>

              )}

            </div>

          </section>

        </div>

        {/* ==================================================
            WARNINGS
        ================================================== */}

        {result.warnings.length > 0 && (
          <section className="mt-8 rounded-2xl border border-yellow-500/30 bg-yellow-500/5 p-6">

            <h2 className="text-xl font-semibold text-[var(--text-primary)]">
              AI warnings
            </h2>

            <p className="mt-2 text-sm text-[var(--text-muted)]">
              Review these items before using
              the optimized resume.
            </p>

            <ul className="mt-5 space-y-3">

              {result.warnings.map(
                (warning, index) => (
                  <li
                    key={index}
                    className="flex gap-3 text-sm text-[var(--text-primary)]"
                  >

                    <span className="text-yellow-400">
                      ⚠
                    </span>

                    <span>
                      {warning}
                    </span>

                  </li>
                )
              )}

            </ul>

          </section>
        )}

        {/* ==================================================
            RESUME COMPARISON
        ================================================== */}

        <section className="mt-8">

          <h2 className="text-xl font-semibold text-[var(--text-primary)]">
            Resume comparison
          </h2>

          <div className="mt-5 grid gap-6 lg:grid-cols-2">

            {/* ORIGINAL */}

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)]">

              <div className="border-b border-[var(--border)] p-5">

                <h3 className="font-semibold text-[var(--text-primary)]">
                  Original Resume
                </h3>

              </div>

              <div className="max-h-[600px] overflow-y-auto p-6">

                <pre className="whitespace-pre-wrap font-sans text-sm leading-7 text-[var(--text-muted)]">
                  {result.original_content}
                </pre>

              </div>

            </div>

            {/* OPTIMIZED */}

            <div className="rounded-2xl border border-emerald-500/30 bg-[var(--bg-surface)]">

              <div className="border-b border-[var(--border)] p-5">

                <div className="flex items-center justify-between gap-3">

                  <h3 className="font-semibold text-[var(--text-primary)]">
                    Optimized Resume
                  </h3>

                  <span className="rounded-full border border-emerald-500/30 px-3 py-1 text-xs text-emerald-400">
                    AI Improved
                  </span>

                </div>

              </div>

              <div className="max-h-[600px] overflow-y-auto p-6">

                <pre className="whitespace-pre-wrap font-sans text-sm leading-7 text-[var(--text-primary)]">
                  {result.optimized_content}
                </pre>

              </div>

            </div>

          </div>

        </section>

        {/* ==================================================
            ACTIONS
        ================================================== */}

        <div className="mt-8 flex flex-wrap gap-4">

          <button
            type="button"
            onClick={() =>
              router.push(
                `/resume-builder/${result.resume_id}`
              )
            }
            className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Edit Optimized Resume →
          </button>

          <button
            type="button"
            onClick={() =>
              router.push("/ats")
            }
            className="rounded-xl border border-[var(--border)] px-6 py-3 text-sm font-medium text-[var(--text-primary)] transition hover:bg-[var(--bg-muted)]"
          >
            Check ATS Score Again
          </button>

          <button
            type="button"
            onClick={() =>
              router.push("/dashboard")
            }
            className="rounded-xl border border-[var(--border)] px-6 py-3 text-sm font-medium text-[var(--text-primary)] transition hover:bg-[var(--bg-muted)]"
          >
            Back to Dashboard
          </button>

        </div>

      </div>
    </main>
  );
}

export default function OptimizationPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[var(--bg-base)]">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--border)] border-t-blue-500" />
        </div>
      }
    >
      <OptimizationContent />
    </Suspense>
  );
}