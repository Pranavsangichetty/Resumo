"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface ApplicationItem {
  id: number;
  company: string;
  position: string;
  location?: string;
  status: string;
  salary?: string;
  applied_date?: string;
  job_url?: string;
  notes?: string;
}

const STATUS_LIST = ["Saved", "Applied", "Interviewing", "Offer", "Rejected"];

export default function ApplicationsPage() {
  const router = useRouter();

  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);

  // New Application Modal State
  const [showModal, setShowModal] = useState(false);
  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState("Applied");
  const [salary, setSalary] = useState("");
  const [appliedDate, setAppliedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [jobUrl, setJobUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadApplications();
  }, []);

  async function loadApplications() {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/v1/applications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const list = await res.json();
        setApplications(list);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const token = localStorage.getItem("access_token");
    if (!token) return;

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/applications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          company,
          position,
          location,
          status,
          salary,
          applied_date: appliedDate,
          job_url: jobUrl,
          notes,
        }),
      });

      if (res.ok) {
        setShowModal(false);
        setCompany("");
        setPosition("");
        setLocation("");
        setSalary("");
        setJobUrl("");
        setNotes("");
        await loadApplications();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStatusChange(id: number, newStatus: string) {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/api/v1/applications/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setApplications(
          applications.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
        );
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this application?")) return;
    const token = localStorage.getItem("access_token");
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/api/v1/applications/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok || res.status === 204) {
        setApplications(applications.filter((a) => a.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-[var(--border)] bg-[var(--bg-muted)] px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none transition focus:border-blue-500";

  return (
    <main className="min-h-screen bg-[var(--bg-base)] p-8 md:p-12 text-[var(--text-primary)]">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-6 mb-8">
          <div>
            <button
              onClick={() => router.push("/dashboard")}
              className="text-sm text-[var(--text-muted)] hover:text-blue-400 transition mb-2"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold">Applications Tracker</h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              Track interviews, follow-ups, offers, and job submissions in one unified view.
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            ＋ Add Application
          </button>
        </div>

        {/* Kanban Columns */}
        <div className="grid gap-4 md:grid-cols-5">
          {STATUS_LIST.map((colStatus) => {
            const colApps = applications.filter((a) => a.status === colStatus);
            return (
              <div
                key={colStatus}
                className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 flex flex-col min-h-[500px]"
              >
                <div className="flex items-center justify-between border-b border-[var(--border)] pb-3 mb-3">
                  <h3 className="text-sm font-semibold">{colStatus}</h3>
                  <span className="rounded-full bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 text-xs text-blue-400 font-bold">
                    {colApps.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto">
                  {colApps.map((app) => (
                    <div
                      key={app.id}
                      className="rounded-xl border border-[var(--border)] bg-[var(--bg-muted)] p-3.5 space-y-2 hover:border-blue-500/40 transition"
                    >
                      <div className="flex items-start justify-between">
                        <h4 className="font-semibold text-sm text-[var(--text-primary)]">
                          {app.position}
                        </h4>
                        <button
                          onClick={() => handleDelete(app.id)}
                          className="text-xs text-[var(--text-muted)] hover:text-red-400"
                        >
                          ✕
                        </button>
                      </div>

                      <p className="text-xs font-medium text-blue-400">{app.company}</p>

                      {app.location && (
                        <p className="text-xs text-[var(--text-muted)]">📍 {app.location}</p>
                      )}

                      {app.salary && (
                        <p className="text-xs text-emerald-400 font-medium">💰 {app.salary}</p>
                      )}

                      <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between">
                        <select
                          value={app.status}
                          onChange={(e) => handleStatusChange(app.id, e.target.value)}
                          className="text-xs bg-transparent border border-[var(--border)] rounded px-2 py-1 text-[var(--text-muted)]"
                        >
                          {STATUS_LIST.map((s) => (
                            <option key={s} value={s}>
                              Move: {s}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}

                  {colApps.length === 0 && (
                    <p className="text-center text-xs text-[var(--text-muted)] py-6">
                      No jobs in {colStatus.toLowerCase()}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Add Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6 shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-[var(--border)] mb-4">
                <h2 className="text-lg font-bold">Add Job Application</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-[var(--text-muted)] hover:text-white"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="e.g. Google"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
                      Job Position *
                    </label>
                    <input
                      type="text"
                      required
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      placeholder="e.g. Software Engineer"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Remote / New York"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
                      Initial Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className={inputClass}
                    >
                      {STATUS_LIST.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
                      Salary / Comp Range
                    </label>
                    <input
                      type="text"
                      value={salary}
                      onChange={(e) => setSalary(e.target.value)}
                      placeholder="$120k - $150k"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
                      Date Applied
                    </label>
                    <input
                      type="date"
                      value={appliedDate}
                      onChange={(e) => setAppliedDate(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
                    Job Posting URL
                  </label>
                  <input
                    type="url"
                    value={jobUrl}
                    onChange={(e) => setJobUrl(e.target.value)}
                    placeholder="https://..."
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
                    Notes
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Recruiter contact, referral details, key takeaways..."
                    className={inputClass}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border)]">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="rounded-xl border border-[var(--border)] px-4 py-2 text-xs font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
                  >
                    {submitting ? "Saving..." : "Save Application"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
