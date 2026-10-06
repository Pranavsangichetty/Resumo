"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface UserProfile {
  id: number;
  name: string;
  email: string;
}

interface UserSettings {
  theme: string;
  target_ats_score: number;
  resume_length: string;
  max_optimization_attempts: number;
  notifications_enabled: boolean;
}

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [settings, setSettings] = useState<UserSettings>({
    theme: "dark",
    target_ats_score: 85,
    resume_length: "one_page",
    max_optimization_attempts: 3,
    notifications_enabled: true,
  });

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState({ text: "", isError: false });
  const [settingsMessage, setSettingsMessage] = useState({ text: "", isError: false });

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    async function loadData() {
      const token = localStorage.getItem("access_token");
      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        // Load User Me
        const resUser = await fetch(`${API_URL}/api/v1/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (resUser.ok) {
          const userData = await resUser.json();
          setProfile(userData);
          setName(userData.name || "");
          setEmail(userData.email || "");
        } else {
          router.replace("/login");
          return;
        }

        // Load Settings (but DON'T override the local theme — localStorage is the source of truth)
        const resSettings = await fetch(`${API_URL}/api/v1/settings`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (resSettings.ok) {
          const settingsData = await resSettings.json();
          // Keep the current local theme instead of overriding from backend
          const currentTheme = resolvedTheme || "dark";
          setSettings({ ...settingsData, theme: currentTheme });
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  function handleThemeToggle(newTheme: "light" | "dark") {
    setTheme(newTheme);
    setSettings((prev) => ({ ...prev, theme: newTheme }));
  }

  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    const token = localStorage.getItem("access_token");
    if (!token) return;

    setSavingSettings(true);
    setSettingsMessage({ text: "", isError: false });

    try {
      const res = await fetch(`${API_URL}/api/v1/settings`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });

      if (!res.ok) throw new Error("Failed to save settings");
      const updated = await res.json();
      setSettings(updated);
      setSettingsMessage({ text: "Preferences saved successfully!", isError: false });
    } catch (err) {
      setSettingsMessage({ text: "Could not save preferences.", isError: true });
    } finally {
      setSavingSettings(false);
    }
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    const token = localStorage.getItem("access_token");
    if (!token) return;

    if (newPassword && newPassword !== confirmNewPassword) {
      setProfileMessage({ text: "New passwords do not match.", isError: true });
      return;
    }

    setSavingProfile(true);
    setProfileMessage({ text: "", isError: false });

    try {
      const body: any = { name, email };
      if (newPassword) {
        body.current_password = currentPassword;
        body.new_password = newPassword;
      }

      const res = await fetch(`${API_URL}/api/v1/settings/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Failed to update profile");
      }

      setProfile({ id: data.id, name: data.name, email: data.email });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setProfileMessage({ text: "Profile updated successfully!", isError: false });
    } catch (err: any) {
      setProfileMessage({ text: err.message || "Failed to update profile", isError: true });
    } finally {
      setSavingProfile(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-[var(--border)] bg-[var(--bg-muted)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

  // Read the persisted theme from localStorage so there's no flash before hydration
  const activeTheme = mounted
    ? resolvedTheme
    : (typeof window !== "undefined"
        ? localStorage.getItem("resumo-theme") || "dark"
        : "dark");

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--bg-base)]">
        <p className="text-[var(--text-muted)]">Loading settings...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--bg-base)] p-8 md:p-12 text-[var(--text-primary)]">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 border-b border-[var(--border)] pb-6 mb-8">
          <div>
            <button
              onClick={() => router.push("/dashboard")}
              className="text-sm text-[var(--text-muted)] hover:text-[var(--accent)] transition mb-2"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold">Account & System Settings</h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              Manage your personal details, AI target ATS preferences, and workspace experience.
            </p>
          </div>
        </div>

        <div className="grid gap-8">
          {/* ─── Theme Appearance Section ─── */}
          <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6 md:p-8 transition-colors">
            <div className="flex items-center gap-3 mb-1">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-lg">
                🎨
              </div>
              <h2 className="text-xl font-semibold">Appearance</h2>
            </div>
            <p className="text-sm text-[var(--text-muted)] mb-6 ml-12">
              Choose your preferred workspace theme. Changes apply instantly.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Light Mode Card */}
              <button
                type="button"
                onClick={() => handleThemeToggle("light")}
                className={`group relative flex flex-col items-center gap-4 rounded-xl border-2 p-5 transition-all duration-300 ${
                  activeTheme === "light"
                    ? "border-indigo-500 bg-indigo-500/5 shadow-lg shadow-indigo-500/10"
                    : "border-[var(--border)] hover:border-[var(--border-hover)] bg-[var(--bg-muted)]"
                }`}
              >
                {/* Active indicator */}
                {activeTheme === "light" && (
                  <div className="absolute top-3 right-3 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-500/30">
                    ✓
                  </div>
                )}

                {/* Light preview swatch */}
                <div className="w-full rounded-lg overflow-hidden border border-slate-200 shadow-sm">
                  <div className="h-3 bg-slate-100 flex items-center gap-1 px-2">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-400"></span>
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-yellow-400"></span>
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-400"></span>
                  </div>
                  <div className="bg-white p-3 space-y-1.5">
                    <div className="h-2 w-3/4 rounded bg-slate-200"></div>
                    <div className="h-2 w-1/2 rounded bg-slate-100"></div>
                    <div className="flex gap-1.5 mt-2">
                      <div className="h-5 w-12 rounded bg-indigo-500"></div>
                      <div className="h-5 w-12 rounded bg-slate-100"></div>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <span className="flex items-center justify-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    Light Mode
                  </span>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    Clean, bright workspace
                  </p>
                </div>
              </button>

              {/* Dark Mode Card */}
              <button
                type="button"
                onClick={() => handleThemeToggle("dark")}
                className={`group relative flex flex-col items-center gap-4 rounded-xl border-2 p-5 transition-all duration-300 ${
                  activeTheme === "dark"
                    ? "border-indigo-500 bg-indigo-500/5 shadow-lg shadow-indigo-500/10"
                    : "border-[var(--border)] hover:border-[var(--border-hover)] bg-[var(--bg-muted)]"
                }`}
              >
                {/* Active indicator */}
                {activeTheme === "dark" && (
                  <div className="absolute top-3 right-3 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-500/30">
                    ✓
                  </div>
                )}

                {/* Dark preview swatch */}
                <div className="w-full rounded-lg overflow-hidden border border-slate-700 shadow-sm">
                  <div className="h-3 bg-[#161926] flex items-center gap-1 px-2">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-400"></span>
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-yellow-400"></span>
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-400"></span>
                  </div>
                  <div className="bg-[#090a0f] p-3 space-y-1.5">
                    <div className="h-2 w-3/4 rounded bg-[#1f2438]"></div>
                    <div className="h-2 w-1/2 rounded bg-[#161926]"></div>
                    <div className="flex gap-1.5 mt-2">
                      <div className="h-5 w-12 rounded bg-indigo-500"></div>
                      <div className="h-5 w-12 rounded bg-[#1f2438]"></div>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <span className="flex items-center justify-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                    Dark Mode
                  </span>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    Premium obsidian experience
                  </p>
                </div>
              </button>
            </div>
          </section>

          {/* ─── Profile Section ─── */}
          <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6 md:p-8 transition-colors">
            <h2 className="text-xl font-semibold mb-1">Personal Profile</h2>
            <p className="text-sm text-[var(--text-muted)] mb-6">
              Update your basic information and login credentials.
            </p>

            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium mb-2 text-[var(--text-muted)]">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-[var(--text-muted)]">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="border-t border-[var(--border)] pt-5 mt-5">
                <h3 className="text-sm font-medium text-[var(--text-primary)] mb-3">
                  Change Password (optional)
                </h3>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="block text-xs text-[var(--text-muted)] mb-1">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--text-muted)] mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min. 8 characters"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--text-muted)] mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              {profileMessage.text && (
                <div
                  className={`rounded-lg p-3 text-sm border ${
                    profileMessage.isError
                      ? "border-red-500/30 bg-red-500/10 text-red-400"
                      : "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                  }`}
                >
                  {profileMessage.text}
                </div>
              )}

              <button
                type="submit"
                disabled={savingProfile}
                className="rounded-xl bg-[var(--accent)] px-6 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--accent-hover)] disabled:opacity-50"
              >
                {savingProfile ? "Saving Profile..." : "Save Profile Changes"}
              </button>
            </form>
          </section>

          {/* ─── AI & Resume Preferences ─── */}
          <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6 md:p-8 transition-colors">
            <h2 className="text-xl font-semibold mb-1">AI & ATS Preferences</h2>
            <p className="text-sm text-[var(--text-muted)] mb-6">
              Customize how AI optimization scores and analyzes your resumes.
            </p>

            <form onSubmit={handleSaveSettings} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium mb-1 text-[var(--text-muted)]">
                    Target ATS Score Threshold ({settings.target_ats_score}%)
                  </label>
                  <p className="text-xs text-[var(--text-muted)] mb-3">
                    Goal score the optimizer aims for against job requirements.
                  </p>
                  <input
                    type="range"
                    min="60"
                    max="98"
                    value={settings.target_ats_score}
                    onChange={(e) =>
                      setSettings({ ...settings, target_ats_score: Number(e.target.value) })
                    }
                    className="w-full accent-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-[var(--text-muted)]">
                    Default Resume Length
                  </label>
                  <p className="text-xs text-[var(--text-muted)] mb-3">
                    Target page constraint for AI summary and experience layout.
                  </p>
                  <select
                    value={settings.resume_length}
                    onChange={(e) =>
                      setSettings({ ...settings, resume_length: e.target.value })
                    }
                    className={inputClass}
                  >
                    <option value="one_page">Strict 1 Page (Industry Standard)</option>
                    <option value="two_page">2 Pages (Senior / Executive)</option>
                    <option value="academic">Academic / CV (Unlimited)</option>
                  </select>
                </div>
              </div>

              <div className="border-t border-[var(--border)] pt-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-[var(--text-primary)]">
                      Notification Alerts
                    </h3>
                    <p className="text-xs text-[var(--text-muted)]">
                      Receive optimization completion and ATS scan status tips.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.notifications_enabled}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        notifications_enabled: e.target.checked,
                      })
                    }
                    className="h-5 w-5 rounded border-gray-600 bg-gray-700 text-indigo-600 accent-indigo-600"
                  />
                </div>
              </div>

              {settingsMessage.text && (
                <div
                  className={`rounded-lg p-3 text-sm border ${
                    settingsMessage.isError
                      ? "border-red-500/30 bg-red-500/10 text-red-400"
                      : "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                  }`}
                >
                  {settingsMessage.text}
                </div>
              )}

              <button
                type="submit"
                disabled={savingSettings}
                className="rounded-xl bg-[var(--accent)] px-6 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--accent-hover)] disabled:opacity-50"
              >
                {savingSettings ? "Saving Preferences..." : "Save Preferences"}
              </button>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}
