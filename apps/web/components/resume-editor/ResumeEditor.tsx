"use client";

import { ResumeData } from "@/lib/resume-types";

interface ResumeEditorProps {
  title: string;
  resumeData: ResumeData;
  skillsInput: string;

  onTitleChange: (
    value: string
  ) => void;

  onResumeDataChange: (
    value: ResumeData
  ) => void;

  onSkillsInputChange: (
    value: string
  ) => void;
}

export default function ResumeEditor({
  title,
  resumeData,
  skillsInput,

  onTitleChange,
  onResumeDataChange,
  onSkillsInputChange,
}: ResumeEditorProps) {
  return (
    <div className="space-y-6">

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6">

        <h2 className="text-lg font-semibold text-[var(--text-primary)]">
          Resume Editor
        </h2>

        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Sprint 1 connection successful.
        </p>

      </div>

    </div>
  );
}