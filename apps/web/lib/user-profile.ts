import { ResumeData, emptyResumeData } from "./resume-types";

export interface UserProfilePersonal {
  fullName: string;
  headline: string;
  email: string;
  phone: string;
  location: string;
  totalExperience: string;
  currentRole: string;
  currentCompany: string;
  noticePeriod: string;
  expectedSalary: string;
  linkedin: string;
  github: string;
  portfolio: string;
}

export interface UserProfileExperience {
  id: string;
  company: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface UserProfileEducation {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  location: string;
  startDate: string;
  endDate: string;
  grade: string;
}

export interface UserProfileProject {
  id: string;
  name: string;
  technologies: string;
  link: string;
  description: string;
}

export interface UserProfileCertification {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  credentialUrl: string;
}

export interface UserProfile {
  personal: UserProfilePersonal;
  summary: string;
  skills: string[];
  experiences: UserProfileExperience[];
  education: UserProfileEducation[];
  projects: UserProfileProject[];
  certifications: UserProfileCertification[];
  languages: string[];
  updatedAt?: string;
}

export const defaultUserProfile: UserProfile = {
  personal: {
    fullName: "",
    headline: "",
    email: "",
    phone: "",
    location: "",
    totalExperience: "",
    currentRole: "",
    currentCompany: "",
    noticePeriod: "",
    expectedSalary: "",
    linkedin: "",
    github: "",
    portfolio: "",
  },
  summary: "",
  skills: [],
  experiences: [],
  education: [],
  projects: [],
  certifications: [],
  languages: [],
};

const PROFILE_KEY = "resumo_user_profile";

export function getUserProfileKey(userId?: number | string | null): string {
  if (userId) return `${PROFILE_KEY}_${userId}`;
  return PROFILE_KEY;
}

export function getUserProfile(userId?: number | string | null): UserProfile {
  if (typeof window === "undefined") return defaultUserProfile;

  try {
    const key = getUserProfileKey(userId);
    const raw = localStorage.getItem(key) || localStorage.getItem(PROFILE_KEY);
    if (!raw) return defaultUserProfile;
    const parsed = JSON.parse(raw);
    return {
      ...defaultUserProfile,
      ...parsed,
      personal: {
        ...defaultUserProfile.personal,
        ...(parsed.personal || {}),
      },
      skills: Array.isArray(parsed.skills) ? parsed.skills : [],
      experiences: Array.isArray(parsed.experiences) ? parsed.experiences : [],
      education: Array.isArray(parsed.education) ? parsed.education : [],
      projects: Array.isArray(parsed.projects) ? parsed.projects : [],
      certifications: Array.isArray(parsed.certifications) ? parsed.certifications : [],
      languages: Array.isArray(parsed.languages) ? parsed.languages : [],
    };
  } catch (e) {
    console.error("Failed to parse user profile from localStorage:", e);
    return defaultUserProfile;
  }
}

export function saveUserProfile(profile: UserProfile, userId?: number | string | null): void {
  if (typeof window === "undefined") return;

  try {
    const toSave: UserProfile = {
      ...profile,
      updatedAt: new Date().toISOString(),
    };
    const jsonStr = JSON.stringify(toSave);
    const key = getUserProfileKey(userId);
    localStorage.setItem(key, jsonStr);
    localStorage.setItem(PROFILE_KEY, jsonStr); // Also keep master fallback
  } catch (e) {
    console.error("Failed to save user profile to localStorage:", e);
  }
}

export function calculateProfileCompleteness(profile: UserProfile): {
  percentage: number;
  completedSections: string[];
  missingSections: string[];
  tips: string[];
} {
  const completedSections: string[] = [];
  const missingSections: string[] = [];
  const tips: string[] = [];
  let score = 0;

  // Personal Info (20%)
  const hasBasicContact =
    Boolean(profile.personal.fullName?.trim()) &&
    Boolean(profile.personal.email?.trim()) &&
    Boolean(profile.personal.phone?.trim());
  if (hasBasicContact) {
    score += 20;
    completedSections.push("Contact Details");
  } else {
    missingSections.push("Full Name, Email & Phone");
    tips.push("Add your full name, email, and phone number.");
  }

  // Headline & Location (10%)
  if (profile.personal.headline?.trim() && profile.personal.location?.trim()) {
    score += 10;
    completedSections.push("Headline & Location");
  } else {
    missingSections.push("Headline & Location");
    tips.push("Add a professional headline and current city.");
  }

  // Professional Summary (15%)
  if (profile.summary?.trim() && profile.summary.trim().length > 30) {
    score += 15;
    completedSections.push("Professional Summary");
  } else {
    missingSections.push("Summary");
    tips.push("Write a short professional summary to capture recruiter attention.");
  }

  // Key Skills (15%)
  if (profile.skills && profile.skills.length >= 3) {
    score += 15;
    completedSections.push("Key Skills");
  } else {
    missingSections.push("Skills (at least 3)");
    tips.push("Add at least 3 core technical or domain skills.");
  }

  // Work Experience (15%)
  if (profile.experiences && profile.experiences.length > 0) {
    score += 15;
    completedSections.push("Work Experience");
  } else {
    missingSections.push("Experience");
    tips.push("Add your work history or internships.");
  }

  // Education (15%)
  if (profile.education && profile.education.length > 0) {
    score += 15;
    completedSections.push("Education");
  } else {
    missingSections.push("Education");
    tips.push("Add your highest qualification or degree.");
  }

  // Projects or Certifications (10%)
  if (
    (profile.projects && profile.projects.length > 0) ||
    (profile.certifications && profile.certifications.length > 0) ||
    Boolean(profile.personal.linkedin?.trim() || profile.personal.github?.trim())
  ) {
    score += 10;
    completedSections.push("Projects / Links");
  } else {
    missingSections.push("Projects, Certifications or Links");
    tips.push("Include a project, certification, or your LinkedIn/GitHub URL.");
  }

  return {
    percentage: Math.min(100, score),
    completedSections,
    missingSections,
    tips,
  };
}

export function profileToResumeData(profile: UserProfile): ResumeData {
  return {
    personal: {
      fullName: profile.personal.fullName || "",
      email: profile.personal.email || "",
      phone: profile.personal.phone || "",
      location: profile.personal.location || "",
      linkedin: profile.personal.linkedin || "",
      github: profile.personal.github || "",
      portfolio: profile.personal.portfolio || "",
    },
    summary: profile.summary || "",
    skills: profile.skills || [],
    experiences: (profile.experiences || []).map((exp) => ({
      id: exp.id || Math.random().toString(36).substring(2, 9),
      company: exp.company || "",
      role: exp.role || "",
      location: exp.location || "",
      startDate: exp.startDate || "",
      endDate: exp.endDate || "",
      current: Boolean(exp.current),
      description: exp.description || "",
    })),
    education: (profile.education || []).map((edu) => ({
      id: edu.id || Math.random().toString(36).substring(2, 9),
      institution: edu.institution || "",
      degree: edu.degree || "",
      fieldOfStudy: edu.fieldOfStudy || "",
      location: edu.location || "",
      startDate: edu.startDate || "",
      endDate: edu.endDate || "",
      grade: edu.grade || "",
    })),
    projects: (profile.projects || []).map((proj) => ({
      id: proj.id || Math.random().toString(36).substring(2, 9),
      name: proj.name || "",
      technologies: proj.technologies || "",
      link: proj.link || "",
      description: proj.description || "",
    })),
    certifications: (profile.certifications || []).map((cert) => ({
      id: cert.id || Math.random().toString(36).substring(2, 9),
      name: cert.name || "",
      issuer: cert.issuer || "",
      issueDate: cert.issueDate || "",
      credentialUrl: cert.credentialUrl || "",
    })),
    courses: [],
  };
}

export function resumeDataToProfile(
  resume: ResumeData,
  currentProfile?: UserProfile
): UserProfile {
  const base = currentProfile || defaultUserProfile;
  return {
    ...base,
    personal: {
      ...base.personal,
      fullName: resume.personal?.fullName || base.personal.fullName,
      email: resume.personal?.email || base.personal.email,
      phone: resume.personal?.phone || base.personal.phone,
      location: resume.personal?.location || base.personal.location,
      linkedin: resume.personal?.linkedin || base.personal.linkedin,
      github: resume.personal?.github || base.personal.github,
      portfolio: resume.personal?.portfolio || base.personal.portfolio,
    },
    summary: resume.summary || base.summary,
    skills: resume.skills && resume.skills.length > 0 ? resume.skills : base.skills,
    experiences:
      resume.experiences && resume.experiences.length > 0
        ? resume.experiences.map((exp) => ({
            id: exp.id || Math.random().toString(36).substring(2, 9),
            company: exp.company || "",
            role: exp.role || "",
            location: exp.location || "",
            startDate: exp.startDate || "",
            endDate: exp.endDate || "",
            current: Boolean(exp.current),
            description: exp.description || "",
          }))
        : base.experiences,
    education:
      resume.education && resume.education.length > 0
        ? resume.education.map((edu) => ({
            id: edu.id || Math.random().toString(36).substring(2, 9),
            institution: edu.institution || "",
            degree: edu.degree || "",
            fieldOfStudy: edu.fieldOfStudy || "",
            location: edu.location || "",
            startDate: edu.startDate || "",
            endDate: edu.endDate || "",
            grade: edu.grade || "",
          }))
        : base.education,
    projects:
      resume.projects && resume.projects.length > 0
        ? resume.projects.map((proj) => ({
            id: proj.id || Math.random().toString(36).substring(2, 9),
            name: proj.name || "",
            technologies: proj.technologies || "",
            link: proj.link || "",
            description: proj.description || "",
          }))
        : base.projects,
    certifications:
      resume.certifications && resume.certifications.length > 0
        ? resume.certifications.map((cert) => ({
            id: cert.id || Math.random().toString(36).substring(2, 9),
            name: cert.name || "",
            issuer: cert.issuer || "",
            issueDate: cert.issueDate || "",
            credentialUrl: cert.credentialUrl || "",
          }))
        : base.certifications,
    languages: base.languages || [],
    updatedAt: new Date().toISOString(),
  };
}
