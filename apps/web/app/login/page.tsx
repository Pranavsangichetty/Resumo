"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/api/v1/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.detail || "Invalid email or password."
        );
        return;
      }

      // Store JWT access token
      localStorage.setItem(
        "access_token",
        data.access_token
      );

      // Login successful
      router.push("/dashboard");
    } catch (err) {
      console.warn("Login request failed:", err);

      setError(
        "Unable to connect to the backend server. Please verify the API server is running on http://localhost:8000."
      );
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-[var(--border)] bg-[var(--bg-muted)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20";

  return (
    <main className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] flex items-center justify-center px-6 relative overflow-hidden">
      {/* Background Glow */}
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

        <div className="card-glow rounded-3xl p-8 backdrop-blur-xl">
          <h2 className="text-2xl font-bold mb-1.5 text-[var(--text-primary)]">
            Welcome back
          </h2>

          <p className="text-xs text-[var(--text-secondary)] mb-6">
            Sign in to continue to your workspace.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-[var(--text-muted)]">
                Email Address
              </label>

              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                placeholder="you@example.com"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-[var(--text-muted)]">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                placeholder="Enter your password"
                className={inputClass}
              />
              <div className="mt-1.5 text-right">
                <a
                  href="/forgot-password"
                  className="text-xs text-indigo-400 font-medium hover:underline"
                >
                  Forgot password?
                </a>
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-indigo-glow w-full rounded-xl py-3 font-semibold text-sm transition disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In →"}
            </button>
          </form>

          <p className="text-center text-xs text-[var(--text-muted)] mt-6">
            Don&apos;t have an account?{" "}
            <a
              href="/register"
              className="text-indigo-400 font-semibold hover:underline"
            >
              Create account
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}