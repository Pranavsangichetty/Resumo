"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile drawer on route navigation
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Lock background scroll when drawer is open on mobile
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const isPublic = PUBLIC_ROUTES.some(
    (r) => pathname === r || (r !== "/" && pathname.startsWith(r + "/"))
  );

  if (isPublic) return <>{children}</>;

  const currentRouteName =
    ROUTE_NAMES[pathname] ||
    Object.entries(ROUTE_NAMES).find(([route]) => route !== "/" && pathname.startsWith(route))?.[1] ||
    "Workspace";

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[var(--bg-base)]">
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

          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-extrabold text-xs">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="Resumo logo" className="h-full w-full rounded-[inherit] object-contain" />
            </div>
            <span className="text-sm font-bold tracking-tight text-[var(--text-primary)]">
              Resumo
            </span>
          </div>
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
