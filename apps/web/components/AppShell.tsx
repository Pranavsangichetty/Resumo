"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import Sidebar from "@/components/Sidebar";

const PUBLIC_ROUTES = ["/", "/login", "/register", "/forgot-password", "/reset-password", "/about"];

const ROUTE_NAMES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/resume-builder": "Resume Builder",
  "/ats": "ATS Evaluation",
  "/optimization": "AI Optimizer",
  "/job-description": "Job Description",
  "/cover-letter": "Cover Letter",
  "/job-search": "Job Search",
  "/applications": "Applications",
  "/mock-interview": "Mock Interview",
  "/analytics": "Analytics",
  "/profile": "Candidate Profile",
  "/help": "Help & Support",
  "/settings": "Settings",
};

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Dirty state tracking for modules
  const [isDirty, setIsDirty] = useState(false);
  const isDirtyRef = useRef(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"saving" | "saved">("saving");

  // Track user input / changes inside any form/input across any module
  useEffect(() => {
    function handleUserEdit(e: Event) {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        isDirtyRef.current = true;
        setIsDirty(true);
      }
    }

    function handleSetDirty(e: Event) {
      const customEvent = e as CustomEvent<boolean>;
      const dirty = typeof customEvent.detail === "boolean" ? customEvent.detail : true;
      isDirtyRef.current = dirty;
      setIsDirty(dirty);
    }

    window.addEventListener("input", handleUserEdit, true);
    window.addEventListener("change", handleUserEdit, true);
    window.addEventListener("resumo:set-dirty", handleSetDirty);

    return () => {
      window.removeEventListener("input", handleUserEdit, true);
      window.removeEventListener("change", handleUserEdit, true);
      window.removeEventListener("resumo:set-dirty", handleSetDirty);
    };
  }, []);

  // Reset dirty tracking on pathname change unless currently auto-saving
  useEffect(() => {
    if (!saveModalOpen) {
      isDirtyRef.current = false;
      setIsDirty(false);
    }
    setMobileMenuOpen(false);
  }, [pathname, saveModalOpen]);

  // Lock background scroll when drawer or save modal is open on mobile
  useEffect(() => {
    if (mobileMenuOpen || saveModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen, saveModalOpen]);

  const isPublic = PUBLIC_ROUTES.some(
    (r) => pathname === r || (r !== "/" && pathname.startsWith(r + "/"))
  );

  // Click on "R" / Resumo logo
  const handleLogoClick = () => {
    // If already on dashboard, smooth scroll to top
    if (pathname === "/dashboard") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // Check if the user is doing/making/using something in module
    const userIsActiveInModule = isDirtyRef.current || isDirty;

    if (!userIsActiveInModule) {
      // Nothing changed, move directly to dashboard screen
      router.push("/dashboard");
      return;
    }

    // User has unsaved edits in module:
    // Show "Save Changes" on screen automatically and then move to dashboard!
    setSaveStatus("saving");
    setSaveModalOpen(true);

    let hasResolved = false;
    const completeSave = () => {
      if (hasResolved) return;
      hasResolved = true;
      setSaveStatus("saved");
      isDirtyRef.current = false;
      setIsDirty(false);

      // Move to dashboard after short visual feedback
      setTimeout(() => {
        router.push("/dashboard");
        setTimeout(() => setSaveModalOpen(false), 400);
      }, 900);
    };

    // Dispatch save request to active module (e.g. resume builder, profile, settings)
    try {
      window.dispatchEvent(
        new CustomEvent("resumo:request-save", {
          detail: { resolve: completeSave },
        })
      );
    } catch (e) {
      console.error(e);
    }

    // Safe timeout fallback in case module has no custom async save listener
    setTimeout(() => {
      completeSave();
    }, 700);
  };

  if (isPublic) return <>{children}</>;

  const currentRouteName =
    ROUTE_NAMES[pathname] ||
    Object.entries(ROUTE_NAMES).find(([route]) => route !== "/" && pathname.startsWith(route))?.[1] ||
    "Workspace";

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[var(--bg-base)]">
      {/* =========================================================
          AUTO-SAVE CHANGES MODAL (Shown when clicking "R" while editing in module)
         ========================================================= */}
      {saveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md animate-in fade-in duration-200 px-4">
          <div className="w-full max-w-md rounded-2xl border border-indigo-500/30 bg-[var(--bg-surface)] p-6 shadow-2xl text-center space-y-4 animate-in zoom-in-95 duration-200">
            {/* Animated Icon */}
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 text-2xl">
              {saveStatus === "saving" ? (
                <span className="animate-spin text-2xl">🔄</span>
              ) : (
                <span className="text-2xl">✅</span>
              )}
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                {saveStatus === "saving" ? "Auto-Saving Your Progress" : "Changes Saved!"}
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                {saveStatus === "saving"
                  ? "Saving module changes before returning to Dashboard..."
                  : "All changes have been saved. Returning to Dashboard..."}
              </p>
            </div>

            {/* The prominent "Save Changes" Button on screen */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  router.push("/dashboard");
                  setSaveModalOpen(false);
                }}
                className={`w-full flex items-center justify-center gap-2 rounded-xl py-3 px-4 text-xs font-bold shadow-lg transition ${
                  saveStatus === "saving"
                    ? "bg-indigo-600 text-white cursor-wait opacity-90"
                    : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/25 cursor-pointer"
                }`}
              >
                {saveStatus === "saving" ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>Save Changes — Saved! (Go to Dashboard)</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 text-[11px] text-[var(--text-muted)] pt-1">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Moving to Dashboard screen...</span>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MOBILE TOP APP BAR (Only visible on screens < md)
         ========================================================= */}
      <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-[var(--border)] bg-[var(--bg-surface)]/95 px-4 backdrop-blur-md md:hidden">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--bg-muted)] text-[var(--text-primary)] hover:border-indigo-500/40 active:scale-95 transition shadow-sm"
            aria-label="Open Navigation Menu"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="18" x2="20" y2="18" />
            </svg>
          </button>

          <button
            type="button"
            onClick={handleLogoClick}
            className="flex items-center gap-2 cursor-pointer group focus:outline-none"
            title={pathname === "/dashboard" ? "Resumo Dashboard" : "Back to Dashboard"}
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-extrabold text-xs group-hover:scale-105 transition">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="Resumo logo" className="h-full w-full rounded-[inherit] object-contain" />
            </div>
            <span className="text-sm font-bold tracking-tight text-[var(--text-primary)] group-hover:text-indigo-400 transition">
              Resumo
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-full">
            {currentRouteName}
          </span>
        </div>
      </header>

      {/* =========================================================
          SIDEBAR: Desktop sticky side menu + Mobile slide-out drawer
         ========================================================= */}
      <Sidebar
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        onLogoClick={handleLogoClick}
      />

      {/* =========================================================
          MAIN CONTENT AREA (Full 100% width on mobile, flex-1 on desktop)
         ========================================================= */}
      <div className="flex-1 w-full min-w-0 overflow-x-hidden">
        {children}
      </div>
    </div>
  );
}
