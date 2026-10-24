"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") || "http://localhost:8000";

interface AnalyticsData {
  ats: {
    evaluation_count: number;
    average_score: number | null;
    latest_score: number | null;
    best_score: number | null;
    score_change: number | null;
    breakdown: {
      keyword_match: number;
      skills_match: number;
      experience_match: number;
      education_match: number;
    } | null;
    history: { date: string | null; score: number; resume_id: number | null }[];
    top_matched_skill: { name: string; evaluations: number; match_rate: number } | null;
    top_missing_keywords: { name: string; count: number }[];
  };
  applications: {
    total: number;
    active: number;
    active_companies: number;
    submitted: number;
    interviews: number;
    interview_conversion: number | null;
    status_counts: Record<string, number>;
  };
  keyword_density: {
    resume_title: string | null;
    keywords: { name: string; count: number }[];
  };
}

const STATUS_ORDER = ["Saved", "Applied", "Interviewing", "Offer", "Rejected"];
const STATUS_COLORS: Record<string, string> = {
  Saved: "bg-slate-500",
  Applied: "bg-blue-500",
  Interviewing: "bg-amber-500",
  Offer: "bg-emerald-500",
  Rejected: "bg-rose-500",
};

function Card({ title, value, sub, valueClass = "text-[var(--text-primary)]", subClass = "text-[var(--text-muted)]" }: {
  title: string;
  value: string;
  sub: string;
  valueClass?: string;
  subClass?: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5">
      <p className="text-xs text-[var(--text-muted)]">{title}</p>
      <p className={`text-3xl font-extrabold mt-2 truncate ${valueClass}`}>{value}</p>
      <p className={`text-xs mt-1 ${subClass}`}>{sub}</p>
    </div>
  );
}

function Bar({ label, value, color }: { label: string; value: number; color: string }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span>{label}</span>
        <span className="font-semibold">{pct}%</span>
      </div>
      <div className="h-2 rounded-full bg-[var(--bg-muted)] overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function Empty({ text, action, onClick }: { text: string; action: string; onClick: () => void }) {
  return (
    <div className="text-sm text-[var(--text-muted)]">
      <p>{text}</p>
      <button onClick={onClick} className="mt-3 text-blue-400 hover:underline">
        {action} →
      </button>
    </div>
  );
}

export default function AnalyticsPage() {
  const router = useRouter();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
      return;
    }

    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/v1/analytics`, {
          headers: { Authorization: `Bearer ${token}`, "bypass-tunnel-reminder": "true" },
        });
        if (res.status === 401) {
          localStorage.removeItem("access_token");
          router.push("/login");
          return;
        }
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        setData(await res.json());
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load analytics.");
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  const ats = data?.ats;
  const apps = data?.applications;
  const kd = data?.keyword_density;

  const changeText =
    ats?.score_change == null
      ? ats?.evaluation_count
        ? `${ats.evaluation_count} evaluation${ats.evaluation_count === 1 ? "" : "s"} · run more to track progress`
        : "No evaluations yet"
      : `${ats.score_change >= 0 ? "↑ +" : "↓ "}${ats.score_change}% first → latest evaluation`;

  return (
    <main className="min-h-screen bg-[var(--bg-base)] px-4 py-6 sm:px-6 md:p-12 text-[var(--text-primary)]">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-6 mb-8">
          <div>
            <button
              onClick={() => router.push("/dashboard")}
              className="text-sm text-[var(--text-muted)] hover:text-blue-400 transition mb-2"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold">Performance Analytics</h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              Visualize your resume ATS strength, keyword coverage, and application pipeline.
            </p>
          </div>
        </div>

        {loading && <p className="text-sm text-[var(--text-muted)]">Loading analytics…</p>}
        {error && (
          <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-300 mb-6">{error}</div>
        )}

        {data && ats && apps && kd && (
          <>
            {/* Top Metric Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              <Card
                title="Average ATS Score"
                value={ats.average_score != null ? `${ats.average_score}%` : "—"}
                sub={changeText}
                valueClass="text-blue-400"
                subClass={ats.score_change != null && ats.score_change < 0 ? "text-rose-400" : ats.score_change != null ? "text-emerald-400" : "text-[var(--text-muted)]"}
              />
              <Card
                title="Active Applications"
                value={String(apps.active)}
                sub={`Across ${apps.active_companies} compan${apps.active_companies === 1 ? "y" : "ies"} · ${apps.total} total`}
              />
              <Card
                title="Interview Conversion"
                value={apps.interview_conversion != null ? `${apps.interview_conversion}%` : "—"}
                sub={`${apps.interviews} interview${apps.interviews === 1 ? "" : "s"} from ${apps.submitted} submitted`}
                valueClass="text-emerald-400"
              />
              <Card
                title="Top Matched Skill"
                value={ats.top_matched_skill?.name ?? "—"}
                sub={
                  ats.top_matched_skill
                    ? `Matched in ${ats.top_matched_skill.match_rate}% of evaluations`
                    : "Run an ATS evaluation to see"
                }
                valueClass="text-blue-400 capitalize text-2xl"
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* ATS breakdown */}
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6">
                <h3 className="text-base font-semibold mb-4">ATS Compatibility Breakdown</h3>
                {ats.breakdown ? (
                  <div className="space-y-4">
                    <Bar label="Keyword Matching" value={ats.breakdown.keyword_match} color="bg-blue-500" />
                    <Bar label="Skills Match" value={ats.breakdown.skills_match} color="bg-emerald-500" />
                    <Bar label="Experience Match" value={ats.breakdown.experience_match} color="bg-blue-500" />
                    <Bar label="Education Match" value={ats.breakdown.education_match} color="bg-emerald-500" />
                    <p className="text-xs text-[var(--text-muted)] pt-1">
                      Averaged over {ats.evaluation_count} evaluation{ats.evaluation_count === 1 ? "" : "s"}.
                    </p>
                  </div>
                ) : (
                  <Empty text="No ATS evaluations yet." action="Run an ATS evaluation" onClick={() => router.push("/ats")} />
                )}
              </div>

              {/* Keyword density */}
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6">
                <h3 className="text-base font-semibold mb-1">Top Tech Keyword Density</h3>
                {kd.resume_title && (
                  <p className="text-xs text-[var(--text-muted)] mb-4">From your latest resume: {kd.resume_title}</p>
                )}
                {kd.keywords.length ? (
                  <div className="flex flex-wrap gap-2.5">
                    {kd.keywords.map((k) => (
                      <div
                        key={k.name}
                        className="rounded-xl border border-[var(--border)] bg-[var(--bg-muted)] px-3.5 py-2 flex items-center gap-2"
                      >
                        <span className="text-sm font-medium">{k.name}</span>
                        <span className="rounded bg-blue-500/20 px-1.5 py-0.5 text-xs font-bold text-blue-400">{k.count}x</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Empty
                    text="Add skills to your resume to see how often they appear."
                    action="Open Resume Builder"
                    onClick={() => router.push("/resume-builder")}
                  />
                )}
              </div>

              {/* Pipeline */}
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6">
                <h3 className="text-base font-semibold mb-4">Application Pipeline</h3>
                {apps.total ? (
                  <div className="space-y-4">
                    {[...STATUS_ORDER, ...Object.keys(apps.status_counts).filter((s) => !STATUS_ORDER.includes(s))].map(
                      (s) => (
                        <Bar
                          key={s}
                          label={`${s} (${apps.status_counts[s] ?? 0})`}
                          value={Math.round(((apps.status_counts[s] ?? 0) / apps.total) * 100)}
                          color={STATUS_COLORS[s] ?? "bg-slate-500"}
                        />
                      )
                    )}
                  </div>
                ) : (
                  <Empty text="No applications tracked yet." action="Add an application" onClick={() => router.push("/applications")} />
                )}
              </div>

              {/* Score history + missing keywords */}
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6">
                <h3 className="text-base font-semibold mb-4">ATS Score History</h3>
                {ats.history.length ? (
                  <>
                    <div className="flex items-end gap-1.5 h-32">
                      {ats.history.map((h, i) => (
                        <div
                          key={i}
                          title={`${h.score}%${h.date ? " · " + new Date(h.date).toLocaleDateString() : ""}`}
                          className="flex-1 rounded-t bg-blue-500/70 hover:bg-blue-400 transition"
                          style={{ height: `${Math.max(4, h.score)}%` }}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-[var(--text-muted)] mt-2">
                      Last {ats.history.length} evaluations · best {ats.best_score}% · latest {ats.latest_score}%
                    </p>
                    {ats.top_missing_keywords.length > 0 && (
                      <>
                        <p className="text-xs font-semibold mt-5 mb-2">Most frequently missing keywords</p>
                        <div className="flex flex-wrap gap-2">
                          {ats.top_missing_keywords.map((k) => (
                            <span key={k.name} className="rounded-lg bg-rose-500/15 px-2 py-1 text-xs text-rose-300">
                              {k.name} · {k.count}
                            </span>
                          ))}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <Empty text="Your score history will appear here." action="Run an ATS evaluation" onClick={() => router.push("/ats")} />
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
