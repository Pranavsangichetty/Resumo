"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface ForgotPasswordResult {
  emailSent: boolean;
  resetLink: string | null;
  resetPath: string | null;
  message: string;
}

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<ForgotPasswordResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/api/v1/auth/forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim().toLowerCase() }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || "Something went wrong. Please try again.");
        return;
      }

      const rawLink = data.reset_link || null;

      // If we got a direct reset link (local dev or SMTP failed), redirect immediately
      if (rawLink) {
        try {
          const url = new URL(rawLink);
          router.push(url.pathname + url.search);
        } catch {
          router.push(rawLink);
        }
        return;
      }

      // Email was sent successfully, or no user found — show confirmation
      setResult({
        emailSent: Boolean(data.email_sent),
        resetLink: null,
        resetPath: null,
        message: data.message,
      });
    } catch {
      setError("Unable to connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-[var(--border)] bg-[var(--bg-muted)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20";

  return (
    <main className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] flex items-center justify-center px-6 relative overflow-hidden">
      <div className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-indigo-600/15 blur-[120px]" />

      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-extrabold text-2xl mb-3 shadow-[0_0_20px_-3px_rgba(99,102,241,0.3)]">
            R
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
            Resumo
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1 tracking-wide uppercase font-medium">
            Craft Better. Apply Smarter.
          </p>
        </div>

        <div className="card-glow rounded-3xl p-8 backdrop-blur-xl border border-[var(--border)] bg-[var(--bg-surface)]">
          <h2 className="text-2xl font-bold mb-1.5 text-[var(--text-primary)]">
            Reset your password
          </h2>

          <p className="text-xs text-[var(--text-secondary)] mb-6">
            Enter your email and we&apos;ll send you a link to reset your password.
          </p>

          {result ? (
            <div className="space-y-4">
              {result.emailSent ? (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-400 leading-relaxed">
                  A password reset link has been sent to <strong>{email}</strong>. Please check your inbox and spam folder.
                </div>
              ) : (
                <div className="rounded-xl border border-zinc-700 bg-zinc-800/60 p-4 text-sm text-zinc-300 leading-relaxed">
                  If that email is registered in Resumo, a reset link has been sent to your inbox.
                </div>
              )}

              <Link
                href="/login"
                className="block w-full rounded-xl py-3 font-semibold text-sm text-center border border-[var(--border)] bg-[var(--bg-muted)] hover:bg-[var(--bg-surface)] text-[var(--text-primary)] transition"
              >
                Back to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-[var(--text-muted)]">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className={inputClass}
                />
              </div>

              {error && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white py-3 font-semibold text-sm transition disabled:opacity-50 shadow-md shadow-indigo-600/20"
              >
                {loading ? "Generating Link..." : "Send Reset Link"}
              </button>
            </form>
          )}

          <p className="text-center text-xs text-[var(--text-muted)] mt-6">
            Remember your password?{" "}
            <Link
              href="/login"
              className="text-indigo-400 font-semibold hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
