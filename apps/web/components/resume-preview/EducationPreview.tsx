import React from "react";
import { Education } from "@/lib/resume-types";
import PreviewSection from "./PreviewSection";
import formatMonth from "./formatMonth";

interface EducationPreviewProps {
  education: Education[];
}

export default function EducationPreview({
  education,
}: EducationPreviewProps) {
  if (education.length === 0) {
    return null;
  }

  return (
    <PreviewSection title="Education">
      <div className="space-y-4">
        {education.map((item) => {
          const dateRange = [
            formatMonth(item.startDate),
            formatMonth(item.endDate),
          ]
            .filter(Boolean)
            .join(" - ");

          const degreeLine = [
            item.degree,
            item.fieldOfStudy,
          ]
            .filter(Boolean)
            .join(" in ");

          return (
            <div key={item.id}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-bold">
                    {item.institution || "Institution"}
                  </p>

                  {degreeLine && (
                    <p className="text-xs">
                      {degreeLine}
                    </p>
                  )}

                  {item.location && (
                    <p className="text-xs">
                      {item.location}
                    </p>
                  )}

                  {item.grade && (
                    <p className="mt-1 text-xs">
                      Grade / CGPA: {item.grade}
                    </p>
                  )}
                </div>

                {dateRange && (
                  <p className="whitespace-nowrap text-xs">
                    {dateRange}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </PreviewSection>
  );
}