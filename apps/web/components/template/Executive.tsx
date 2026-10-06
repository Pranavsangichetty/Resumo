"use client";

import { ResumeData } from "@/lib/resume-types";

interface ExecutiveProps {
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
    <section style={{ marginTop: "24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
        <h2
          style={{
            fontSize: "11px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.2em",
            color: "#78716c",
            whiteSpace: "nowrap",
            margin: 0,
          }}
        >
          {title}
        </h2>
        <div style={{ flex: 1, height: "1px", backgroundColor: "#d6d3d1" }} />
      </div>
      <div>{children}</div>
    </section>
  );
}

function formatDate(date: string) {
  if (!date) return "";
  const value = new Date(date);
  if (Number.isNaN(value.getTime())) return date;
  return value.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

export default function Executive({ data }: ExecutiveProps) {
  const personal = data.personal;

  return (
    <article
      style={{
        maxWidth: "850px",
        margin: "0 auto",
        backgroundColor: "#ffffff",
        fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
        fontSize: "13px",
        lineHeight: "1.5",
        color: "#1c1917",
      }}
    >
      {/* HEADER */}
      <header
        style={{
          background: "#1c1917",
          padding: "36px 40px",
          color: "#ffffff",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div>
            <p
              style={{
                fontSize: "10px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.3em",
                color: "#a8a29e",
                margin: 0,
              }}
            >
              Curriculum Vitae
            </p>
            <h1
              style={{
                fontSize: "34px",
                fontWeight: 700,
                letterSpacing: "-0.02em",
                margin: "6px 0 0",
              }}
            >
              {personal.fullName || "Your Name"}
            </h1>
            {personal.location && (
              <p style={{ marginTop: "6px", fontSize: "13px", color: "#a8a29e" }}>
                {personal.location}
              </p>
            )}
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "4px",
              textAlign: "right",
              fontSize: "12px",
              color: "#d6d3d1",
            }}
          >
            {personal.email && <span>{personal.email}</span>}
            {personal.phone && <span>{personal.phone}</span>}
            {personal.linkedin && <span>{personal.linkedin}</span>}
            {personal.github && <span>{personal.github}</span>}
            {personal.portfolio && <span>{personal.portfolio}</span>}
          </div>
        </div>

        {/* Accent bar */}
        <div
          style={{
            marginTop: "16px",
            height: "3px",
            background: "linear-gradient(90deg, #d97706, #f59e0b, transparent)",
            borderRadius: "2px",
          }}
        />
      </header>

      {/* BODY */}
      <div style={{ padding: "32px 40px 40px" }}>

        {/* SUMMARY */}
        {data.summary && (
          <Section title="Executive Profile">
            <p
              style={{
                whiteSpace: "pre-line",
                color: "#44403c",
                lineHeight: "1.75",
                maxWidth: "680px",
              }}
            >
              {data.summary}
            </p>
          </Section>
        )}

        {/* EXPERIENCE */}
        {data.experiences.length > 0 && (
          <Section title="Professional Experience">
            <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
              {data.experiences.map((experience) => {
                const dateRange = [
                  formatDate(experience.startDate),
                  experience.current
                    ? "Present"
                    : formatDate(experience.endDate),
                ]
                  .filter(Boolean)
                  .join(" – ");

                return (
                  <div
                    key={experience.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "140px 1fr",
                      gap: "16px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "12px",
                        fontWeight: 500,
                        color: "#78716c",
                        paddingTop: "2px",
                      }}
                    >
                      {dateRange}
                    </div>
                    <div>
                      <h3 style={{ fontWeight: 700, fontSize: "14px", margin: 0 }}>
                        {experience.role || "Role"}
                      </h3>
                      {experience.company && (
                        <p style={{ marginTop: "2px", fontWeight: 500, color: "#78716c", fontSize: "13px" }}>
                          {experience.company}
                          {experience.location ? ` · ${experience.location}` : ""}
                        </p>
                      )}
                      {experience.description && (
                        <p
                          style={{
                            marginTop: "8px",
                            whiteSpace: "pre-line",
                            color: "#44403c",
                            lineHeight: "1.7",
                          }}
                        >
                          {experience.description}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Section>
        )}

        {/* EDUCATION */}
        {data.education.length > 0 && (
          <Section title="Education">
            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              {data.education.map((education) => {
                const dateRange = [
                  formatDate(education.startDate),
                  formatDate(education.endDate),
                ]
                  .filter(Boolean)
                  .join(" – ");
                const degree = [education.degree, education.fieldOfStudy]
                  .filter(Boolean)
                  .join(" in ");

                return (
                  <div
                    key={education.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "140px 1fr",
                      gap: "16px",
                    }}
                  >
                    <div style={{ fontSize: "12px", fontWeight: 500, color: "#78716c", paddingTop: "2px" }}>
                      {dateRange}
                    </div>
                    <div>
                      <h3 style={{ fontWeight: 700, fontSize: "14px", margin: 0 }}>
                        {education.institution || "Institution"}
                      </h3>
                      {degree && (
                        <p style={{ color: "#44403c", margin: "2px 0 0" }}>{degree}</p>
                      )}
                      {education.location && (
                        <p style={{ fontSize: "12px", color: "#78716c", margin: "1px 0 0" }}>
                          {education.location}
                        </p>
                      )}
                      {education.grade && (
                        <p style={{ fontSize: "12px", color: "#78716c", margin: "2px 0 0" }}>
                          Grade / CGPA: {education.grade}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Section>
        )}

        {/* PROJECTS */}
        {data.projects.length > 0 && (
          <Section title="Selected Projects">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
              }}
            >
              {data.projects.map((project) => (
                <div
                  key={project.id}
                  style={{
                    borderLeft: "2px solid #d6d3d1",
                    paddingLeft: "14px",
                  }}
                >
                  <h3 style={{ fontWeight: 700, fontSize: "14px", margin: 0 }}>
                    {project.name || "Project Name"}
                  </h3>
                  {project.technologies && (
                    <p style={{ marginTop: "2px", fontSize: "12px", fontWeight: 500, color: "#78716c" }}>
                      {project.technologies}
                    </p>
                  )}
                  {project.description && (
                    <p
                      style={{
                        marginTop: "6px",
                        whiteSpace: "pre-line",
                        color: "#44403c",
                        lineHeight: "1.7",
                      }}
                    >
                      {project.description}
                    </p>
                  )}
                  {project.link && (
                    <p style={{ fontSize: "11px", color: "#78716c", wordBreak: "break-all", marginTop: "2px" }}>
                      {project.link}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* SKILLS */}
        {data.skills.length > 0 && (
          <Section title="Core Skills">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "6px 24px",
              }}
            >
              {data.skills.map((skill) => (
                <div
                  key={skill}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "13px",
                  }}
                >
                  <span
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      backgroundColor: "#d97706",
                      flexShrink: 0,
                    }}
                  />
                  <span>{skill}</span>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* CERTIFICATIONS */}
        {data.certifications.length > 0 && (
          <Section title="Certifications">
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {data.certifications.map((certification) => (
                <div
                  key={certification.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "16px",
                  }}
                >
                  <div>
                    <h3 style={{ fontWeight: 700, margin: 0 }}>{certification.name}</h3>
                    {certification.issuer && (
                      <p style={{ color: "#44403c", margin: "1px 0 0" }}>
                        {certification.issuer}
                      </p>
                    )}
                    {certification.credentialUrl && (
                      <p
                        style={{
                          fontSize: "11px",
                          color: "#78716c",
                          wordBreak: "break-all",
                          margin: "1px 0 0",
                        }}
                      >
                        {certification.credentialUrl}
                      </p>
                    )}
                  </div>
                  {certification.issueDate && (
                    <p style={{ fontSize: "12px", color: "#78716c", whiteSpace: "nowrap" }}>
                      {formatDate(certification.issueDate)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}
      </div>
    </article>
  );
}