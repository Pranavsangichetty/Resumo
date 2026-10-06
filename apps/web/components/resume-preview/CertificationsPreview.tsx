import React from "react";
import { Certification } from "@/lib/resume-types";
import PreviewSection from "./PreviewSection";
import formatMonth from "./formatMonth";

interface CertificationsPreviewProps {
  certifications: Certification[];
}

export default function CertificationsPreview({
  certifications,
}: CertificationsPreviewProps) {
  if (certifications.length === 0) {
    return null;
  }

  return (
    <PreviewSection title="Certifications">
      <div className="space-y-3">
        {certifications.map((certification) => (
          <div
            key={certification.id}
            className="flex items-start justify-between gap-4"
          >
            <div>
              <p className="font-bold">
                {certification.name || "Certification"}
              </p>

              {certification.issuer && (
                <p className="text-xs">
                  {certification.issuer}
                </p>
              )}

              {certification.credentialUrl && (
                <p className="mt-1 break-all text-xs">
                  {certification.credentialUrl}
                </p>
              )}
            </div>

            {certification.issueDate && (
              <p className="whitespace-nowrap text-xs">
                {formatMonth(certification.issueDate)}
              </p>
            )}
          </div>
        ))}
      </div>
    </PreviewSection>
  );
}