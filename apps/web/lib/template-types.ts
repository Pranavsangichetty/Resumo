export const TEMPLATE_NAMES = [
  "ats",
  "modern",
  "harvard",
  "google",
  "executive",
  "minimal",
  "creative",
  "elegant",
  "cloud",
] as const;

export type ResumeTemplate =
  (typeof TEMPLATE_NAMES)[number];

export const DEFAULT_TEMPLATE: ResumeTemplate =
  "ats";