import React from "react";
import { Experience } from "@/lib/resume-types";
import PreviewSection from "./PreviewSection";
import formatMonth from "./formatMonth";

interface ExperiencePreviewProps {
  experiences: Experience[];
}

export default function ExperiencePreview({
  experiences,
}: ExperiencePreviewProps) {
  if (experiences.length === 0) {
    return null;
  }

  return (
    <PreviewSection title="Experience">
      <div className="space-y-4">
        {experiences.map((experience) => {
          const start = formatMonth(experience.startDate);

          const end = experience.current
            ? "Present"
            : formatMonth(experience.endDate);

          const dateRange = [start, end]
            .filter(Boolean)
            .join(" - ");

          return (
            <div key={experience.id}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-bold">
                    {experience.role || "Job Title"}
                  </p>

                  {(experience.company ||
                    experience.location) && (
                    <p className="text-xs">
                      {experience.company}

                      {experience.company &&
                        experience.location &&
                        " • "}

                      {experience.location}
                    </p>
                  )}
                </div>

                {dateRange && (
                  <p className="whitespace-nowrap text-xs">
                    {dateRange}
                  </p>
                )}
              </div>

              {experience.description && (
                <p className="mt-2 whitespace-pre-line text-xs leading-5">
                  {experience.description}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </PreviewSection>
  );
}