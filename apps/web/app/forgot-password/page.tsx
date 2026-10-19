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
          headers: {
            "Content-Type": "application/json",
            "bypass-tunnel-reminder": "true",
          },
          body: JSON.stringify({ email: email.trim().toLowerCase() }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || "Something went wrong. Please try again.");
        return;
      }

      setResult({
        emailSent: Boolean(data.email_sent),
        resetLink: data.reset_link || null,
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
                  <div className="flex items-center gap-2 font-semibold mb-1">
                    <span>✉️</span> Reset Email Sent
                  </div>
                  A password reset link has been sent to <strong>{email}</strong>. Please check your inbox and spam folder.
                </div>
              ) : result.resetLink ? (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-300 leading-relaxed space-y-3">
                  <div className="flex items-center gap-2 font-semibold text-amber-200">
                    <span>ℹ️</span> Reset Link Ready
                  </div>
                  <p className="text-xs text-amber-300/90 leading-relaxed">
                    Email delivery (SMTP) is not configured on this server yet. For testing, you can use the direct link below:
                  </p>
                  <Link
                    href={result.resetLink}
                    className="block w-full text-center py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs transition shadow-sm"
                  >
                    Proceed to Reset Password →
                  </Link>
                </div>
              ) : (
                <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-muted)] p-4 text-sm text-[var(--text-secondary)] leading-relaxed">
                  If that email is registered in Resumo, a reset link has been processed.
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
