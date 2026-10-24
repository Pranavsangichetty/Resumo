"use client";

import type { ChangeEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  UserProfile,
  getUserProfile,
  saveUserProfile,
  calculateProfileCompleteness,
  profileToResumeData,
  resumeDataToProfile,
  defaultUserProfile,
  UserProfileExperience,
  UserProfileEducation,
  UserProfileProject,
  UserProfileCertification,
  UserProfileAward,
} from "@/lib/user-profile";
import { createResume, getResumes, uploadExistingResume } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const NOTICE_PERIODS = [
  "Immediate Joiner",
  "15 Days",
  "30 Days / 1 Month",
  "45 Days",
  "60 Days / 2 Months",
  "90 Days / 3 Months",
  "Serving Notice Period",
];

const EXPERIENCE_LEVELS = [
  "Fresher / Student (0 years)",
  "1 - 2 Years",
  "3 - 5 Years",
  "5 - 8 Years",
  "8 - 12 Years",
  "12+ Years (Leadership)",
];

const SUGGESTED_SKILLS = [
  "React",
  "Next.js",
  "TypeScript",
  "JavaScript",
  "Node.js",
  "Python",
  "Django",
  "FastAPI",
  "Java",
  "Spring Boot",
  "SQL",
  "PostgreSQL",
  "MongoDB",
  "AWS",
  "Docker",
  "Kubernetes",
  "REST APIs",
  "GraphQL",
  "Tailwind CSS",
  "Git & GitHub",
  "CI/CD",
  "Machine Learning",
  "Data Analysis",
  "Agile / Scrum",
];

export default function ProfilePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "personal" | "summary" | "skills" | "experience" | "education" | "projects" | "certifications" | "awards" | "resume"
  >("personal");

  // User auth info
  const [userId, setUserId] = useState<number | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");

  // Profile State
  const [profile, setProfile] = useState<UserProfile>(defaultUserProfile);

  // Hidden file inputs
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const resumeInputRef = useRef<HTMLInputElement | null>(null);

  // Skill input state
  const [newSkill, setNewSkill] = useState("");

  // Modals / Editing items
  const [editingExp, setEditingExp] = useState<UserProfileExperience | null>(null);
  const [editingEdu, setEditingEdu] = useState<UserProfileEducation | null>(null);
  const [editingProj, setEditingProj] = useState<UserProfileProject | null>(null);
  const [editingCert, setEditingCert] = useState<UserProfileCertification | null>(null);
  const [editingAward, setEditingAward] = useState<UserProfileAward | null>(null);

  // Actions states
  const [creatingResume, setCreatingResume] = useState(false);
  const [importingResume, setImportingResume] = useState(false);
  const [uploadingResumeFile, setUploadingResumeFile] = useState(false);
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);

  // ======================================================
  // LOAD PROFILE & USER
  // ======================================================
  useEffect(() => {
    async function init() {
      const token = localStorage.getItem("access_token");
      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        let loadedUserId: number | null = null;
        let loadedUserEmail = "";
        let loadedUserName = "";

        const res = await fetch(`${API_URL}/api/v1/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "bypass-tunnel-reminder": "true",
          },
        });

        if (res.ok) {
          const userData = await res.json();
          loadedUserId = userData.id;
          loadedUserEmail = userData.email || "";
          loadedUserName = userData.name || "";
          setUserId(loadedUserId);
          setUserEmail(loadedUserEmail);
        }

        // Load profile from localStorage
        const storedProfile = getUserProfile(loadedUserId);

        // Prepopulate basic details if brand new
        if (!storedProfile.personal.fullName && loadedUserName) {
          storedProfile.personal.fullName = loadedUserName;
        }
        if (!storedProfile.personal.email && loadedUserEmail) {
          storedProfile.personal.email = loadedUserEmail;
        }

        setProfile(storedProfile);
      } catch (err) {
        console.error("Failed to load user info:", err);
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [router]);

  // ======================================================
  // SAVE PROFILE
  // ======================================================
  async function handleSave(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      saveUserProfile(profile, userId);

      // Sync name to backend profile endpoint if token available
      const token = localStorage.getItem("access_token");
      if (token && profile.personal.fullName) {
        try {
          await fetch(`${API_URL}/api/v1/settings/profile`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
              "bypass-tunnel-reminder": "true",
            },
            body: JSON.stringify({
              name: profile.personal.fullName,
            }),
          });
        } catch {
          // non-critical backend sync
        }
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Error saving profile:", err);
    } finally {
      setSaving(false);
    }
  }

  // ======================================================
  // AVATAR / PROFILE PHOTO UPLOAD
  // ======================================================
  function handlePhotoUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file (PNG, JPG, JPEG, WEBP).");
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert("Image size should be less than 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const dataUrl = uploadEvent.target?.result as string;
      if (dataUrl) {
        const updated = {
          ...profile,
          avatarUrl: dataUrl,
        };
        setProfile(updated);
        saveUserProfile(updated, userId);
        setBannerMessage("Profile photo updated successfully!");
        setTimeout(() => setBannerMessage(null), 4000);
      }
    };
    reader.readAsDataURL(file);
  }

  function handleRemovePhoto() {
    const confirmed = window.confirm("Are you sure you want to remove your profile photo?");
    if (!confirmed) return;

    const updated = {
      ...profile,
      avatarUrl: "",
    };
    setProfile(updated);
    saveUserProfile(updated, userId);
    setBannerMessage("Profile photo removed.");
    setTimeout(() => setBannerMessage(null), 3000);
  }

  // ======================================================
  // RESUME FILE ATTACHMENT & PARSING (Naukri style)
  // ======================================================
  async function handleResumeFileUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    const isPdf = fileName.endsWith(".pdf");
    const isDocx = fileName.endsWith(".docx");

    if (!isPdf && !isDocx) {
      alert("Please upload a PDF or DOCX resume file.");
      return;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      alert("Resume file size must be less than 10MB.");
      return;
    }

    setUploadingResumeFile(true);
    try {
      // 1. Read base64 for persistent local download & preview
      const reader = new FileReader();
      reader.onload = async (fileEvent) => {
        const base64Url = fileEvent.target?.result as string;
        const fileSizeStr =
          file.size > 1024 * 1024
            ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
            : `${Math.round(file.size / 1024)} KB`;

        const newResumeMeta = {
          name: file.name,
          size: fileSizeStr,
          uploadedAt: new Date().toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
          dataUrl: base64Url,
        };

        let updated: UserProfile = {
          ...profile,
          resumeFile: newResumeMeta,
        };

        // 2. Try parsing the file through backend resume parser to auto-fill profile details!
        const token = localStorage.getItem("access_token");
        if (token) {
          try {
            const parsed = await uploadExistingResume(token, file);
            if (parsed && parsed.content) {
              const resumeContent = JSON.parse(parsed.content);
              updated = resumeDataToProfile(resumeContent, updated);
              setBannerMessage(
                `Resume "${file.name}" uploaded & parsed! Your skills, experience, and education were synchronized with your profile.`
              );
            }
          } catch {
            setBannerMessage(`Resume "${file.name}" attached successfully to your profile!`);
          }
        } else {
          setBannerMessage(`Resume "${file.name}" attached successfully to your profile!`);
        }

        setProfile(updated);
        saveUserProfile(updated, userId);
        setUploadingResumeFile(false);
        setTimeout(() => setBannerMessage(null), 6000);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("Resume file attach error:", err);
      alert("Could not process resume file.");
      setUploadingResumeFile(false);
    }
  }

  function handleRemoveResumeFile() {
    const confirmed = window.confirm("Are you sure you want to remove your attached resume?");
    if (!confirmed) return;

    const updated = {
      ...profile,
      resumeFile: null,
    };
    setProfile(updated);
    saveUserProfile(updated, userId);
    setBannerMessage("Resume removed.");
    setTimeout(() => setBannerMessage(null), 3000);
  }

  // ======================================================
  // 1-CLICK CREATE RESUME PRE-FILLED FROM PROFILE
  // ======================================================
  async function handleCreateResumeFromProfile() {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.replace("/login");
      return;
    }

    setCreatingResume(true);
    try {
      const resumeContent = profileToResumeData(profile);
      const resumeTitle = profile.personal.fullName
        ? `${profile.personal.fullName}'s Resume`
        : "Profile-Generated Resume";

      const newResume = await createResume(token, {
        title: resumeTitle,
        content: JSON.stringify(resumeContent),
      });

      router.push(`/resume-builder/${newResume.id}`);
    } catch (err) {
      console.error("Failed to create resume from profile:", err);
      alert("Unable to generate resume from profile. Please try again.");
    } finally {
      setCreatingResume(false);
    }
  }

  // ======================================================
  // 1-CLICK IMPORT FROM LATEST RESUME
  // ======================================================
  async function handleImportFromLatestResume() {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    setImportingResume(true);
    try {
      const resumes = await getResumes(token);
      if (!resumes || resumes.length === 0) {
        alert("No existing resumes found to import from. You can fill your profile directly below!");
        return;
      }

      const latest = resumes[0];
      if (!latest.content) {
        alert("The latest resume has no content.");
        return;
      }

      const parsedResume = JSON.parse(latest.content);
      const updatedProfile = resumeDataToProfile(parsedResume, profile);

      setProfile(updatedProfile);
      saveUserProfile(updatedProfile, userId);

      setBannerMessage(`Imported details from "${latest.title || "your latest resume"}"! Review and save.`);
      setTimeout(() => setBannerMessage(null), 5000);
    } catch (err) {
      console.error("Failed to import from resume:", err);
      alert("Failed to import details from your resume.");
    } finally {
      setImportingResume(false);
    }
  }

  // ======================================================
  // SKILLS MANAGEMENT
  // ======================================================
  function handleAddSkill(skillToAdd: string) {
    const trimmed = skillToAdd.trim();
    if (!trimmed) return;
    if (profile.skills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) return;

    const updated = {
      ...profile,
      skills: [...profile.skills, trimmed],
    };
    setProfile(updated);
    saveUserProfile(updated, userId);
    setNewSkill("");
  }

  function handleRemoveSkill(skillToRemove: string) {
    const updated = {
      ...profile,
      skills: profile.skills.filter((s) => s !== skillToRemove),
    };
    setProfile(updated);
    saveUserProfile(updated, userId);
  }

  // Completeness score
  const completeness = calculateProfileCompleteness(profile);

  const initialLetter = profile.personal.fullName
    ? profile.personal.fullName[0].toUpperCase()
    : userEmail
    ? userEmail[0].toUpperCase()
    : "P";

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center p-6 text-[var(--text-muted)]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          <p className="text-sm font-medium">Loading your profile...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--bg-base)] px-4 py-6 sm:px-6 md:p-10 text-[var(--text-primary)]">
      {/* Hidden File Inputs */}
      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        onChange={handlePhotoUpload}
        className="hidden"
      />
      <input
        ref={resumeInputRef}
        type="file"
        accept=".pdf,.docx"
        onChange={handleResumeFileUpload}
        className="hidden"
      />

      <div className="mx-auto max-w-6xl space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border)] pb-5">
          <div>
            <button
              onClick={() => router.push("/dashboard")}
              className="text-sm text-[var(--text-muted)] hover:text-indigo-400 transition mb-1.5 flex items-center gap-1.5"
            >
              <span>←</span>
              <span>Back to Dashboard</span>
            </button>
            <h1 className="text-3xl font-extrabold tracking-tight">Candidate Profile Hub</h1>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
              Maintain your career details in one central profile. Automatically autofill resumes and sync with all job applications.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleImportFromLatestResume}
              disabled={importingResume}
              className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-elevated)] px-4 py-2 text-xs font-semibold text-[var(--text-primary)] transition flex items-center gap-1.5 shadow-sm"
              title="Pull details from your existing resume into this profile"
            >
              <span>📥</span>
              <span>{importingResume ? "Importing..." : "Import from Resume"}</span>
            </button>

            <button
              onClick={handleCreateResumeFromProfile}
              disabled={creatingResume}
              className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-emerald-500/20 transition flex items-center gap-1.5"
              title="Create a new resume populated with these profile details"
            >
              <span>⚡</span>
              <span>{creatingResume ? "Creating Resume..." : "Autofill New Resume"}</span>
            </button>

            <button
              onClick={() => handleSave()}
              disabled={saving}
              className="rounded-xl bg-indigo-600 hover:bg-indigo-500 px-5 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-500/25 transition flex items-center gap-1.5"
            >
              <span>{saving ? "⏳" : "💾"}</span>
              <span>{saving ? "Saving..." : saveSuccess ? "Saved!" : "Save Profile"}</span>
            </button>
          </div>
        </div>

        {/* Success Banner */}
        {bannerMessage && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400 flex items-center justify-between">
            <span>{bannerMessage}</span>
            <button onClick={() => setBannerMessage(null)} className="text-xs text-emerald-300 hover:underline">
              Dismiss
            </button>
          </div>
        )}

        {/* ======================================================
            HERO PROFILE CARD (Naukri / LinkedIn Style Header)
        ====================================================== */}
        <div className="relative overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--bg-surface)] p-6 md:p-8 shadow-xl">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Left: Avatar with Image Upload Option & Identity */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              {/* Photo Container */}
              <div className="relative group shrink-0">
                <div
                  onClick={() => photoInputRef.current?.click()}
                  className="relative flex h-24 w-24 cursor-pointer items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-3xl font-extrabold uppercase text-white shadow-xl shadow-indigo-500/30 overflow-hidden border-2 border-indigo-400/40 hover:opacity-95 transition"
                  title="Click to upload profile photo"
                >
                  {profile.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={profile.avatarUrl}
                      alt={profile.personal.fullName || "User Avatar"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span>{initialLetter}</span>
                  )}

                  {/* Hover Overlay with Camera Icon */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-white">
                    <span className="text-lg">📷</span>
                    <span className="text-[10px] font-bold mt-0.5">Upload</span>
                  </div>
                </div>

                {/* Remove photo link if photo present */}
                {profile.avatarUrl ? (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow hover:bg-red-500 transition"
                    title="Remove Photo"
                  >
                    ×
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 border-2 border-[var(--bg-surface)] text-[11px] text-white shadow hover:bg-indigo-500 transition"
                    title="Upload photo"
                  >
                    📷
                  </button>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="text-2xl font-black text-[var(--text-primary)]">
                    {profile.personal.fullName || "Your Full Name"}
                  </h2>
                  <span className="rounded-full bg-indigo-500/15 border border-indigo-500/30 px-2.5 py-0.5 text-[11px] font-bold text-indigo-400">
                    ID: {userId || "User"}
                  </span>
                </div>

                <p className="text-sm font-semibold text-indigo-400">
                  {profile.personal.headline || profile.personal.currentRole || "Add your professional headline (e.g. Senior Software Engineer)"}
                </p>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[var(--text-muted)] pt-1">
                  {profile.personal.email && (
                    <span className="flex items-center gap-1.5">
                      <span>✉️</span>
                      <span>{profile.personal.email}</span>
                    </span>
                  )}
                  {profile.personal.phone && (
                    <span className="flex items-center gap-1.5">
                      <span>📞</span>
                      <span>{profile.personal.phone}</span>
                    </span>
                  )}
                  {profile.personal.location && (
                    <span className="flex items-center gap-1.5">
                      <span>📍</span>
                      <span>{profile.personal.location}</span>
                    </span>
                  )}
                  {profile.personal.totalExperience && (
                    <span className="flex items-center gap-1.5">
                      <span>💼</span>
                      <span>{profile.personal.totalExperience}</span>
                    </span>
                  )}
                </div>

                {/* Social Badges */}
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  {profile.personal.linkedin && (
                    <a
                      href={profile.personal.linkedin.startsWith("http") ? profile.personal.linkedin : `https://${profile.personal.linkedin}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg bg-[#0A66C2]/10 border border-[#0A66C2]/30 px-2.5 py-1 text-[11px] font-semibold text-[#0A66C2] hover:bg-[#0A66C2]/20 transition flex items-center gap-1"
                    >
                      <span>LinkedIn</span>
                      <span className="text-[10px]">↗</span>
                    </a>
                  )}
                  {profile.personal.github && (
                    <a
                      href={profile.personal.github.startsWith("http") ? profile.personal.github : `https://${profile.personal.github}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg bg-zinc-500/10 border border-zinc-500/30 px-2.5 py-1 text-[11px] font-semibold text-[var(--text-primary)] hover:bg-zinc-500/20 transition flex items-center gap-1"
                    >
                      <span>GitHub</span>
                      <span className="text-[10px]">↗</span>
                    </a>
                  )}
                  {profile.personal.portfolio && (
                    <a
                      href={profile.personal.portfolio.startsWith("http") ? profile.personal.portfolio : `https://${profile.personal.portfolio}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg bg-purple-500/10 border border-purple-500/30 px-2.5 py-1 text-[11px] font-semibold text-purple-400 hover:bg-purple-500/20 transition flex items-center gap-1"
                    >
                      <span>Portfolio</span>
                      <span className="text-[10px]">↗</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Naukri-Style Completeness Meter Card */}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-muted)]/70 p-4 sm:p-5 min-w-[260px] lg:max-w-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)]">
                    Profile Strength
                  </span>
                  <p className="text-xl font-black text-[var(--text-primary)]">
                    {completeness.percentage}%
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 flex items-center justify-center text-xs font-bold text-indigo-400">
                  {completeness.percentage >= 80 ? "⭐" : "🚀"}
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--border)]">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-500"
                  style={{ width: `${completeness.percentage}%` }}
                />
              </div>

              {completeness.tips.length > 0 ? (
                <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                  💡 <span className="text-[var(--text-secondary)] font-medium">{completeness.tips[0]}</span>
                </p>
              ) : (
                <p className="text-[11px] text-emerald-400 font-medium">
                  ✓ Profile 100% complete! Ready for 1-click resume creation.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ======================================================
            NAUKRI-STYLE RESUME ATTACHMENT QUICK SECTION
        ====================================================== */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 text-xl border border-indigo-500/20">
                📄
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">Attached Candidate Resume</h3>
                  <span className="rounded-full bg-emerald-500/15 border border-emerald-500/25 px-2 py-0.2 text-[10px] font-semibold text-emerald-400">
                    PDF / DOCX
                  </span>
                </div>
                {profile.resumeFile ? (
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    <span className="font-semibold text-[var(--text-primary)]">{profile.resumeFile.name}</span> · {profile.resumeFile.size} · Uploaded on {profile.resumeFile.uploadedAt}
                  </p>
                ) : (
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    Upload your latest resume. Recruiters on Naukri and LinkedIn screen profiles with uploaded files 3x faster.
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {profile.resumeFile?.dataUrl && (
                <a
                  href={profile.resumeFile.dataUrl}
                  download={profile.resumeFile.name}
                  className="rounded-xl border border-[var(--border)] bg-[var(--bg-muted)] hover:bg-[var(--bg-surface-elevated)] px-3.5 py-1.5 text-xs font-semibold text-[var(--text-primary)] transition flex items-center gap-1.5"
                >
                  <span>⬇️</span>
                  <span>Download</span>
                </a>
              )}

              <button
                type="button"
                onClick={() => resumeInputRef.current?.click()}
                disabled={uploadingResumeFile}
                className="rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-1.5 text-xs font-semibold text-white transition flex items-center gap-1.5 shadow-sm"
              >
                <span>{uploadingResumeFile ? "⏳" : "⬆️"}</span>
                <span>{uploadingResumeFile ? "Uploading..." : profile.resumeFile ? "Replace Resume" : "Upload Resume File"}</span>
              </button>

              {profile.resumeFile && (
                <button
                  type="button"
                  onClick={handleRemoveResumeFile}
                  className="rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 text-xs font-semibold text-red-400 transition"
                  title="Remove attached resume"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ======================================================
            NAVIGATION TABS (Naukri Section Tabs)
        ====================================================== */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[var(--border)] scrollbar-none">
          {[
            { id: "personal", label: "Personal Details", icon: "👤", count: profile.personal.fullName ? "✓" : null },
            { id: "summary", label: "About & Summary", icon: "📝", count: profile.summary ? "✓" : null },
            { id: "skills", label: "Key Skills", icon: "⚡", count: profile.skills.length },
            { id: "experience", label: "Work Experience", icon: "💼", count: profile.experiences.length },
            { id: "education", label: "Education", icon: "🎓", count: profile.education.length },
            { id: "projects", label: "Projects", icon: "🚀", count: profile.projects.length },
            { id: "certifications", label: "Certifications", icon: "🏆", count: profile.certifications.length },
            { id: "awards", label: "Awards & Honors", icon: "🎖️", count: profile.awards?.length || 0 },
            { id: "resume", label: "Resume File", icon: "📄", count: profile.resumeFile ? "1" : null },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 shrink-0 rounded-xl px-4 py-2.5 text-xs font-semibold transition ${
                activeTab === tab.id
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                  : "bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-elevated)] hover:text-[var(--text-primary)] border border-[var(--border)]"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                    activeTab === tab.id
                      ? "bg-white/20 text-white"
                      : "bg-[var(--bg-muted)] text-[var(--text-muted)]"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ======================================================
            TAB 1: PERSONAL DETAILS
        ====================================================== */}
        {activeTab === "personal" && (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6 space-y-6 shadow-sm">
            <div className="border-b border-[var(--border)] pb-3">
              <h3 className="text-base font-bold text-[var(--text-primary)]">Personal &amp; Contact Information</h3>
              <p className="text-xs text-[var(--text-muted)]">
                Recruiters and ATS parse these details first. Keep them updated to autofill your blank resumes instantly.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={profile.personal.fullName}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      personal: { ...profile.personal, fullName: e.target.value },
                    })
                  }
                  placeholder="e.g. Rahul Sharma"
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-base)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                  Headline / Professional Title *
                </label>
                <input
                  type="text"
                  value={profile.personal.headline}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      personal: { ...profile.personal, headline: e.target.value },
                    })
                  }
                  placeholder="e.g. Senior Full Stack Engineer | React • Node.js • AWS"
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-base)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={profile.personal.email}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      personal: { ...profile.personal, email: e.target.value },
                    })
                  }
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-base)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                  Phone / Mobile Number *
                </label>
                <input
                  type="tel"
                  value={profile.personal.phone}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      personal: { ...profile.personal, phone: e.target.value },
                    })
                  }
                  placeholder="+91 98765 43210"
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-base)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                  Current City &amp; State *
                </label>
                <input
                  type="text"
                  value={profile.personal.location}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      personal: { ...profile.personal, location: e.target.value },
                    })
                  }
                  placeholder="e.g. Bengaluru, Karnataka, India"
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-base)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                  Total Experience
                </label>
                <select
                  value={profile.personal.totalExperience}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      personal: { ...profile.personal, totalExperience: e.target.value },
                    })
                  }
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-base)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] focus:border-indigo-500 focus:outline-none"
                >
                  <option value="">Select Experience Level</option>
                  {EXPERIENCE_LEVELS.map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {lvl}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                  Notice Period (Naukri style)
                </label>
                <select
                  value={profile.personal.noticePeriod}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      personal: { ...profile.personal, noticePeriod: e.target.value },
                    })
                  }
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-base)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] focus:border-indigo-500 focus:outline-none"
                >
                  <option value="">Select Notice Period</option>
                  {NOTICE_PERIODS.map((np) => (
                    <option key={np} value={np}>
                      {np}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                  Expected Salary (CTC)
                </label>
                <input
                  type="text"
                  value={profile.personal.expectedSalary}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      personal: { ...profile.personal, expectedSalary: e.target.value },
                    })
                  }
                  placeholder="e.g. ₹18L – ₹24L / year"
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-base)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                  LinkedIn URL
                </label>
                <input
                  type="text"
                  value={profile.personal.linkedin}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      personal: { ...profile.personal, linkedin: e.target.value },
                    })
                  }
                  placeholder="linkedin.com/in/username"
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-base)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                  GitHub Profile URL
                </label>
                <input
                  type="text"
                  value={profile.personal.github}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      personal: { ...profile.personal, github: e.target.value },
                    })
                  }
                  placeholder="github.com/username"
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-base)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                  Portfolio Website / Blog
                </label>
                <input
                  type="text"
                  value={profile.personal.portfolio}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      personal: { ...profile.personal, portfolio: e.target.value },
                    })
                  }
                  placeholder="https://yourportfolio.dev"
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-base)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => handleSave()}
                className="rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-semibold text-white hover:bg-indigo-500 transition shadow-sm"
              >
                {saving ? "Saving..." : saveSuccess ? "Saved Successfully!" : "Save Personal Details"}
              </button>
            </div>
          </div>
        )}

        {/* ======================================================
            TAB 2: SUMMARY
        ====================================================== */}
        {activeTab === "summary" && (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6 space-y-5 shadow-sm">
            <div className="border-b border-[var(--border)] pb-3">
              <h3 className="text-base font-bold text-[var(--text-primary)]">Professional Profile Summary</h3>
              <p className="text-xs text-[var(--text-muted)]">
                Highlight your career achievements, core specializations, and years of expertise. This summary directly transfers to the top of your resume.
              </p>
            </div>

            <textarea
              rows={6}
              value={profile.summary}
              onChange={(e) => setProfile({ ...profile, summary: e.target.value })}
              placeholder="e.g. Results-driven Full Stack Engineer with 4+ years of experience designing high-scale distributed systems and responsive web applications. Proven track record of improving web application throughput by 40% and deploying microservices using React, Node.js, and AWS..."
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-base)] p-4 text-sm text-[var(--text-primary)] focus:border-indigo-500 focus:outline-none leading-relaxed"
            />

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <span className="text-xs text-[var(--text-muted)]">
                {profile.summary.length} characters (recommended 150 - 450 characters)
              </span>

              <button
                type="button"
                onClick={() => handleSave()}
                className="rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-semibold text-white hover:bg-indigo-500 transition shadow-sm"
              >
                {saving ? "Saving..." : saveSuccess ? "Saved!" : "Save Summary"}
              </button>
            </div>
          </div>
        )}

        {/* ======================================================
            TAB 3: KEY SKILLS
        ====================================================== */}
        {activeTab === "skills" && (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6 space-y-6 shadow-sm">
            <div className="border-b border-[var(--border)] pb-3">
              <h3 className="text-base font-bold text-[var(--text-primary)]">Key Skills &amp; Technologies</h3>
              <p className="text-xs text-[var(--text-muted)]">
                Skills are matched by ATS algorithms and recruiters on Naukri and LinkedIn. Add both your primary and secondary technologies.
              </p>
            </div>

            {/* Input to add skill */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSkill(newSkill);
                  }
                }}
                placeholder="Type a skill (e.g. Docker, React, Python) and press Enter"
                className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--bg-base)] px-4 py-2.5 text-sm text-[var(--text-primary)] focus:border-indigo-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleAddSkill(newSkill)}
                className="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-indigo-500 transition shadow-sm"
              >
                + Add Skill
              </button>
            </div>

            {/* Active Skills Chips */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3">
                Your Current Skills ({profile.skills.length})
              </p>

              {profile.skills.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[var(--border)] p-6 text-center text-xs text-[var(--text-muted)]">
                  No skills added yet. Select from the popular suggestions below or type your own above.
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 text-xs font-semibold text-indigo-400"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-indigo-300 hover:text-red-400 font-bold ml-1 transition"
                        title="Remove skill"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Popular Suggestions */}
            <div className="border-t border-[var(--border)] pt-4">
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3">
                Popular In-Demand Suggestions (Click to add)
              </p>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_SKILLS.filter(
                  (s) => !profile.skills.some((sk) => sk.toLowerCase() === s.toLowerCase())
                ).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleAddSkill(s)}
                    className="rounded-lg border border-[var(--border)] bg-[var(--bg-muted)] hover:border-indigo-500/40 hover:text-indigo-400 px-2.5 py-1 text-xs text-[var(--text-secondary)] transition"
                  >
                    + {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================
            TAB 4: EXPERIENCE
        ====================================================== */}
        {activeTab === "experience" && (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6 space-y-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-3">
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">Work Experience</h3>
                <p className="text-xs text-[var(--text-muted)]">
                  Add full-time roles, contracts, and internships.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setEditingExp({
                    id: Math.random().toString(36).substring(2, 9),
                    company: "",
                    role: "",
                    location: "",
                    startDate: "",
                    endDate: "",
                    current: false,
                    description: "",
                  })
                }
                className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition"
              >
                + Add Experience
              </button>
            </div>

            {/* List of experiences */}
            {profile.experiences.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[var(--border)] p-8 text-center text-xs text-[var(--text-muted)]">
                No work experience added yet. Click &quot;+ Add Experience&quot; to maintain your employment history.
              </div>
            ) : (
              <div className="space-y-4">
                {profile.experiences.map((exp, index) => (
                  <div
                    key={exp.id || index}
                    className="rounded-xl border border-[var(--border)] bg-[var(--bg-base)] p-4 sm:p-5 transition hover:border-indigo-500/30"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-bold text-[var(--text-primary)]">{exp.role || "Job Title"}</h4>
                        <p className="text-xs font-semibold text-indigo-400">{exp.company || "Company Name"}</p>
                        <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                          {exp.startDate || "Start"} – {exp.current ? "Present" : exp.endDate || "End"}
                          {exp.location ? ` · ${exp.location}` : ""}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingExp(exp)}
                          className="rounded-lg bg-[var(--bg-muted)] border border-[var(--border)] px-2.5 py-1 text-xs font-medium text-[var(--text-primary)] hover:border-indigo-500/40"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = {
                              ...profile,
                              experiences: profile.experiences.filter((e) => e.id !== exp.id),
                            };
                            setProfile(updated);
                            saveUserProfile(updated, userId);
                          }}
                          className="rounded-lg bg-red-500/10 border border-red-500/20 px-2.5 py-1 text-xs font-medium text-red-400 hover:bg-red-500/20"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    {exp.description && (
                      <p className="text-xs text-[var(--text-secondary)] mt-3 leading-relaxed whitespace-pre-line border-t border-[var(--border)] pt-2.5">
                        {exp.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Modal / Drawer for Experience */}
        {editingExp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6 space-y-4 shadow-2xl">
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                {profile.experiences.some((e) => e.id === editingExp.id) ? "Edit Experience" : "Add Work Experience"}
              </h3>

              <div className="space-y-3 text-left">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Role / Job Title</label>
                  <input
                    type="text"
                    value={editingExp.role}
                    onChange={(e) => setEditingExp({ ...editingExp, role: e.target.value })}
                    placeholder="e.g. Frontend Developer"
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-base)] px-3 py-2 text-xs text-[var(--text-primary)] focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Company Name</label>
                  <input
                    type="text"
                    value={editingExp.company}
                    onChange={(e) => setEditingExp({ ...editingExp, company: e.target.value })}
                    placeholder="e.g. Tata Consultancy Services"
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-base)] px-3 py-2 text-xs text-[var(--text-primary)] focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Start Date</label>
                    <input
                      type="text"
                      value={editingExp.startDate}
                      onChange={(e) => setEditingExp({ ...editingExp, startDate: e.target.value })}
                      placeholder="e.g. Jun 2022"
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-base)] px-3 py-2 text-xs text-[var(--text-primary)] focus:border-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">End Date</label>
                    <input
                      type="text"
                      disabled={editingExp.current}
                      value={editingExp.current ? "Present" : editingExp.endDate}
                      onChange={(e) => setEditingExp({ ...editingExp, endDate: e.target.value })}
                      placeholder="e.g. Present or Dec 2024"
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-base)] px-3 py-2 text-xs text-[var(--text-primary)] focus:border-indigo-500 focus:outline-none disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="currentExpCheck"
                    checked={editingExp.current}
                    onChange={(e) => setEditingExp({ ...editingExp, current: e.target.checked })}
                    className="rounded border-[var(--border)] text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="currentExpCheck" className="text-xs text-[var(--text-secondary)] cursor-pointer">
                    I currently work here
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Responsibilities / Key Achievements</label>
                  <textarea
                    rows={4}
                    value={editingExp.description}
                    onChange={(e) => setEditingExp({ ...editingExp, description: e.target.value })}
                    placeholder="• Built scalable web platform using React and TypeScript...&#10;• Reduced latency by 35% through API caching..."
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-base)] p-3 text-xs text-[var(--text-primary)] focus:border-indigo-500 focus:outline-none leading-relaxed"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingExp(null)}
                  className="rounded-xl border border-[var(--border)] px-4 py-2 text-xs font-medium text-[var(--text-muted)] hover:bg-[var(--bg-muted)]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const existingIndex = profile.experiences.findIndex((e) => e.id === editingExp.id);
                    let updatedList: UserProfileExperience[];
                    if (existingIndex >= 0) {
                      updatedList = [...profile.experiences];
                      updatedList[existingIndex] = editingExp;
                    } else {
                      updatedList = [...profile.experiences, editingExp];
                    }
                    const updated = { ...profile, experiences: updatedList };
                    setProfile(updated);
                    saveUserProfile(updated, userId);
                    setEditingExp(null);
                  }}
                  className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
                >
                  Save Experience
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================
            TAB 5: EDUCATION
        ====================================================== */}
        {activeTab === "education" && (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6 space-y-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-3">
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">Education</h3>
                <p className="text-xs text-[var(--text-muted)]">
                  Add your degrees, certifications, and academic background.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setEditingEdu({
                    id: Math.random().toString(36).substring(2, 9),
                    institution: "",
                    degree: "",
                    fieldOfStudy: "",
                    location: "",
                    startDate: "",
                    endDate: "",
                    grade: "",
                  })
                }
                className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition"
              >
                + Add Education
              </button>
            </div>

            {profile.education.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[var(--border)] p-8 text-center text-xs text-[var(--text-muted)]">
                No education history added yet. Click &quot;+ Add Education&quot; to keep your qualifications ready for autofill.
              </div>
            ) : (
              <div className="space-y-4">
                {profile.education.map((edu, index) => (
                  <div
                    key={edu.id || index}
                    className="rounded-xl border border-[var(--border)] bg-[var(--bg-base)] p-4 sm:p-5 transition hover:border-indigo-500/30"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-bold text-[var(--text-primary)]">
                          {edu.degree || "Degree"} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ""}
                        </h4>
                        <p className="text-xs font-semibold text-indigo-400">{edu.institution || "College / University"}</p>
                        <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                          {edu.startDate ? `${edu.startDate} – ` : ""}{edu.endDate || "Graduation Year"}
                          {edu.grade ? ` · Grade: ${edu.grade}` : ""}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingEdu(edu)}
                          className="rounded-lg bg-[var(--bg-muted)] border border-[var(--border)] px-2.5 py-1 text-xs font-medium text-[var(--text-primary)] hover:border-indigo-500/40"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = {
                              ...profile,
                              education: profile.education.filter((e) => e.id !== edu.id),
                            };
                            setProfile(updated);
                            saveUserProfile(updated, userId);
                          }}
                          className="rounded-lg bg-red-500/10 border border-red-500/20 px-2.5 py-1 text-xs font-medium text-red-400 hover:bg-red-500/20"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Modal for Education */}
        {editingEdu && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6 space-y-4 shadow-2xl">
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                {profile.education.some((e) => e.id === editingEdu.id) ? "Edit Education" : "Add Education"}
              </h3>

              <div className="space-y-3 text-left">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Degree / Qualification</label>
                  <input
                    type="text"
                    value={editingEdu.degree}
                    onChange={(e) => setEditingEdu({ ...editingEdu, degree: e.target.value })}
                    placeholder="e.g. B.Tech / B.E. / B.Sc / MBA"
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-base)] px-3 py-2 text-xs text-[var(--text-primary)] focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Field of Study / Major</label>
                  <input
                    type="text"
                    value={editingEdu.fieldOfStudy}
                    onChange={(e) => setEditingEdu({ ...editingEdu, fieldOfStudy: e.target.value })}
                    placeholder="e.g. Computer Science and Engineering"
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-base)] px-3 py-2 text-xs text-[var(--text-primary)] focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">College / University</label>
                  <input
                    type="text"
                    value={editingEdu.institution}
                    onChange={(e) => setEditingEdu({ ...editingEdu, institution: e.target.value })}
                    placeholder="e.g. Indian Institute of Technology"
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-base)] px-3 py-2 text-xs text-[var(--text-primary)] focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Graduation Year</label>
                    <input
                      type="text"
                      value={editingEdu.endDate}
                      onChange={(e) => setEditingEdu({ ...editingEdu, endDate: e.target.value })}
                      placeholder="e.g. 2024"
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-base)] px-3 py-2 text-xs text-[var(--text-primary)] focus:border-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Grade / CGPA</label>
                    <input
                      type="text"
                      value={editingEdu.grade}
                      onChange={(e) => setEditingEdu({ ...editingEdu, grade: e.target.value })}
                      placeholder="e.g. 8.6 / 10 or 85%"
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-base)] px-3 py-2 text-xs text-[var(--text-primary)] focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingEdu(null)}
                  className="rounded-xl border border-[var(--border)] px-4 py-2 text-xs font-medium text-[var(--text-muted)] hover:bg-[var(--bg-muted)]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const existingIndex = profile.education.findIndex((e) => e.id === editingEdu.id);
                    let updatedList: UserProfileEducation[];
                    if (existingIndex >= 0) {
                      updatedList = [...profile.education];
                      updatedList[existingIndex] = editingEdu;
                    } else {
                      updatedList = [...profile.education, editingEdu];
                    }
                    const updated = { ...profile, education: updatedList };
                    setProfile(updated);
                    saveUserProfile(updated, userId);
                    setEditingEdu(null);
                  }}
                  className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
                >
                  Save Education
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================
            TAB 6: PROJECTS
        ====================================================== */}
        {activeTab === "projects" && (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6 space-y-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-3">
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">Personal &amp; Professional Projects</h3>
                <p className="text-xs text-[var(--text-muted)]">
                  Add major software apps, open source contributions, and client solutions.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setEditingProj({
                    id: Math.random().toString(36).substring(2, 9),
                    name: "",
                    technologies: "",
                    link: "",
                    description: "",
                  })
                }
                className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition"
              >
                + Add Project
              </button>
            </div>

            {profile.projects.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[var(--border)] p-8 text-center text-xs text-[var(--text-muted)]">
                No projects added yet. Click &quot;+ Add Project&quot; to showcase your technical accomplishments.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {profile.projects.map((proj, index) => (
                  <div
                    key={proj.id || index}
                    className="rounded-xl border border-[var(--border)] bg-[var(--bg-base)] p-4 sm:p-5 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-bold text-[var(--text-primary)]">{proj.name || "Project Name"}</h4>
                        {proj.link && (
                          <a
                            href={proj.link.startsWith("http") ? proj.link : `https://${proj.link}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-indigo-400 hover:underline"
                          >
                            Visit ↗
                          </a>
                        )}
                      </div>

                      {proj.technologies && (
                        <p className="text-xs font-semibold text-indigo-400 mt-1">Tech: {proj.technologies}</p>
                      )}

                      {proj.description && (
                        <p className="text-xs text-[var(--text-secondary)] mt-2 leading-relaxed line-clamp-3">
                          {proj.description}
                        </p>
                      )}
                    </div>

                    <div className="flex justify-end gap-2 pt-3 border-t border-[var(--border)] mt-3">
                      <button
                        type="button"
                        onClick={() => setEditingProj(proj)}
                        className="rounded-lg bg-[var(--bg-muted)] border border-[var(--border)] px-2.5 py-1 text-xs font-medium text-[var(--text-primary)] hover:border-indigo-500/40"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = {
                            ...profile,
                            projects: profile.projects.filter((p) => p.id !== proj.id),
                          };
                          setProfile(updated);
                          saveUserProfile(updated, userId);
                        }}
                        className="rounded-lg bg-red-500/10 border border-red-500/20 px-2.5 py-1 text-xs font-medium text-red-400 hover:bg-red-500/20"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Modal for Project */}
        {editingProj && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6 space-y-4 shadow-2xl">
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                {profile.projects.some((p) => p.id === editingProj.id) ? "Edit Project" : "Add Project"}
              </h3>

              <div className="space-y-3 text-left">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Project Name</label>
                  <input
                    type="text"
                    value={editingProj.name}
                    onChange={(e) => setEditingProj({ ...editingProj, name: e.target.value })}
                    placeholder="e.g. AI-Powered Resume Builder"
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-base)] px-3 py-2 text-xs text-[var(--text-primary)] focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Technologies Used</label>
                  <input
                    type="text"
                    value={editingProj.technologies}
                    onChange={(e) => setEditingProj({ ...editingProj, technologies: e.target.value })}
                    placeholder="e.g. Next.js, FastAPI, TypeScript, PostgreSQL"
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-base)] px-3 py-2 text-xs text-[var(--text-primary)] focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Project Link / Live URL</label>
                  <input
                    type="text"
                    value={editingProj.link}
                    onChange={(e) => setEditingProj({ ...editingProj, link: e.target.value })}
                    placeholder="https://github.com/username/project"
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-base)] px-3 py-2 text-xs text-[var(--text-primary)] focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Description / Key Features</label>
                  <textarea
                    rows={3}
                    value={editingProj.description}
                    onChange={(e) => setEditingProj({ ...editingProj, description: e.target.value })}
                    placeholder="Engineered real-time resume optimization suite used by 10,000+ applicants..."
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-base)] p-3 text-xs text-[var(--text-primary)] focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingProj(null)}
                  className="rounded-xl border border-[var(--border)] px-4 py-2 text-xs font-medium text-[var(--text-muted)] hover:bg-[var(--bg-muted)]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const existingIndex = profile.projects.findIndex((p) => p.id === editingProj.id);
                    let updatedList: UserProfileProject[];
                    if (existingIndex >= 0) {
                      updatedList = [...profile.projects];
                      updatedList[existingIndex] = editingProj;
                    } else {
                      updatedList = [...profile.projects, editingProj];
                    }
                    const updated = { ...profile, projects: updatedList };
                    setProfile(updated);
                    saveUserProfile(updated, userId);
                    setEditingProj(null);
                  }}
                  className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
                >
                  Save Project
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================
            TAB 7: CERTIFICATIONS
        ====================================================== */}
        {activeTab === "certifications" && (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6 space-y-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-3">
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">Certifications &amp; Licenses</h3>
                <p className="text-xs text-[var(--text-muted)]">
                  Add verified technical credentials (AWS, Google Cloud, Microsoft, Cisco, Coursera, etc.).
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setEditingCert({
                    id: Math.random().toString(36).substring(2, 9),
                    name: "",
                    issuer: "",
                    issueDate: "",
                    credentialUrl: "",
                  })
                }
                className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition"
              >
                + Add Certification
              </button>
            </div>

            {profile.certifications.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[var(--border)] p-8 text-center text-xs text-[var(--text-muted)]">
                No certifications added yet. Click &quot;+ Add Certification&quot; to showcase your credentials.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {profile.certifications.map((cert, index) => (
                  <div
                    key={cert.id || index}
                    className="rounded-xl border border-[var(--border)] bg-[var(--bg-base)] p-4 sm:p-5 flex flex-col justify-between"
                  >
                    <div>
                      <h4 className="text-sm font-bold text-[var(--text-primary)]">{cert.name || "Certification Name"}</h4>
                      <p className="text-xs font-semibold text-indigo-400 mt-0.5">{cert.issuer || "Issuing Body"}</p>
                      {cert.issueDate && (
                        <p className="text-[11px] text-[var(--text-muted)] mt-1">Issued: {cert.issueDate}</p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-[var(--border)] mt-3">
                      {cert.credentialUrl ? (
                        <a
                          href={cert.credentialUrl.startsWith("http") ? cert.credentialUrl : `https://${cert.credentialUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-indigo-400 hover:underline"
                        >
                          Verify Credential ↗
                        </a>
                      ) : (
                        <span />
                      )}

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingCert(cert)}
                          className="rounded-lg bg-[var(--bg-muted)] border border-[var(--border)] px-2.5 py-1 text-xs font-medium text-[var(--text-primary)] hover:border-indigo-500/40"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = {
                              ...profile,
                              certifications: profile.certifications.filter((c) => c.id !== cert.id),
                            };
                            setProfile(updated);
                            saveUserProfile(updated, userId);
                          }}
                          className="rounded-lg bg-red-500/10 border border-red-500/20 px-2.5 py-1 text-xs font-medium text-red-400 hover:bg-red-500/20"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Modal for Certification */}
        {editingCert && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6 space-y-4 shadow-2xl">
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                {profile.certifications.some((c) => c.id === editingCert.id) ? "Edit Certification" : "Add Certification"}
              </h3>

              <div className="space-y-3 text-left">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Certification Name</label>
                  <input
                    type="text"
                    value={editingCert.name}
                    onChange={(e) => setEditingCert({ ...editingCert, name: e.target.value })}
                    placeholder="e.g. AWS Certified Solutions Architect – Associate"
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-base)] px-3 py-2 text-xs text-[var(--text-primary)] focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Issuing Organization</label>
                  <input
                    type="text"
                    value={editingCert.issuer}
                    onChange={(e) => setEditingCert({ ...editingCert, issuer: e.target.value })}
                    placeholder="e.g. Amazon Web Services"
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-base)] px-3 py-2 text-xs text-[var(--text-primary)] focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Issue Date</label>
                  <input
                    type="text"
                    value={editingCert.issueDate}
                    onChange={(e) => setEditingCert({ ...editingCert, issueDate: e.target.value })}
                    placeholder="e.g. Mar 2024"
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-base)] px-3 py-2 text-xs text-[var(--text-primary)] focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Credential URL / Verification ID</label>
                  <input
                    type="text"
                    value={editingCert.credentialUrl}
                    onChange={(e) => setEditingCert({ ...editingCert, credentialUrl: e.target.value })}
                    placeholder="https://aws.amazon.com/verification/..."
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-base)] px-3 py-2 text-xs text-[var(--text-primary)] focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingCert(null)}
                  className="rounded-xl border border-[var(--border)] px-4 py-2 text-xs font-medium text-[var(--text-muted)] hover:bg-[var(--bg-muted)]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const existingIndex = profile.certifications.findIndex((c) => c.id === editingCert.id);
                    let updatedList: UserProfileCertification[];
                    if (existingIndex >= 0) {
                      updatedList = [...profile.certifications];
                      updatedList[existingIndex] = editingCert;
                    } else {
                      updatedList = [...profile.certifications, editingCert];
                    }
                    const updated = { ...profile, certifications: updatedList };
                    setProfile(updated);
                    saveUserProfile(updated, userId);
                    setEditingCert(null);
                  }}
                  className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
                >
                  Save Certification
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================
            TAB 8: AWARDS & ACHIEVEMENTS
        ====================================================== */}
        {activeTab === "awards" && (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6 space-y-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-3">
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">Awards, Honors &amp; Achievements</h3>
                <p className="text-xs text-[var(--text-muted)]">
                  Add hackathon wins, corporate honors, competitive programming ranks, and scholarships.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setEditingAward({
                    id: Math.random().toString(36).substring(2, 9),
                    title: "",
                    issuer: "",
                    date: "",
                    description: "",
                  })
                }
                className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition"
              >
                + Add Award
              </button>
            </div>

            {(!profile.awards || profile.awards.length === 0) ? (
              <div className="rounded-xl border border-dashed border-[var(--border)] p-8 text-center text-xs text-[var(--text-muted)]">
                No awards added yet. Click &quot;+ Add Award&quot; to showcase your hackathons, employee recognitions, and competitive honors.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {profile.awards.map((award, index) => (
                  <div
                    key={award.id || index}
                    className="rounded-xl border border-[var(--border)] bg-[var(--bg-base)] p-4 sm:p-5 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-bold text-[var(--text-primary)]">{award.title || "Award Title"}</h4>
                        <span className="text-base">🎖️</span>
                      </div>
                      <p className="text-xs font-semibold text-indigo-400 mt-0.5">{award.issuer || "Issuing Body / Event"}</p>
                      {award.date && (
                        <p className="text-[11px] text-[var(--text-muted)] mt-1">Conferred: {award.date}</p>
                      )}
                      {award.description && (
                        <p className="text-xs text-[var(--text-secondary)] mt-2 leading-relaxed">
                          {award.description}
                        </p>
                      )}
                    </div>

                    <div className="flex justify-end gap-2 pt-3 border-t border-[var(--border)] mt-3">
                      <button
                        type="button"
                        onClick={() => setEditingAward(award)}
                        className="rounded-lg bg-[var(--bg-muted)] border border-[var(--border)] px-2.5 py-1 text-xs font-medium text-[var(--text-primary)] hover:border-indigo-500/40"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = {
                            ...profile,
                            awards: (profile.awards || []).filter((a) => a.id !== award.id),
                          };
                          setProfile(updated);
                          saveUserProfile(updated, userId);
                        }}
                        className="rounded-lg bg-red-500/10 border border-red-500/20 px-2.5 py-1 text-xs font-medium text-red-400 hover:bg-red-500/20"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Modal for Award */}
        {editingAward && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6 space-y-4 shadow-2xl">
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                {(profile.awards || []).some((a) => a.id === editingAward.id) ? "Edit Award / Honor" : "Add Award / Honor"}
              </h3>

              <div className="space-y-3 text-left">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Award / Honor Title</label>
                  <input
                    type="text"
                    value={editingAward.title}
                    onChange={(e) => setEditingAward({ ...editingAward, title: e.target.value })}
                    placeholder="e.g. 1st Place – Smart India Hackathon or Employee of the Quarter"
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-base)] px-3 py-2 text-xs text-[var(--text-primary)] focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Issuer / Organization / Event</label>
                  <input
                    type="text"
                    value={editingAward.issuer}
                    onChange={(e) => setEditingAward({ ...editingAward, issuer: e.target.value })}
                    placeholder="e.g. Ministry of Education / Tech Mahindra / TCS"
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-base)] px-3 py-2 text-xs text-[var(--text-primary)] focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Date / Year</label>
                  <input
                    type="text"
                    value={editingAward.date}
                    onChange={(e) => setEditingAward({ ...editingAward, date: e.target.value })}
                    placeholder="e.g. Nov 2024"
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-base)] px-3 py-2 text-xs text-[var(--text-primary)] focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Description / Summary of Achievement</label>
                  <textarea
                    rows={3}
                    value={editingAward.description}
                    onChange={(e) => setEditingAward({ ...editingAward, description: e.target.value })}
                    placeholder="Awarded for creating an AI-driven solution among 500+ competing teams..."
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-base)] p-3 text-xs text-[var(--text-primary)] focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingAward(null)}
                  className="rounded-xl border border-[var(--border)] px-4 py-2 text-xs font-medium text-[var(--text-muted)] hover:bg-[var(--bg-muted)]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const currentAwards = profile.awards || [];
                    const existingIndex = currentAwards.findIndex((a) => a.id === editingAward.id);
                    let updatedList: UserProfileAward[];
                    if (existingIndex >= 0) {
                      updatedList = [...currentAwards];
                      updatedList[existingIndex] = editingAward;
                    } else {
                      updatedList = [...currentAwards, editingAward];
                    }
                    const updated = { ...profile, awards: updatedList };
                    setProfile(updated);
                    saveUserProfile(updated, userId);
                    setEditingAward(null);
                  }}
                  className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
                >
                  Save Award
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================
            TAB 9: RESUME UPLOAD SECTION (Dedicated View)
        ====================================================== */}
        {activeTab === "resume" && (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6 space-y-6 shadow-sm">
            <div className="border-b border-[var(--border)] pb-3">
              <h3 className="text-base font-bold text-[var(--text-primary)]">Manage Attached Resume</h3>
              <p className="text-xs text-[var(--text-muted)]">
                Upload your official CV or resume document (PDF or DOCX). Keep it stored in your profile so you can download, replace, or use it for job applications at any time.
              </p>
            </div>

            {profile.resumeFile ? (
              <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/20 to-[var(--bg-base)] p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-3xl text-indigo-400">
                    📄
                  </div>
                  <div>
                    <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 uppercase">
                      Active Resume
                    </span>
                    <h4 className="text-lg font-bold text-[var(--text-primary)] mt-1">
                      {profile.resumeFile.name}
                    </h4>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                      File Size: {profile.resumeFile.size} · Uploaded: {profile.resumeFile.uploadedAt}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {profile.resumeFile.dataUrl && (
                    <a
                      href={profile.resumeFile.dataUrl}
                      download={profile.resumeFile.name}
                      className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-elevated)] px-4 py-2 text-xs font-semibold text-[var(--text-primary)] transition flex items-center gap-1.5 shadow-sm"
                    >
                      <span>⬇️</span>
                      <span>Download Resume</span>
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={() => resumeInputRef.current?.click()}
                    disabled={uploadingResumeFile}
                    className="rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-xs font-semibold text-white transition flex items-center gap-1.5 shadow-sm"
                  >
                    <span>{uploadingResumeFile ? "⏳" : "⬆️"}</span>
                    <span>{uploadingResumeFile ? "Uploading..." : "Replace Resume"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleRemoveResumeFile}
                    className="rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 px-3.5 py-2 text-xs font-semibold text-red-400 transition"
                  >
                    Delete File
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => resumeInputRef.current?.click()}
                className="cursor-pointer rounded-2xl border-2 border-dashed border-[var(--border)] hover:border-indigo-500/60 bg-[var(--bg-base)] p-10 text-center transition group"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 text-2xl group-hover:scale-110 transition">
                  ⬆️
                </div>
                <h4 className="mt-4 text-base font-bold text-[var(--text-primary)] group-hover:text-indigo-400 transition">
                  {uploadingResumeFile ? "Uploading & Parsing Resume..." : "Click to Upload Your Resume"}
                </h4>
                <p className="mt-1 text-xs text-[var(--text-muted)] max-w-md mx-auto">
                  Supported formats: PDF or DOCX (Max file size 10MB). When you upload, we can automatically extract your background into your profile!
                </p>
                <button
                  type="button"
                  disabled={uploadingResumeFile}
                  className="mt-4 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-md hover:bg-indigo-500 transition"
                >
                  {uploadingResumeFile ? "Processing..." : "Select Resume File"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
