import React from "react";
import { ResumeData } from "@/lib/resume-types";

import ResumeHeader from "./ResumeHeader";
import SummaryPreview from "./SummaryPreview";
import SkillsPreview from "./SkillsPreview";
import ExperiencePreview from "./ExperiencePreview";
import EducationPreview from "./EducationPreview";
import ProjectsPreview from "./ProjectsPreview";
import CertificationsPreview from "./CertificationsPreview";

interface ResumePreviewProps {
  data: ResumeData;
}

export default function ResumePreview({
  data,
}: ResumePreviewProps) {
  const hasContent =
    Boolean(data.summary) ||
    data.skills.length > 0 ||
    data.experiences.length > 0 ||
    data.education.length > 0 ||
    data.projects.length > 0 ||
    data.certifications.length > 0;

  return (
    <article className="text-sm">
      <ResumeHeader
        personal={data.personal}
      />

      <SummaryPreview
        summary={data.summary}
      />

      <SkillsPreview
        skills={data.skills}
      />

      <ExperiencePreview
        experiences={data.experiences}
      />

      <EducationPreview
        education={data.education}
      />

      <ProjectsPreview
        projects={data.projects}
      />

      <CertificationsPreview
        certifications={data.certifications}
      />

      {!hasContent && (
        <p className="mt-10 text-center text-zinc-400">
          Start entering your information to build
          your resume preview.
        </p>
      )}
    </article>
  );
}