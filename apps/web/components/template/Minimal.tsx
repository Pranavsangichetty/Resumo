"use client";

import { ResumeData } from "@/lib/resume-types";

interface MinimalProps {
  data: ResumeData;
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-7">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
        {title}
      </h2>

      <div className="mt-2">
        {children}
      </div>
    </section>
  );
}

function formatDate(date: string) {
  if (!date) return "";

  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return date;
  }

  return value.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

export default function Minimal({
  data,
}: MinimalProps) {
  const personal = data.personal;

  return (
    <article className="mx-auto w-full max-w-[850px] bg-white px-8 py-10 text-[13px] leading-5 text-zinc-900 sm:px-12 sm:py-12">

      {/* HEADER */}

      <header>

        <h1 className="text-4xl font-light tracking-tight">
          {personal.fullName || "Your Name"}
        </h1>

        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-zinc-500">

          {personal.email && (
            <span>{personal.email}</span>
          )}

          {personal.phone && (
            <span>{personal.phone}</span>
          )}

          {personal.location && (
            <span>{personal.location}</span>
          )}

          {personal.linkedin && (
            <span>{personal.linkedin}</span>
          )}

          {personal.github && (
            <span>{personal.github}</span>
          )}

          {personal.portfolio && (
            <span>{personal.portfolio}</span>
          )}

        </div>

      </header>


      {/* SUMMARY */}

      {data.summary && (
        <Section title="About">

          <p className="max-w-3xl whitespace-pre-line text-sm leading-6 text-zinc-700">
            {data.summary}
          </p>

        </Section>
      )}


      {/* EXPERIENCE */}

      {data.experiences.length > 0 && (
        <Section title="Experience">

          <div className="space-y-5">

            {data.experiences.map(
              (experience) => {

                const dateRange = [
                  formatDate(
                    experience.startDate
                  ),
                  experience.current
                    ? "Present"
                    : formatDate(
                      experience.endDate
                    ),
                ]
                  .filter(Boolean)
                  .join(" – ");

                return (
                  <div key={experience.id}>

                    <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">

                      <div>

                        <h3 className="font-medium">
                          {experience.role ||
                            "Role"}
                        </h3>

                        {experience.company && (
                          <p className="text-xs text-zinc-500">
                            {experience.company}

                            {experience.location
                              ? ` · ${experience.location}`
                              : ""}
                          </p>
                        )}

                      </div>

                      {dateRange && (
                        <p className="text-xs text-zinc-400">
                          {dateRange}
                        </p>
                      )}

                    </div>

                    {experience.description && (
                      <p className="mt-2 max-w-3xl whitespace-pre-line text-sm leading-6 text-zinc-600">
                        {
                          experience.description
                        }
                      </p>
                    )}

                  </div>
                );
              }
            )}

          </div>

        </Section>
      )}


      {/* PROJECTS */}

      {data.projects.length > 0 && (
        <Section title="Projects">

          <div className="space-y-5">

            {data.projects.map((project) => (

              <div key={project.id}>

                <h3 className="font-medium">
                  {project.name ||
                    "Project Name"}
                </h3>

                {project.technologies && (
                  <p className="mt-1 text-xs text-zinc-500">
                    {project.technologies}
                  </p>
                )}

                {project.description && (
                  <p className="mt-2 max-w-3xl whitespace-pre-line text-sm leading-6 text-zinc-600">
                    {project.description}
                  </p>
                )}

                {project.link && (
                  <p className="mt-1 break-all text-xs text-zinc-400">
                    {project.link}
                  </p>
                )}

              </div>

            ))}

          </div>

        </Section>
      )}


      {/* EDUCATION */}

      {data.education.length > 0 && (
        <Section title="Education">

          <div className="space-y-4">

            {data.education.map((education) => {

              const degree = [
                education.degree,
                education.fieldOfStudy,
              ]
                .filter(Boolean)
                .join(" in ");

              const dateRange = [
                formatDate(
                  education.startDate
                ),
                formatDate(
                  education.endDate
                ),
              ]
                .filter(Boolean)
                .join(" – ");

              return (
                <div
                  key={education.id}
                  className="flex flex-col gap-1 sm:flex-row sm:justify-between"
                >

                  <div>

                    <h3 className="font-medium">
                      {education.institution}
                    </h3>

                    {degree && (
                      <p className="text-xs text-zinc-500">
                        {degree}
                      </p>
                    )}

                    {education.location && (
                      <p className="text-xs text-zinc-400">
                        {education.location}
                      </p>
                    )}

                    {education.grade && (
                      <p className="text-xs text-zinc-500">
                        {education.grade}
                      </p>
                    )}

                  </div>

                  {dateRange && (
                    <p className="text-xs text-zinc-400">
                      {dateRange}
                    </p>
                  )}

                </div>
              );
            })}

          </div>

        </Section>
      )}


      {/* SKILLS */}

      {data.skills.length > 0 && (
        <Section title="Skills">

          <p className="max-w-3xl text-sm text-zinc-600">
            {data.skills.join(" · ")}
          </p>

        </Section>
      )}


      {/* CERTIFICATIONS */}

      {data.certifications.length > 0 && (
        <Section title="Certifications">

          <div className="space-y-3">

            {data.certifications.map(
              (certification) => (

                <div key={certification.id}>

                  <p className="font-medium">
                    {certification.name}
                  </p>

                  <div className="flex flex-wrap gap-x-2 text-xs text-zinc-500">

                    {certification.issuer && (
                      <span>
                        {certification.issuer}
                      </span>
                    )}

                    {certification.issueDate && (
                      <span>
                        ·{" "}
                        {formatDate(
                          certification.issueDate
                        )}
                      </span>
                    )}

                  </div>

                </div>

              )
            )}

          </div>

        </Section>
      )}

    </article>
  );
}