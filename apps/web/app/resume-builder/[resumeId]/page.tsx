"use client";

import TemplateRenderer from "@/components/template/TemplateRenderer";
import PrintResumeButton from "@/components/template/PrintResumeButton";
import TemplateSelector from "@/components/template/TemplateSelector";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  DEFAULT_TEMPLATE,
  ResumeTemplate,
} from "@/lib/template-types";

import {
  getResume,
  updateResume,
  Resume,
} from "@/lib/api";

import {
  emptyResumeData,
  ResumeData,
  Experience,
  Education,
  Project,
  Certification,
} from "@/lib/resume-types";
import {
  SAMPLE_RESUME_DATA,
  SAMPLE_RESUME_TITLE,
} from "@/lib/sample-resume";

// ======================================================
// HELPERS
// ======================================================

function calculateAtsScore(data: ResumeData) {
  let score = 0;
  const checks: { label: string; passed: boolean; tip?: string }[] = [];

  // Contact info
  if (data.personal.fullName?.trim()) {
    score += 15;
    checks.push({ label: "Full Name provided", passed: true });
  } else {
    checks.push({ label: "Full Name missing", passed: false, tip: "Applicant Tracking Systems require your legal/professional name." });
  }

  if (data.personal.email?.trim() && data.personal.phone?.trim()) {
    score += 15;
    checks.push({ label: "Email & Phone provided", passed: true });
  } else {
    checks.push({ label: "Contact information incomplete", passed: false, tip: "Include both an email address and phone number." });
  }

  if (data.personal.linkedin?.trim() || data.personal.github?.trim() || data.personal.portfolio?.trim()) {
    score += 10;
    checks.push({ label: "Online presence / Portfolio link included", passed: true });
  } else {
    checks.push({ label: "No LinkedIn or portfolio link", passed: false, tip: "Recruiters and ATS favor verified profiles." });
  }

  // Summary
  const summaryWords = data.summary?.trim() ? data.summary.trim().split(/\s+/).length : 0;
  if (summaryWords >= 20) {
    score += 15;
    checks.push({ label: `Professional Summary (${summaryWords} words)`, passed: true });
  } else if (summaryWords > 0) {
    score += 8;
    checks.push({ label: "Summary too short (aim for 25-50 words)", passed: false, tip: "Expand your summary with core strengths and impact." });
  } else {
    checks.push({ label: "Professional Summary missing", passed: false, tip: "A strong summary provides keyword density for ATS." });
  }

  // Experience
  if (data.experiences?.length > 0) {
    score += 15;
    const hasMetrics = data.experiences.some((e) =>
      /[0-9%+\$kM]/i.test(e.description)
    );
    if (hasMetrics) {
      score += 15;
      checks.push({ label: "Work experience with quantifiable metrics (%, $, numbers)", passed: true });
    } else {
      checks.push({ label: "Add quantifiable metrics to experience descriptions", passed: false, tip: "ATS and recruiters look for measurable results (e.g. reduced latency by 40%)." });
    }
  } else {
    checks.push({ label: "Work Experience missing", passed: false, tip: "Add at least one professional or project experience." });
  }

  // Skills
  if (data.skills?.length >= 6) {
    score += 15;
    checks.push({ label: `${data.skills.length} core competencies / skills listed`, passed: true });
  } else if (data.skills?.length > 0) {
    score += 8;
    checks.push({ label: "List at least 6 relevant skills for ATS keyword matching", passed: false });
  } else {
    checks.push({ label: "Skills section missing", passed: false, tip: "ATS filters candidates based on skill keyword frequency." });
  }

  // Education
  if (data.education?.length > 0) {
    score += 15;
    checks.push({ label: "Education section included", passed: true });
  } else {
    checks.push({ label: "Education section missing", passed: false, tip: "Include your degree, institution, and graduation year." });
  }

  return { score: Math.min(100, score), checks };
}

function createId() {
  return crypto.randomUUID();
}

function normalizeArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? value : [];
}

function sanitizeProjectsAndCertifications(
  rawProjects: unknown[],
  rawCertifications: unknown[],
  rawCourses: unknown[]
): { projects: Project[]; certifications: Certification[]; courses: any[] } {
  const normProjects = normalizeArray<Project>(rawProjects);
  const normCerts = normalizeArray<Certification>(rawCertifications);
  const normCourses = normalizeArray<any>(rawCourses);

  // Check if any project has malformed entries from wrapped bullets or leaked section headers
  const hasCorruption = normProjects.some((p) => {
    const name = (p.name || "").trim();
    const desc = (p.description || "").trim();
    return (
      /^(courses?|certifications?|coursework)/i.test(name) ||
      /\b(courses?|certifications?|coursework)\b/i.test(desc) ||
      /^[a-z,;]/.test(name) ||
      /^(encoding|ROC-AUC|RMSE reduction)/i.test(name) ||
      desc.includes("House Price Prediction System") ||
      desc.includes("COURSES")
    );
  });

  if (!hasCorruption) {
    const cleanedCerts = normCerts.map((item) => ({
      id: item.id || createId(),
      name: item.name || "",
      issuer: item.issuer || "",
      issueDate: item.issueDate || "",
      credentialUrl: item.credentialUrl || "",
    }));

    // If courses exist, ensure they are also in certifications if not already present
    const certNames = new Set(cleanedCerts.map((c) => c.name.toLowerCase()));
    for (const c of normCourses) {
      const cName = (c.name || "").trim();
      if (cName && !certNames.has(cName.toLowerCase())) {
        cleanedCerts.push({
          id: c.id || createId(),
          name: cName,
          issuer: c.issuer || "",
          issueDate: c.issueDate || "",
          credentialUrl: c.credentialUrl || "",
        });
        certNames.add(cName.toLowerCase());
      }
    }

    return {
      projects: normProjects.map((item) => ({
        id: item.id || createId(),
        name: item.name || "",
        technologies: item.technologies || "",
        link: item.link || "",
        description: item.description || "",
      })),
      certifications: cleanedCerts,
      courses: normCourses,
    };
  }

  // Repair corrupted project entries
  const cleanedProjects: Project[] = [];
  const extractedCerts: Certification[] = normCerts.map((item) => ({
    id: item.id || createId(),
    name: item.name || "",
    issuer: item.issuer || "",
    issueDate: item.issueDate || "",
    credentialUrl: item.credentialUrl || "",
  }));

  // Flatten lines
  const lines: { text: string; tech: string; link: string }[] = [];
  for (const item of normProjects) {
    const name = (item.name || "").trim();
    const desc = (item.description || "").trim();
    const tech = (item.technologies || "").trim();
    const link = (item.link || "").trim();

    if (name) lines.push({ text: name, tech, link });
    if (desc) {
      for (const dline of desc.split("\n")) {
        const trimmed = dline.trim();
        if (trimmed) lines.push({ text: trimmed, tech: "", link: "" });
      }
    }
  }

  let inCourses = false;
  let currentProj: Project | null = null;

  for (const item of lines) {
    const text = item.text;

    if (/^(COURSES?|CERTIFICATIONS?|COURSEWORK|RELEVANT COURSES?)$/i.test(text)) {
      inCourses = true;
      if (currentProj) {
        cleanedProjects.push(currentProj);
        currentProj = null;
      }
      continue;
    }

    if (inCourses) {
      const isBullet = /^[•\-*●▪▫]/.test(text);
      if (isBullet) {
        if (extractedCerts.length > 0) {
          const dateMatch = text.match(/\(([^)]*\d{4}[^)]*)\)/);
          if (dateMatch && !extractedCerts[extractedCerts.length - 1].issueDate) {
            extractedCerts[extractedCerts.length - 1].issueDate = dateMatch[1];
          }
        }
      } else {
        let courseName = text;
        let issuer = "";
        if (courseName.includes("–")) {
          const p = courseName.split("–");
          courseName = p[0].trim();
          issuer = p[1].trim();
        } else if (courseName.includes(" - ")) {
          const p = courseName.split(" - ");
          courseName = p[0].trim();
          issuer = p[1].trim();
        }
        extractedCerts.push({
          id: createId(),
          name: courseName,
          issuer: issuer,
          issueDate: "",
          credentialUrl: "",
        });
      }
      continue;
    }

    // Projects section
    const isBullet = /^[•\-*●▪▫]/.test(text);
    const cleanText = text.replace(/^[•\-*●▪▫]\s*/, "").trim();
    const isContinuation =
      !isBullet &&
      (/^[a-z,;]/.test(text) ||
        /^(encoding|ROC-AUC|RMSE reduction|and |with |across |over |validated |using |including )/i.test(text));

    if (isContinuation && currentProj) {
      currentProj.description = currentProj.description
        ? `${currentProj.description} ${text}`
        : text;
    } else if (isBullet) {
      const bulletLine = `• ${cleanText}`;
      if (!currentProj) {
        currentProj = {
          id: createId(),
          name: "Project",
          technologies: "",
          link: "",
          description: bulletLine,
        };
      } else {
        currentProj.description = currentProj.description
          ? `${currentProj.description}\n${bulletLine}`
          : bulletLine;
      }
    } else {
      // Check if text is a new project title
      if (currentProj) {
        cleanedProjects.push(currentProj);
      }
      currentProj = {
        id: createId(),
        name: text,
        technologies: item.tech,
        link: item.link,
        description: "",
      };
    }
  }

  if (currentProj) {
    cleanedProjects.push(currentProj);
  }

  return {
    projects: cleanedProjects,
    certifications: extractedCerts,
    courses: extractedCerts,
  };
}

function normalizeResumeData(value: unknown): ResumeData {
  if (!value || typeof value !== "object") {
    return emptyResumeData;
  }

  const parsed = value as Partial<ResumeData> & { courses?: unknown[] };

  const sanitized = sanitizeProjectsAndCertifications(
    parsed.projects || [],
    parsed.certifications || [],
    parsed.courses || []
  );

  return {
    ...emptyResumeData,

    personal: {
      ...emptyResumeData.personal,
      ...(parsed.personal &&
      typeof parsed.personal === "object"
        ? parsed.personal
        : {}),
    },

    summary:
      typeof parsed.summary === "string"
        ? parsed.summary
        : "",

    skills: normalizeArray<string>(parsed.skills),

    experiences: normalizeArray<Experience>(
      parsed.experiences
    ).map((item) => ({
      id: item.id || createId(),
      company: item.company || "",
      role: item.role || "",
      location: item.location || "",
      startDate: item.startDate || "",
      endDate: item.endDate || "",
      current: Boolean(item.current),
      description: item.description || "",
    })),

    education: normalizeArray<Education>(
      parsed.education
    ).map((item) => ({
      id: item.id || createId(),
      institution: item.institution || "",
      degree: item.degree || "",
      fieldOfStudy: item.fieldOfStudy || "",
      location: item.location || "",
      startDate: item.startDate || "",
      endDate: item.endDate || "",
      grade: item.grade || "",
    })),

    projects: sanitized.projects,

    certifications: sanitized.certifications,

    courses: sanitized.courses,
  };
}

function parseResumeContent(
  content: string | null
): ResumeData {
  if (!content) {
    return emptyResumeData;
  }

  try {
    const parsed =
      typeof content === "string"
        ? JSON.parse(content)
        : content;

    return normalizeResumeData(parsed);
  } catch {
    // If backend content is plain extracted text,
    // use it as the professional summary.
    return {
      ...emptyResumeData,
      summary: content,
    };
  }
}


// ======================================================
// PAGE
// ======================================================

export default function ResumeEditorPage() {
  const router = useRouter();
  const params = useParams();

  const rawResumeId = params?.resumeId;

  const resumeId =
    typeof rawResumeId === "string"
      ? Number(rawResumeId)
      : Array.isArray(rawResumeId)
        ? Number(rawResumeId[0])
        : NaN;

  const [resume, setResume] =
    useState<Resume | null>(null);

  const [title, setTitle] =
    useState("");

  const [resumeData, setResumeData] =
    useState<ResumeData>(emptyResumeData);

  const [skillsInput, setSkillsInput] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [success, setSuccess] =
    useState("");

  const [error, setError] =
    useState("");

  const [selectedTemplate, setSelectedTemplate] =
    useState<ResumeTemplate>(DEFAULT_TEMPLATE);

  const [showAtsDetails, setShowAtsDetails] =
    useState(false);

  // ======================================================
  // SAMPLE RESUME ACTIONS
  // ======================================================

  function handleLoadSampleData() {
    const hasExistingData =
      Boolean(resumeData.personal.fullName?.trim()) ||
      resumeData.experiences.length > 0 ||
      resumeData.skills.length > 0;

    if (hasExistingData) {
      const confirmed = window.confirm(
        "Loading sample data will replace current editor fields with the ATS-optimized sample resume (Alex Morgan · Senior Engineer). You will be able to edit and customize everything. Continue?"
      );
      if (!confirmed) return;
    }

    setResumeData(SAMPLE_RESUME_DATA);
    setSkillsInput(SAMPLE_RESUME_DATA.skills.join(", "));
    if (!title || title === "Untitled Resume") {
      setTitle(SAMPLE_RESUME_TITLE);
    }
    setSuccess("Loaded ATS-optimized sample resume! Customize any section as you want.");
    setError("");
  }

  function handleClearAll() {
    const confirmed = window.confirm(
      "Are you sure you want to clear all fields and start blank?"
    );
    if (!confirmed) return;

    setResumeData(emptyResumeData);
    setSkillsInput("");
    setSuccess("Cleared all fields. Starting with a blank resume.");
    setError("");
  }

  // ======================================================
  // LOAD RESUME
  // ======================================================

  useEffect(() => {
    let cancelled = false;

    async function loadResume() {
      const token =
        localStorage.getItem("access_token");

      if (!token) {
        router.replace("/login");
        return;
      }

      if (
        !Number.isInteger(resumeId) ||
        resumeId <= 0
      ) {
        if (!cancelled) {
          setError("Invalid resume ID.");
          setLoading(false);
        }

        return;
      }

      try {
        if (!cancelled) {
          setLoading(true);
          setError("");
          setSuccess("");
          setResume(null);
          setTitle("");
          setResumeData(emptyResumeData);
          setSkillsInput("");
        }

        console.log(
          "Loading resume:",
          resumeId
        );

        const response =
          await getResume(
            token,
            resumeId
          );

        console.log(
          "Resume API response:",
          response
        );

        if (cancelled) {
          return;
        }

        /*
         * Support all of these backend response shapes:
         *
         * 1. Resume
         * 2. { resume: Resume }
         * 3. { data: Resume }
         */

        const rawResponse =
          response as unknown as
            | Resume
            | {
                resume?: Resume;
                data?: Resume;
              };

        let resumeDataObject: Resume | null =
          null;

        if (
          rawResponse &&
          typeof rawResponse === "object"
        ) {
          if (
            "resume" in rawResponse &&
            rawResponse.resume
          ) {
            resumeDataObject =
              rawResponse.resume;
          } else if (
            "data" in rawResponse &&
            rawResponse.data
          ) {
            resumeDataObject =
              rawResponse.data;
          } else if (
            "id" in rawResponse
          ) {
            resumeDataObject =
              rawResponse as Resume;
          }
        }

        if (!resumeDataObject) {
          throw new Error(
            "The server returned an invalid resume response."
          );
        }

        console.log(
          "Normalized resume:",
          resumeDataObject
        );

        setResume(resumeDataObject);

        setTitle(
          resumeDataObject.title || ""
        );

        const parsedResume =
          parseResumeContent(
            resumeDataObject.content
          );

        console.log(
          "Parsed resume data:",
          parsedResume
        );

        setResumeData(parsedResume);

        setSkillsInput(
          parsedResume.skills.join(", ")
        );

      } catch (err) {
        console.error(
          "Failed to load resume:",
          err
        );

        if (!cancelled) {
          setResume(null);

          setError(
            err instanceof Error
              ? err.message
              : "Unable to load resume."
          );
        }

      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadResume();

    return () => {
      cancelled = true;
    };
  }, [resumeId, router]);


  // ======================================================
  // PERSONAL
  // ======================================================

  function updatePersonal(
    field: keyof ResumeData["personal"],
    value: string
  ) {
    setResumeData((current) => ({
      ...current,

      personal: {
        ...current.personal,
        [field]: value,
      },
    }));

    setSuccess("");
    setError("");
  }


  // ======================================================
  // SUMMARY
  // ======================================================

  function updateSummary(value: string) {
    setResumeData((current) => ({
      ...current,
      summary: value,
    }));

    setSuccess("");
  }


  // ======================================================
  // SKILLS
  // ======================================================

  function updateSkills(value: string) {
    setSkillsInput(value);

    const skills = value
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);

    setResumeData((current) => ({
      ...current,
      skills,
    }));

    setSuccess("");
  }


  // ======================================================
  // EXPERIENCE
  // ======================================================

  function addExperience() {
    const newExperience: Experience = {
      id: createId(),
      company: "",
      role: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      description: "",
    };

    setResumeData((current) => ({
      ...current,

      experiences: [
        ...current.experiences,
        newExperience,
      ],
    }));

    setSuccess("");
  }

  function updateExperience(
    id: string,
    field: keyof Experience,
    value: string | boolean
  ) {
    setResumeData((current) => ({
      ...current,

      experiences:
        current.experiences.map(
          (experience) =>
            experience.id === id
              ? {
                  ...experience,
                  [field]: value,
                }
              : experience
        ),
    }));

    setSuccess("");
  }

  function removeExperience(id: string) {
    setResumeData((current) => ({
      ...current,

      experiences:
        current.experiences.filter(
          (experience) =>
            experience.id !== id
        ),
    }));

    setSuccess("");
  }


  // ======================================================
  // EDUCATION
  // ======================================================

  function addEducation() {
    const newEducation: Education = {
      id: createId(),
      institution: "",
      degree: "",
      fieldOfStudy: "",
      location: "",
      startDate: "",
      endDate: "",
      grade: "",
    };

    setResumeData((current) => ({
      ...current,

      education: [
        ...current.education,
        newEducation,
      ],
    }));

    setSuccess("");
  }

  function updateEducation(
    id: string,
    field: keyof Education,
    value: string
  ) {
    setResumeData((current) => ({
      ...current,

      education:
        current.education.map((item) =>
          item.id === id
            ? {
                ...item,
                [field]: value,
              }
            : item
        ),
    }));

    setSuccess("");
  }

  function removeEducation(id: string) {
    setResumeData((current) => ({
      ...current,

      education:
        current.education.filter(
          (item) => item.id !== id
        ),
    }));

    setSuccess("");
  }


  // ======================================================
  // PROJECTS
  // ======================================================

  function addProject() {
    const newProject: Project = {
      id: createId(),
      name: "",
      technologies: "",
      link: "",
      description: "",
    };

    setResumeData((current) => ({
      ...current,

      projects: [
        ...current.projects,
        newProject,
      ],
    }));

    setSuccess("");
  }

  function updateProject(
    id: string,
    field: keyof Project,
    value: string
  ) {
    setResumeData((current) => ({
      ...current,

      projects:
        current.projects.map((project) =>
          project.id === id
            ? {
                ...project,
                [field]: value,
              }
            : project
        ),
    }));

    setSuccess("");
  }

  function removeProject(id: string) {
    setResumeData((current) => ({
      ...current,

      projects:
        current.projects.filter(
          (project) =>
            project.id !== id
        ),
    }));

    setSuccess("");
  }


  // ======================================================
  // CERTIFICATIONS
  // ======================================================

  function addCertification() {
    const newCertification: Certification = {
      id: createId(),
      name: "",
      issuer: "",
      issueDate: "",
      credentialUrl: "",
    };

    setResumeData((current) => ({
      ...current,

      certifications: [
        ...current.certifications,
        newCertification,
      ],
    }));

    setSuccess("");
  }

  function updateCertification(
    id: string,
    field: keyof Certification,
    value: string
  ) {
    setResumeData((current) => ({
      ...current,

      certifications:
        current.certifications.map(
          (certification) =>
            certification.id === id
              ? {
                  ...certification,
                  [field]: value,
                }
              : certification
        ),
    }));

    setSuccess("");
  }

  function removeCertification(id: string) {
    setResumeData((current) => ({
      ...current,

      certifications:
        current.certifications.filter(
          (certification) =>
            certification.id !== id
        ),
    }));

    setSuccess("");
  }


  // ======================================================
  // SAVE
  // ======================================================

  async function handleSave() {
    const token =
      localStorage.getItem("access_token");

    if (!token) {
      router.replace("/login");
      return;
    }

    if (!title.trim()) {
      setError(
        "Resume title is required."
      );
      return;
    }

    if (!resume) {
      setError(
        "Resume could not be loaded."
      );
      return;
    }

    try {
      setSaving(true);
      setSuccess("");
      setError("");

      const payloadContent = JSON.stringify({
        personal: resumeData.personal,
        summary: resumeData.summary,
        skills: resumeData.skills,
        experiences: resumeData.experiences,
        education: resumeData.education,
        projects: resumeData.projects,
        certifications: resumeData.certifications,
        courses: resumeData.courses || [],
      });

      const updated =
        await updateResume(
          token,
          resumeId,
          {
            title: title.trim(),
            content: payloadContent,
          }
        );

      setResume(updated);
      setTitle(updated.title);

      setSuccess(
        "Resume saved successfully."
      );

    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to save resume."
      );

    } finally {
      setSaving(false);
    }
  }


  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium">
            Loading resume...
          </p>

          <p className="mt-2 text-sm text-zinc-500">
            Resume ID: {resumeId}
          </p>
        </div>
      </main>
    );
  }


  // ======================================================
  // NOT FOUND
  // ======================================================

  if (!resume) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <div className="max-w-md text-center">

          <h1 className="text-2xl font-bold">
            Resume could not be loaded
          </h1>

          <p className="mt-3 text-zinc-500">
            {error ||
              `Unable to find resume ${resumeId}.`}
          </p>

          <div className="mt-6 flex justify-center gap-3">

            <button
              onClick={() =>
                window.location.reload()
              }
              className="rounded-xl border px-5 py-2"
            >
              Try Again
            </button>

            <button
              onClick={() =>
                router.push("/dashboard")
              }
              className="rounded-xl bg-black px-5 py-2 text-white dark:bg-white dark:text-black"
            >
              Dashboard
            </button>

          </div>

        </div>
      </main>
    );
  }


  // ======================================================
  // PAGE
  // ======================================================

  const atsEvaluation = calculateAtsScore(resumeData);
  const isResumeEmpty = !resumeData.personal.fullName?.trim() && resumeData.experiences.length === 0;

  return (
    <main className="min-h-screen p-4 md:p-8 bg-[var(--bg-base)]">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}
        <div className="flex flex-col justify-between gap-5 border-b pb-6 dark:border-zinc-800 md:flex-row md:items-center">
          <div>
            <button
              onClick={() => router.push("/resume-builder")}
              className="text-sm text-zinc-500 transition hover:text-zinc-900 dark:hover:text-white"
            >
              ← My Resumes
            </button>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs font-semibold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                Resume #{resumeId}
              </span>
              <span className="text-xs text-zinc-500">
                ATS Builder & Customizer
              </span>
            </div>
            <h1 className="mt-1 text-2xl md:text-3xl font-bold tracking-tight">
              {title || "Build Your Resume"}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* ATS Score Indicator */}
            <button
              type="button"
              onClick={() => setShowAtsDetails(!showAtsDetails)}
              className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-semibold transition ${
                atsEvaluation.score >= 80
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                  : atsEvaluation.score >= 50
                    ? "border-amber-500/40 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
                    : "border-zinc-700 bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              }`}
              title="Click to view ATS score breakdown"
            >
              <span>{atsEvaluation.score >= 80 ? "⭐" : "📊"}</span>
              <span>ATS Score: {atsEvaluation.score}%</span>
              <span className="text-[10px] opacity-75">{showAtsDetails ? "▲" : "▼"}</span>
            </button>

            {/* Load Sample Resume Button */}
            <button
              type="button"
              onClick={handleLoadSampleData}
              className="flex items-center gap-1.5 rounded-xl border border-blue-500/40 bg-blue-500/10 px-3.5 py-2 text-xs font-semibold text-blue-400 transition hover:bg-blue-500/20 hover:text-blue-300"
              title="Fill this resume with our ATS-friendly sample data to customize as you want"
            >
              <span>⚡</span>
              <span>Load Sample Resume</span>
            </button>

            {/* Clear Button */}
            <button
              type="button"
              onClick={handleClearAll}
              className="rounded-xl border border-zinc-700 bg-zinc-800/60 px-3 py-2 text-xs font-medium text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-200"
              title="Clear all fields to start blank"
            >
              Clear Blank
            </button>

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-md transition hover:bg-blue-500 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Resume"}
            </button>
          </div>
        </div>

        {/* ATS CHECKLIST / BREAKDOWN DRAWER */}
        {showAtsDetails && (
          <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-900/90 p-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>ATS Compatibility Analysis</span>
                  <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-400">
                    {atsEvaluation.score}/100 Points
                  </span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  How well this resume conforms to automated applicant tracking systems (Workday, Taleo, Greenhouse).
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAtsDetails(false)}
                className="text-xs text-zinc-400 hover:text-white"
              >
                ✕ Close
              </button>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {atsEvaluation.checks.map((check, idx) => (
                <div
                  key={idx}
                  className={`rounded-xl border p-3 text-xs ${
                    check.passed
                      ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-300"
                      : "border-amber-500/20 bg-amber-500/5 text-amber-300"
                  }`}
                >
                  <div className="flex items-center gap-2 font-medium">
                    <span>{check.passed ? "✓" : "⚠️"}</span>
                    <span>{check.label}</span>
                  </div>
                  {check.tip && (
                    <p className="mt-1 text-[11px] text-zinc-400 leading-normal">
                      {check.tip}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MESSAGES */}
        {success && (
          <div className="mt-4 rounded-xl border border-emerald-800/40 bg-emerald-950/20 p-3 text-xs font-medium text-emerald-400">
            {success}
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-xl border border-rose-800/40 bg-rose-950/20 p-3 text-xs font-medium text-rose-400">
            {error}
          </div>
        )}

        {/* EDITOR + PREVIEW */}
        <div className="mt-6 grid gap-8 lg:grid-cols-2">
          {/* LEFT */}
          <div className="space-y-6">
            {/* EMPTY STATE ASSISTANT BANNER */}
            {isResumeEmpty && (
              <div className="rounded-2xl border border-blue-500/30 bg-gradient-to-r from-blue-950/40 to-indigo-950/30 p-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400">
                      <span>💡</span>
                      <span>Want a quick start?</span>
                    </div>
                    <p className="mt-1 text-xs text-zinc-300 leading-relaxed">
                      Load our complete ATS-friendly sample resume (Alex Morgan · Senior Engineer). It comes with structured experience, bullet points, metrics, and skills that you can freely edit as you want!
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleLoadSampleData}
                    className="shrink-0 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-blue-500 transition"
                  >
                    ⚡ Load Sample Resume
                  </button>
                </div>
              </div>
            )}

            {/* RESUME DETAILS */}
            <EditorSection title="Resume Details">

              <Field
                label="Resume Title"
                value={title}
                onChange={setTitle}
                placeholder="Data Analyst Resume"
              />

            </EditorSection>


            {/* PERSONAL DETAILS */}

            <EditorSection title="Personal Details">

              <div className="grid gap-4 md:grid-cols-2">

                <Field
                  label="Full Name"
                  value={
                    resumeData.personal.fullName
                  }
                  onChange={(value) =>
                    updatePersonal(
                      "fullName",
                      value
                    )
                  }
                  placeholder="Your full name"
                />

                <Field
                  label="Email"
                  type="email"
                  value={
                    resumeData.personal.email
                  }
                  onChange={(value) =>
                    updatePersonal(
                      "email",
                      value
                    )
                  }
                  placeholder="you@example.com"
                />

                <Field
                  label="Phone"
                  value={
                    resumeData.personal.phone
                  }
                  onChange={(value) =>
                    updatePersonal(
                      "phone",
                      value
                    )
                  }
                  placeholder="+91 98765 43210"
                />

                <Field
                  label="Location"
                  value={
                    resumeData.personal.location
                  }
                  onChange={(value) =>
                    updatePersonal(
                      "location",
                      value
                    )
                  }
                  placeholder="Hyderabad, India"
                />

                <Field
                  label="LinkedIn"
                  value={
                    resumeData.personal.linkedin
                  }
                  onChange={(value) =>
                    updatePersonal(
                      "linkedin",
                      value
                    )
                  }
                  placeholder="linkedin.com/in/username"
                />

                <Field
                  label="GitHub"
                  value={
                    resumeData.personal.github
                  }
                  onChange={(value) =>
                    updatePersonal(
                      "github",
                      value
                    )
                  }
                  placeholder="github.com/username"
                />

                <div className="md:col-span-2">

                  <Field
                    label="Portfolio"
                    value={
                      resumeData.personal.portfolio
                    }
                    onChange={(value) =>
                      updatePersonal(
                        "portfolio",
                        value
                      )
                    }
                    placeholder="yourportfolio.com"
                  />

                </div>

              </div>

            </EditorSection>


            {/* SUMMARY */}

            <EditorSection title="Professional Summary">

              <TextArea
                value={resumeData.summary}
                onChange={updateSummary}
                placeholder="Write a concise professional summary highlighting your experience, technical strengths and impact."
                rows={6}
              />

            </EditorSection>


            {/* SKILLS */}

            <EditorSection title="Technical Skills">

              <p className="mb-3 text-sm text-zinc-500">
                Separate skills using commas.
              </p>

              <TextArea
                value={skillsInput}
                onChange={updateSkills}
                placeholder="Python, SQL, Power BI, Machine Learning, Excel"
                rows={4}
              />

              {resumeData.skills.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">

                  {resumeData.skills.map(
                    (skill, index) => (
                      <span
                        key={`${skill}-${index}`}
                        className="rounded-full border px-3 py-1 text-xs dark:border-zinc-700"
                      >
                        {skill}
                      </span>
                    )
                  )}

                </div>
              )}

            </EditorSection>


            {/* EXPERIENCE */}

            <EditorSection title="Experience">

              <SectionHeader
                text="Add your professional work experience."
                buttonText="+ Add Experience"
                onClick={addExperience}
              />

              {resumeData.experiences.length === 0 ? (

                <EmptySection text="No experience added yet." />

              ) : (

                <div className="space-y-5">

                  {resumeData.experiences.map(
                    (experience, index) => (

                      <EntryCard
                        key={experience.id}
                        title={`Experience ${index + 1}`}
                        onRemove={() =>
                          removeExperience(
                            experience.id
                          )
                        }
                      >

                        <div className="grid gap-4 md:grid-cols-2">

                          <Field
                            label="Job Title"
                            value={experience.role}
                            onChange={(value) =>
                              updateExperience(
                                experience.id,
                                "role",
                                value
                              )
                            }
                            placeholder="Data Analyst"
                          />

                          <Field
                            label="Company"
                            value={experience.company}
                            onChange={(value) =>
                              updateExperience(
                                experience.id,
                                "company",
                                value
                              )
                            }
                            placeholder="Company name"
                          />

                          <Field
                            label="Location"
                            value={experience.location}
                            onChange={(value) =>
                              updateExperience(
                                experience.id,
                                "location",
                                value
                              )
                            }
                            placeholder="Hyderabad, India"
                          />

                          <div />

                          <Field
                            label="Start Date"
                            type="month"
                            value={
                              experience.startDate
                            }
                            onChange={(value) =>
                              updateExperience(
                                experience.id,
                                "startDate",
                                value
                              )
                            }
                          />

                          <Field
                            label="End Date"
                            type="month"
                            value={
                              experience.endDate
                            }
                            onChange={(value) =>
                              updateExperience(
                                experience.id,
                                "endDate",
                                value
                              )
                            }
                            disabled={
                              experience.current
                            }
                          />

                        </div>

                        <label className="mt-4 flex cursor-pointer items-center gap-3 text-sm">

                          <input
                            type="checkbox"
                            checked={
                              experience.current
                            }
                            onChange={(event) => {

                              const checked =
                                event.target.checked;

                              updateExperience(
                                experience.id,
                                "current",
                                checked
                              );

                              if (checked) {
                                updateExperience(
                                  experience.id,
                                  "endDate",
                                  ""
                                );
                              }

                            }}
                            className="h-4 w-4"
                          />

                          I currently work here

                        </label>

                        <div className="mt-5">

                          <FieldLabel>
                            Description / Achievements
                          </FieldLabel>

                          <TextArea
                            value={
                              experience.description
                            }
                            onChange={(value) =>
                              updateExperience(
                                experience.id,
                                "description",
                                value
                              )
                            }
                            placeholder="Describe your responsibilities and measurable achievements."
                            rows={5}
                          />

                        </div>

                      </EntryCard>

                    )
                  )}

                </div>

              )}

            </EditorSection>


            {/* EDUCATION */}

            <EditorSection title="Education">

              <SectionHeader
                text="Add your academic qualifications."
                buttonText="+ Add Education"
                onClick={addEducation}
              />

              {resumeData.education.length === 0 ? (

                <EmptySection text="No education added yet." />

              ) : (

                <div className="space-y-5">

                  {resumeData.education.map(
                    (education, index) => (

                      <EntryCard
                        key={education.id}
                        title={`Education ${index + 1}`}
                        onRemove={() =>
                          removeEducation(
                            education.id
                          )
                        }
                      >

                        <div className="grid gap-4 md:grid-cols-2">

                          <Field
                            label="Institution"
                            value={
                              education.institution
                            }
                            onChange={(value) =>
                              updateEducation(
                                education.id,
                                "institution",
                                value
                              )
                            }
                            placeholder="University / College"
                          />

                          <Field
                            label="Degree"
                            value={
                              education.degree
                            }
                            onChange={(value) =>
                              updateEducation(
                                education.id,
                                "degree",
                                value
                              )
                            }
                            placeholder="B.Tech"
                          />

                          <Field
                            label="Field of Study"
                            value={
                              education.fieldOfStudy
                            }
                            onChange={(value) =>
                              updateEducation(
                                education.id,
                                "fieldOfStudy",
                                value
                              )
                            }
                            placeholder="Computer Science"
                          />

                          <Field
                            label="Location"
                            value={
                              education.location
                            }
                            onChange={(value) =>
                              updateEducation(
                                education.id,
                                "location",
                                value
                              )
                            }
                            placeholder="Hyderabad, India"
                          />

                          <Field
                            label="Start Date"
                            type="month"
                            value={
                              education.startDate
                            }
                            onChange={(value) =>
                              updateEducation(
                                education.id,
                                "startDate",
                                value
                              )
                            }
                          />

                          <Field
                            label="End Date"
                            type="month"
                            value={
                              education.endDate
                            }
                            onChange={(value) =>
                              updateEducation(
                                education.id,
                                "endDate",
                                value
                              )
                            }
                          />

                          <div className="md:col-span-2">

                            <Field
                              label="Grade / CGPA"
                              value={
                                education.grade
                              }
                              onChange={(value) =>
                                updateEducation(
                                  education.id,
                                  "grade",
                                  value
                                )
                              }
                              placeholder="8.5 CGPA"
                            />

                          </div>

                        </div>

                      </EntryCard>

                    )
                  )}

                </div>

              )}

            </EditorSection>


            {/* PROJECTS */}

            <EditorSection title="Projects">

              <SectionHeader
                text="Showcase projects relevant to your target roles."
                buttonText="+ Add Project"
                onClick={addProject}
              />

              {resumeData.projects.length === 0 ? (

                <EmptySection text="No projects added yet." />

              ) : (

                <div className="space-y-5">

                  {resumeData.projects.map(
                    (project, index) => (

                      <EntryCard
                        key={project.id}
                        title={`Project ${index + 1}`}
                        onRemove={() =>
                          removeProject(
                            project.id
                          )
                        }
                      >

                        <div className="grid gap-4 md:grid-cols-2">

                          <Field
                            label="Project Name"
                            value={project.name}
                            onChange={(value) =>
                              updateProject(
                                project.id,
                                "name",
                                value
                              )
                            }
                            placeholder="Customer Churn Prediction"
                          />

                          <Field
                            label="Technologies"
                            value={
                              project.technologies
                            }
                            onChange={(value) =>
                              updateProject(
                                project.id,
                                "technologies",
                                value
                              )
                            }
                            placeholder="Python, Pandas, Scikit-learn"
                          />

                          <div className="md:col-span-2">

                            <Field
                              label="Project / GitHub Link"
                              value={project.link}
                              onChange={(value) =>
                                updateProject(
                                  project.id,
                                  "link",
                                  value
                                )
                              }
                              placeholder="github.com/username/project"
                            />

                          </div>

                        </div>

                        <div className="mt-5">

                          <FieldLabel>
                            Project Description
                          </FieldLabel>

                          <TextArea
                            value={
                              project.description
                            }
                            onChange={(value) =>
                              updateProject(
                                project.id,
                                "description",
                                value
                              )
                            }
                            placeholder="Explain what you built, the technologies used, and the measurable result or impact."
                            rows={5}
                          />

                        </div>

                      </EntryCard>

                    )
                  )}

                </div>

              )}

            </EditorSection>


            {/* CERTIFICATIONS */}

            <EditorSection title="Certifications">

              <SectionHeader
                text="Add relevant professional certifications."
                buttonText="+ Add Certification"
                onClick={addCertification}
              />

              {resumeData.certifications.length === 0 ? (

                <EmptySection text="No certifications added yet." />

              ) : (

                <div className="space-y-5">

                  {resumeData.certifications.map(
                    (certification, index) => (

                      <EntryCard
                        key={certification.id}
                        title={`Certification ${index + 1}`}
                        onRemove={() =>
                          removeCertification(
                            certification.id
                          )
                        }
                      >

                        <div className="grid gap-4 md:grid-cols-2">

                          <Field
                            label="Certification Name"
                            value={
                              certification.name
                            }
                            onChange={(value) =>
                              updateCertification(
                                certification.id,
                                "name",
                                value
                              )
                            }
                            placeholder="Microsoft Power BI Data Analyst"
                          />

                          <Field
                            label="Issuing Organisation"
                            value={
                              certification.issuer
                            }
                            onChange={(value) =>
                              updateCertification(
                                certification.id,
                                "issuer",
                                value
                              )
                            }
                            placeholder="Microsoft"
                          />

                          <Field
                            label="Issue Date"
                            type="month"
                            value={
                              certification.issueDate
                            }
                            onChange={(value) =>
                              updateCertification(
                                certification.id,
                                "issueDate",
                                value
                              )
                            }
                          />

                          <Field
                            label="Credential URL"
                            value={
                              certification.credentialUrl
                            }
                            onChange={(value) =>
                              updateCertification(
                                certification.id,
                                "credentialUrl",
                                value
                              )
                            }
                            placeholder="Credential verification link"
                          />

                        </div>

                      </EntryCard>

                    )
                  )}

                </div>

              )}

            </EditorSection>

          </div>


          {/* RIGHT PREVIEW */}

          <div>

            <div className="sticky top-6">

              <div className="mb-3 flex items-center justify-between">

                <h2 className="text-lg font-semibold">
                  Resume Preview
                </h2>

                <PrintResumeButton />

              </div>

              <TemplateSelector
                selectedTemplate={
                  selectedTemplate
                }
                onTemplateChange={
                  setSelectedTemplate
                }
              />

              <div className="print-resume mt-4 min-h-[900px] bg-white p-8 text-black shadow-sm ring-1 ring-zinc-200 md:p-10">

                <TemplateRenderer
                  data={resumeData}
                  template={
                    selectedTemplate
                  }
                />

              </div>

            </div>

          </div>

        </div>

      </div>

    </main>
  );
}


// ======================================================
// EDITOR COMPONENTS
// ======================================================

function EditorSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border p-5 dark:border-zinc-800">

      <h2 className="mb-5 text-lg font-semibold">
        {title}
      </h2>

      {children}

    </section>
  );
}


function SectionHeader({
  text,
  buttonText,
  onClick,
}: {
  text: string;
  buttonText: string;
  onClick: () => void;
}) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

      <p className="text-sm text-zinc-500">
        {text}
      </p>

      <button
        type="button"
        onClick={onClick}
        className="shrink-0 rounded-lg border px-4 py-2 text-sm transition hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
      >
        {buttonText}
      </button>

    </div>
  );
}


function EntryCard({
  title,
  onRemove,
  children,
}: {
  title: string;
  onRemove: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border p-5 dark:border-zinc-800">

      <div className="mb-5 flex items-center justify-between gap-4">

        <h3 className="font-medium">
          {title}
        </h3>

        <button
          type="button"
          onClick={onRemove}
          className="text-sm text-red-500 transition hover:text-red-400"
        >
          Remove
        </button>

      </div>

      {children}

    </div>
  );
}


function FieldLabel({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <label className="mb-2 block text-sm text-zinc-500">
      {children}
    </label>
  );
}


function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
}) {
  return (
    <div>

      <label className="mb-2 block text-sm text-zinc-500">
        {label}
      </label>

      <input
        type={type}
        value={value || ""}
        disabled={disabled}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        className="w-full rounded-xl border bg-transparent px-4 py-3 outline-none transition focus:border-zinc-500 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-800"
      />

    </div>
  );
}


function TextArea({
  value,
  onChange,
  placeholder,
  rows = 5,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value || ""}
      onChange={(event) =>
        onChange(event.target.value)
      }
      placeholder={placeholder}
      rows={rows}
      className="w-full resize-y rounded-xl border bg-transparent px-4 py-3 outline-none focus:border-zinc-500 dark:border-zinc-800"
    />
  );
}


function EmptySection({
  text,
}: {
  text: string;
}) {
  return (
    <div className="rounded-xl border border-dashed p-6 text-center dark:border-zinc-800">

      <p className="text-sm text-zinc-500">
        {text}
      </p>

    </div>
  );
}