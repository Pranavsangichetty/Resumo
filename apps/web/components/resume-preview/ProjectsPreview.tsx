import React from "react";
import { Project } from "@/lib/resume-types";
import PreviewSection from "./PreviewSection";

interface ProjectsPreviewProps {
  projects: Project[];
}

export default function ProjectsPreview({
  projects,
}: ProjectsPreviewProps) {
  if (projects.length === 0) {
    return null;
  }

  return (
    <PreviewSection title="Projects">
      <div className="space-y-4">
        {projects.map((project) => (
          <div key={project.id}>
            <p className="font-bold">
              {project.name || "Project Name"}
            </p>

            {project.technologies && (
              <p className="mt-1 text-xs font-medium">
                Technologies: {project.technologies}
              </p>
            )}

            {project.link && (
              <p className="mt-1 break-all text-xs">
                {project.link}
              </p>
            )}

            {project.description && (
              <p className="mt-2 whitespace-pre-line text-xs leading-5">
                {project.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </PreviewSection>
  );
}