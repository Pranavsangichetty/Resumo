import React from "react";
import PreviewSection from "./PreviewSection";

interface SkillsPreviewProps {
  skills: string[];
}

export default function SkillsPreview({
  skills,
}: SkillsPreviewProps) {
  // Don't render if there are no skills
  if (skills.length === 0) {
    return null;
  }

  return (
    <PreviewSection title="Technical Skills">
      <p className="leading-5 break-words [overflow-wrap:anywhere]">
        {skills.join(" • ")}
      </p>
    </PreviewSection>
  );
}
