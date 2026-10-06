"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const NAV = [
  { label: "Dashboard", href: "/dashboard", icon: "⌘" },
  { label: "Resume Builder", href: "/resume-builder", icon: "📄" },
  { label: "ATS Evaluation", href: "/ats", icon: "⚡" },
  { label: "AI Optimizer", href: "/optimization", icon: "✦" },
  { label: "Job Description", href: "/job-description", icon: "🎯" },
  { label: "Cover Letter", href: "/cover-letter", icon: "✉" },
  { label: "Job Search", href: "/job-search", icon: "💼" },
  { label: "Applications", href: "/applications", icon: "📊" },
  { label: "Mock Interview", href: "/mock-interview", icon: "🎙" },
  { label: "Analytics", href: "/analytics", icon: "📈" },
];

interface UserInfo {
  id: number;
  name?: string;
  email: string;
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    fetch(`${API_URL}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => data && setUser(data))
      .catch(() => {});
  }, []);

  function handleLogout() {
    localStorage.removeItem("access_token");
    router.replace("/login");
  }

  return (
    <aside
      className={`sticky top-0 h-screen shrink-0 flex flex-col bg-[var(--bg-surface)] border-r border-[var(--border)] transition-all duration-200 ${
        collapsed ? "w-[60px]" : "w-[220px]"
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-5 border-b border-[var(--border)]">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-extrabold text-sm">
          R
        </div>
        {!collapsed && (
          <span className="text-sm font-bold text-[var(--text-primary)] tracking-tight">
            Resumo
          </span>
        )}
      </div>

      {/* Nav links */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {NAV.filter((item) =>
          pathname === "/dashboard" ? item.href === "/dashboard" : true
        ).map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={`
                w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] font-medium transition
                ${
                  active
                    ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                    : "text-[var(--text-secondary)] hover:bg-[var(--bg-surface-elevated)] hover:text-[var(--text-primary)] border border-transparent"
                }
              `}
            >
              <span className="text-base shrink-0">{item.icon}</span>
              {!collapsed && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="border-t border-[var(--border)] p-2 space-y-0.5">
        <button
          onClick={() => router.push("/help")}
          className={`w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] font-medium transition ${
            pathname === "/help"
              ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
              : "text-[var(--text-secondary)] hover:bg-[var(--bg-surface-elevated)] hover:text-[var(--text-primary)] border border-transparent"
          }`}
        >
          <span className="text-base shrink-0">?</span>
          {!collapsed && <span>Help & Support</span>}
        </button>
        <button
          onClick={() => router.push("/settings")}
          className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-surface-elevated)] hover:text-[var(--text-primary)] transition"
        >
          <span className="text-base shrink-0">⚙</span>
          {!collapsed && <span>Settings</span>}
        </button>
      </div>

      {/* Separator with collapse toggle */}
      <div className="relative mx-2">
        <hr className="border-[var(--border)]" />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -top-3 -right-3 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-muted)] hover:text-indigo-400 hover:border-indigo-500/40 shadow-sm transition z-10"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            {collapsed ? (
              <polyline points="9 18 15 12 9 6" />
            ) : (
              <polyline points="15 18 9 12 15 6" />
            )}
          </svg>
        </button>
      </div>

      {/* User + Logout */}
      {user && (
        <div className="px-3 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-500/15 text-indigo-400 text-xs font-bold uppercase">
              {user.name ? user.name[0] : user.email[0]}
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-[var(--text-primary)] truncate">
                  {user.name || "User"}
                </p>
                <p className="text-[10px] text-[var(--text-muted)] truncate">
                  ID: {user.id} · {user.email}
                </p>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="shrink-0 rounded-md p-1.5 text-[var(--text-muted)] hover:bg-red-500/10 hover:text-red-400 transition"
              title="Logout"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
