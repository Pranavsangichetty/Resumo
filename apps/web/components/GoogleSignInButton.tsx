"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface GoogleSignInButtonProps {
  mode?: "signin" | "signup";
  onError?: (err: string) => void;
}

declare global {
  interface Window {
    google?: any;
    onGoogleLibraryLoad?: () => void;
  }
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

export default function GoogleSignInButton({
  mode = "signin",
  onError,
}: GoogleSignInButtonProps) {
  const router = useRouter();
  const buttonRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [showConfigNotice, setShowConfigNotice] = useState(false);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;

    // Load Google Identity Services script if not already present
    if (!document.getElementById("google-gsi-client")) {
      const script = document.createElement("script");
      script.id = "google-gsi-client";
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogle;
      document.body.appendChild(script);
    } else if (window.google?.accounts?.id) {
      initializeGoogle();
    }

    function initializeGoogle() {
      if (!window.google?.accounts?.id || !buttonRef.current) return;

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleCredential,
      });

      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: "outline",
        size: "large",
        type: "standard",
        text: mode === "signup" ? "signup_with" : "signin_with",
        shape: "rectangular",
        logo_alignment: "center",
        width: 384,
      });
    }
  }, [mode]);

  async function handleGoogleCredential(response: any) {
    if (!response?.credential) {
      onError?.("No credential received from Google.");
      return;
    }

    setLoading(true);
    try {
      // 1. Try same-origin Next.js proxy route first (zero CORS, server-to-server)
      let res: Response | null = await fetch("/api/auth/google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ credential: response.credential }),
      }).catch(() => null);

      // 2. If proxy route is not found (e.g. running on local standalone server), fallback to direct API
      if (!res || res.status === 404) {
        res = await fetch(`${API_URL}/api/v1/auth/google`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ credential: response.credential }),
        });
      }

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        onError?.(data.detail || data.message || "Google authentication failed.");
        return;
      }

      if (!data.access_token) {
        onError?.("No access token returned by authentication server.");
        return;
      }

      localStorage.setItem("access_token", data.access_token);
      router.push("/dashboard");
    } catch (err: any) {
      console.error("[GoogleAuth] Error during credential exchange:", err);
      onError?.(err?.message || "Failed to communicate with authentication server.");
    } finally {
      setLoading(false);
    }
  }

  function handleFallbackClick() {
    if (!GOOGLE_CLIENT_ID) {
      setShowConfigNotice(true);
      return;
    }

    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    }
  }

  return (
    <div className="w-full space-y-2">
      {GOOGLE_CLIENT_ID ? (
        <div className="w-full flex justify-center">
          <div ref={buttonRef} className="w-full flex justify-center" />
        </div>
      ) : (
        <button
          type="button"
          onClick={handleFallbackClick}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-muted)] hover:bg-[var(--bg-surface)] py-3 px-4 text-sm font-medium text-[var(--text-primary)] transition hover:border-indigo-500/40 shadow-sm"
        >
          <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>
            {mode === "signup" ? "Sign up with Google" : "Sign in with Google"}
          </span>
        </button>
      )}

      {showConfigNotice && (
        <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-3.5 text-xs text-indigo-300 leading-relaxed">
          <p className="font-semibold text-indigo-200 mb-1">
            Google Sign-In Ready
          </p>
          <p className="text-indigo-300/90">
            To activate Google Sign-In with your Google credentials, add{" "}
            <code className="bg-indigo-950/60 px-1 py-0.5 rounded text-[11px] font-mono">
              NEXT_PUBLIC_GOOGLE_CLIENT_ID
            </code>{" "}
            in your Vercel Environment Variables.
          </p>
          <button
            type="button"
            onClick={() => setShowConfigNotice(false)}
            className="mt-2 text-xs font-semibold text-indigo-400 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}
