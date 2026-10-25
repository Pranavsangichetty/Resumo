"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter, notFound } from "next/navigation";
import {
  Users,
  FileText,
  Briefcase,
  Activity,
  Search,
  Shield,
  ShieldAlert,
  UserCheck,
  UserX,
  ExternalLink,
  RefreshCw,
  Mail,
  Calendar,
  Sparkles,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") || "http://localhost:8000";

interface AdminMetrics {
  total_users: number;
  active_users: number;
  verified_users: number;
  total_resumes: number;
  total_applications: number;
  total_ats_scans: number;
}

interface AdminUserItem {
  id: number;
  name: string | null;
  email: string;
  auth_provider: string;
  is_active: boolean;
  is_verified: boolean;
  is_admin: boolean;
  avatar_url?: string | null;
  resumes_count: number;
  applications_count: number;
  ats_scans_count: number;
  created_at: string | null;
  updated_at: string | null;
}

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState<"all" | "admin" | "active" | "suspended">("all");
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isForbidden, setIsForbidden] = useState(false);

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }

  async function fetchAdminData() {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.replace("/login");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Fetch overview metrics
      const overviewRes = await fetch(`${API_URL}/api/v1/admin/overview`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "bypass-tunnel-reminder": "true",
        },
      });

      if (overviewRes.status === 401) {
        localStorage.removeItem("access_token");
        router.replace("/login");
        return;
      }

      if (overviewRes.status === 403) {
        setIsForbidden(true);
        setLoading(false);
        return;
      }

      if (!overviewRes.ok) {
        throw new Error(`Failed to load metrics (${overviewRes.status})`);
      }

      const overviewData = await overviewRes.json();
      setMetrics(overviewData.metrics);

      // 2. Fetch users list
      const usersRes = await fetch(`${API_URL}/api/v1/admin/users?limit=300`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "bypass-tunnel-reminder": "true",
        },
      });

      if (!usersRes.ok) {
        throw new Error(`Failed to load users (${usersRes.status})`);
      }

      const usersData = await usersRes.json();
      setUsers(usersData.users || []);
    } catch (err: any) {
      setError(err?.message || "Failed to load admin dashboard data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAdminData();
  }, []);

  async function toggleUserStatus(userItem: AdminUserItem) {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    if (userItem.is_admin && userItem.is_active) {
      alert("Admin accounts cannot be suspended.");
      return;
    }

    const nextStatus = !userItem.is_active;
    const confirmMsg = nextStatus
      ? `Activate access for ${userItem.email}?`
      : `Suspend account for ${userItem.email}? They will no longer be able to log in.`;

    if (!confirm(confirmMsg)) return;

    setUpdatingUserId(userItem.id);
    try {
      const res = await fetch(`${API_URL}/api/v1/admin/users/${userItem.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "bypass-tunnel-reminder": "true",
        },
        body: JSON.stringify({ is_active: nextStatus }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || `Failed to update (${res.status})`);
      }

      setUsers((prev) =>
        prev.map((u) => (u.id === userItem.id ? { ...u, is_active: nextStatus } : u))
      );
      showToast(`User ${userItem.email} set to ${nextStatus ? "Active" : "Suspended"}`);
    } catch (err: any) {
      alert(err.message || "Failed to update user status.");
    } finally {
      setUpdatingUserId(null);
    }
  }

  // Filtered user list
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.name && u.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        String(u.id).includes(searchQuery);

      if (!matchesSearch) return false;

      if (filterRole === "admin") return u.is_admin;
      if (filterRole === "active") return u.is_active;
      if (filterRole === "suspended") return !u.is_active;

      return true;
    });
  }, [users, searchQuery, filterRole]);

  if (isForbidden) {
    notFound();
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--bg-base)] px-4 py-8 text-[var(--text-primary)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
          <p className="text-sm text-[var(--text-muted)] font-medium">Loading Administrator Hub…</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[var(--bg-base)] px-4 py-12 text-[var(--text-primary)] flex items-center justify-center">
        <div className="max-w-md w-full rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-center shadow-xl">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/20 text-red-400 mb-3">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-bold text-red-300">Restricted Access</h2>
          <p className="text-sm text-red-200/80 mt-2">{error}</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[var(--bg-surface)] px-4 py-2 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)] transition border border-[var(--border)]"
          >
            ← Return to Dashboard
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--bg-base)] px-4 py-6 sm:px-6 md:p-8 text-[var(--text-primary)]">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-6 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold text-amber-400">
                <Shield className="h-3.5 w-3.5" />
                Creator & Admin Workspace
              </span>
              <span className="text-xs text-[var(--text-muted)] font-medium">
                Confidential · Invisible to regular users
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Project Management & User Directory</h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              Real-time monitoring of users who signed up, resumes built, and system platform activity.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchAdminData}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-3.5 py-2 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)] transition shadow-sm cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-white hover:bg-[var(--accent-hover)] transition shadow-sm cursor-pointer"
            >
              Back to Dashboard →
            </button>
          </div>
        </div>

        {/* Metric Cards */}
        {metrics && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6 mb-8">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 shadow-sm">
              <div className="flex items-center justify-between text-[var(--text-muted)] mb-2">
                <span className="text-xs font-medium uppercase tracking-wider">Total Users</span>
                <Users className="h-4 w-4 text-indigo-400" />
              </div>
              <p className="text-3xl font-extrabold text-[var(--text-primary)]">{metrics.total_users}</p>
              <p className="text-xs text-emerald-400 mt-1 font-medium">{metrics.active_users} active accounts</p>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 shadow-sm">
              <div className="flex items-center justify-between text-[var(--text-muted)] mb-2">
                <span className="text-xs font-medium uppercase tracking-wider">Resumes Created</span>
                <FileText className="h-4 w-4 text-blue-400" />
              </div>
              <p className="text-3xl font-extrabold text-blue-400">{metrics.total_resumes}</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">Built across all users</p>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 shadow-sm">
              <div className="flex items-center justify-between text-[var(--text-muted)] mb-2">
                <span className="text-xs font-medium uppercase tracking-wider">ATS Scans Run</span>
                <Activity className="h-4 w-4 text-amber-400" />
              </div>
              <p className="text-3xl font-extrabold text-amber-400">{metrics.total_ats_scans}</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">Evaluations scored</p>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 shadow-sm">
              <div className="flex items-center justify-between text-[var(--text-muted)] mb-2">
                <span className="text-xs font-medium uppercase tracking-wider">Jobs Tracked</span>
                <Briefcase className="h-4 w-4 text-emerald-400" />
              </div>
              <p className="text-3xl font-extrabold text-emerald-400">{metrics.total_applications}</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">Pipeline applications</p>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 shadow-sm">
              <div className="flex items-center justify-between text-[var(--text-muted)] mb-2">
                <span className="text-xs font-medium uppercase tracking-wider">Verified Emails</span>
                <UserCheck className="h-4 w-4 text-teal-400" />
              </div>
              <p className="text-3xl font-extrabold text-teal-400">{metrics.verified_users}</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">Confirmed signups</p>
            </div>

            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 shadow-sm">
              <div className="flex items-center justify-between text-amber-400/80 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Admin Staff</span>
                <Shield className="h-4 w-4 text-amber-400" />
              </div>
              <p className="text-3xl font-extrabold text-amber-400">
                {users.filter((u) => u.is_admin).length}
              </p>
              <p className="text-xs text-amber-400/70 mt-1 font-medium">Authorized creators</p>
            </div>
          </div>
        )}

        {/* Users Section */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 sm:p-6 shadow-sm">
          {/* Controls bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-bold">Registered Users ({filteredUsers.length})</h2>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Inspect user accounts, usage statistics, and toggle activation status.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative min-w-[240px] flex-1 sm:flex-initial">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search name, email or ID…"
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-muted)] pl-9 pr-3 py-1.5 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none focus:border-amber-500 transition"
                />
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center rounded-xl border border-[var(--border)] bg-[var(--bg-muted)] p-1 text-xs">
                {(
                  [
                    { key: "all", label: "All Users" },
                    { key: "admin", label: "Admins" },
                    { key: "active", label: "Active" },
                    { key: "suspended", label: "Suspended" },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setFilterRole(tab.key)}
                    className={`rounded-lg px-2.5 py-1 font-medium transition cursor-pointer ${
                      filterRole === tab.key
                        ? "bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm font-semibold"
                        : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--bg-muted)] text-[var(--text-muted)] border-b border-[var(--border)] uppercase tracking-wider text-[11px] font-semibold">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Auth Provider</th>
                  <th className="py-3 px-4 text-center">Resumes</th>
                  <th className="py-3 px-4 text-center">ATS Scans</th>
                  <th className="py-3 px-4 text-center">Applications</th>
                  <th className="py-3 px-4">Joined Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)] bg-[var(--bg-surface)]">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-10 text-center text-sm text-[var(--text-muted)]">
                      No users match your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-[var(--bg-surface-elevated)]/60 transition">
                      {/* User */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-500/15 text-indigo-400 font-bold text-xs uppercase overflow-hidden border border-indigo-500/20">
                            {u.avatar_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={u.avatar_url} alt="" className="h-full w-full object-cover" />
                            ) : u.name ? (
                              u.name[0]
                            ) : (
                              u.email[0]
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-[var(--text-primary)] truncate max-w-[200px]">
                              {u.name || "Unnamed User"}
                            </p>
                            <p className="text-[11px] text-[var(--text-muted)] truncate max-w-[200px]">
                              {u.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-3 px-4">
                        {u.is_admin ? (
                          <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-400">
                            <Shield className="h-3 w-3" />
                            Creator / Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-md border border-slate-500/30 bg-slate-500/10 px-2 py-0.5 text-[10px] font-medium text-[var(--text-muted)]">
                            User
                          </span>
                        )}
                      </td>

                      {/* Auth Provider */}
                      <td className="py-3 px-4">
                        <span className="capitalize text-[var(--text-secondary)] font-medium">
                          {u.auth_provider === "google" ? "Google OAuth" : "Email & Password"}
                        </span>
                      </td>

                      {/* Resumes */}
                      <td className="py-3 px-4 text-center font-semibold text-blue-400">
                        {u.resumes_count}
                      </td>

                      {/* ATS Scans */}
                      <td className="py-3 px-4 text-center font-semibold text-amber-400">
                        {u.ats_scans_count}
                      </td>

                      {/* Applications */}
                      <td className="py-3 px-4 text-center font-semibold text-emerald-400">
                        {u.applications_count}
                      </td>

                      {/* Joined Date */}
                      <td className="py-3 px-4 text-[var(--text-muted)]">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        {u.is_active ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 border border-red-500/30 px-2 py-0.5 text-[10px] font-semibold text-red-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                            Suspended
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        {u.is_admin ? (
                          <span className="text-[10px] text-[var(--text-muted)] font-medium">
                            Protected
                          </span>
                        ) : (
                          <button
                            type="button"
                            disabled={updatingUserId === u.id}
                            onClick={() => toggleUserStatus(u)}
                            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-medium transition cursor-pointer ${
                              u.is_active
                                ? "border border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20"
                                : "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
                            } disabled:opacity-50`}
                          >
                            {updatingUserId === u.id ? (
                              "Updating…"
                            ) : u.is_active ? (
                              <>
                                <UserX className="h-3 w-3" />
                                Suspend
                              </>
                            ) : (
                              <>
                                <UserCheck className="h-3 w-3" />
                                Activate
                              </>
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl border border-emerald-500/40 bg-emerald-950 px-4 py-2.5 text-xs font-semibold text-emerald-200 shadow-xl">
          ✓ {toastMessage}
        </div>
      )}
    </main>
  );
}
