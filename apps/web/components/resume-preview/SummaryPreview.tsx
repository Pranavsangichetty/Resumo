import React from "react";
import PreviewSection from "./PreviewSection";

interface SummaryPreviewProps {
  summary: string;
}

export default function SummaryPreview({
  summary,
}: SummaryPreviewProps) {
  // Don't render the section if no summary exists
  if (!summary.trim()) {
    return null;
  }

  return (
    <PreviewSection title="Professional Summary">
      <p className="whitespace-pre-line leading-5">
        {summary}
      </p>
    </PreviewSection>
  );
}