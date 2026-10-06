"use client";

import { ResumeData } from "@/lib/resume-types";

interface ATSProfessionalProps {
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
    <section style={{ marginTop: "22px" }}>
      <h2
        style={{
          fontSize: "12px",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          color: "#0f172a",
          borderBottom: "1.5px solid #0f172a",
          paddingBottom: "4px",
          marginBottom: "10px",
        }}
      >
        {title}
      </h2>

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

/** Formats multiline descriptions into ATS-friendly clean bullet points */
function FormattedDescription({ text }: { text: string }) {
  if (!text) return null;
  const lines = text.split("\n").filter((l) => l.trim().length > 0);

  // If already structured with bullets or multiple lines, render as bullet list
  if (lines.length > 1 || lines.some((l) => l.trim().startsWith("•") || l.trim().startsWith("-"))) {
    return (
      <ul
        style={{
          margin: "6px 0 0",
          paddingLeft: "18px",
          display: "flex",
          flexDirection: "column",
          gap: "4px",
          listStyleType: "disc",
        }}
      >
        {lines.map((line, idx) => {
          const cleaned = line.replace(/^[•\-\*]\s*/, "").trim();
          return (
            <li
              key={idx}
              style={{
                color: "#334155",
                lineHeight: "1.6",
                fontSize: "12.5px",
              }}
            >
              {cleaned}
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <p
      style={{
        marginTop: "6px",
        whiteSpace: "pre-line",
        color: "#334155",
        lineHeight: "1.65",
        fontSize: "12.5px",
      }}
    >
      {text}
    </p>
  );
}

export default function ATSProfessional({
  data,
}: ATSProfessionalProps) {
  const personal = data.personal;
  const fullName = personal.fullName || "Your Name";

  const contactItems = [
    personal.email && { text: personal.email, href: `mailto:${personal.email}` },
    personal.phone && { text: personal.phone, href: `tel:${personal.phone}` },
    personal.location && { text: personal.location, href: null },
    personal.linkedin && {
      text: personal.linkedin.replace(/^https?:\/\/(www\.)?/, ""),
      href: personal.linkedin.startsWith("http") ? personal.linkedin : `https://${personal.linkedin}`,
    },
    personal.github && {
      text: personal.github.replace(/^https?:\/\/(www\.)?/, ""),
      href: personal.github.startsWith("http") ? personal.github : `https://${personal.github}`,
    },
    personal.portfolio && {
      text: personal.portfolio.replace(/^https?:\/\/(www\.)?/, ""),
      href: personal.portfolio.startsWith("http") ? personal.portfolio : `https://${personal.portfolio}`,
    },
  ].filter(Boolean) as { text: string; href: string | null }[];

  return (
    <article
      style={{
        maxWidth: "850px",
        margin: "0 auto",
        backgroundColor: "#ffffff",
        fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, Arial, sans-serif",
        fontSize: "13px",
        lineHeight: "1.55",
        color: "#0f172a",
        padding: "40px 48px",
        boxSizing: "border-box",
        borderTop: "4px solid #1e3a5f",
      }}
    >
      {/* ATS-OPTIMIZED HEADER */}
      <header
        style={{
          borderBottom: "1px solid #cbd5e1",
          paddingBottom: "16px",
          textAlign: "left",
        }}
      >
        <h1
          style={{
            fontSize: "28px",
            fontWeight: 700,
            letterSpacing: "-0.01em",
            color: "#0f172a",
            margin: "0 0 8px 0",
          }}
        >
          {fullName}
        </h1>

        {contactItems.length > 0 && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: "4px 8px",
              fontSize: "12px",
              color: "#475569",
            }}
          >
            {contactItems.map((item, i) => (
              <span key={i} style={{ display: "inline-flex", alignItems: "center" }}>
                {i > 0 && (
                  <span style={{ color: "#94a3b8", margin: "0 8px" }}>|</span>
                )}
                {item.href ? (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      color: "#1e40af",
                      textDecoration: "none",
                    }}
                  >
                    {item.text}
                  </a>
                ) : (
                  <span>{item.text}</span>
                )}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* BODY */}
      <div>
        {/* SUMMARY */}
        {data.summary && (
          <Section title="Professional Summary">
            <p
              style={{
                whiteSpace: "pre-line",
                color: "#334155",
                lineHeight: "1.65",
                margin: 0,
                fontSize: "12.5px",
              }}
            >
              {data.summary}
            </p>
          </Section>
        )}

        {/* SKILLS */}
        {data.skills.length > 0 && (
          <Section title="Core Competencies & Skills">
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "6px 8px",
              }}
            >
              {data.skills.map((skill) => (
                <span
                  key={skill}
                  style={{
                    padding: "3px 10px",
                    backgroundColor: "#f1f5f9",
                    borderRadius: "4px",
                    fontSize: "12px",
                    fontWeight: 500,
                    color: "#0f172a",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </Section>
        )}

        {/* EXPERIENCE */}
        {data.experiences.length > 0 && (
          <Section title="Professional Experience">
            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              {data.experiences.map((experience) => {
                const startDate = formatDate(experience.startDate);
                const endDate = experience.current
                  ? "Present"
                  : formatDate(experience.endDate);
                const dateRange = [startDate, endDate]
                  .filter(Boolean)
                  .join(" – ");

                return (
                  <div key={experience.id}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "baseline",
                        gap: "16px",
                      }}
                    >
                      <div>
                        <h3
                          style={{
                            fontWeight: 700,
                            fontSize: "13.5px",
                            color: "#0f172a",
                            margin: 0,
                          }}
                        >
                          {experience.role || "Role"}
                        </h3>
                        {experience.company && (
                          <p
                            style={{
                              fontWeight: 600,
                              color: "#1e40af",
                              margin: "2px 0 0",
                              fontSize: "12.5px",
                            }}
                          >
                            {experience.company}
                            {experience.location ? ` · ${experience.location}` : ""}
                          </p>
                        )}
                      </div>
                      {dateRange && (
                        <p
                          style={{
                            whiteSpace: "nowrap",
                            fontSize: "12px",
                            color: "#64748b",
                            fontWeight: 500,
                            margin: 0,
                          }}
                        >
                          {dateRange}
                        </p>
                      )}
                    </div>
                    {experience.description && (
                      <FormattedDescription text={experience.description} />
                    )}
                  </div>
                );
              })}
            </div>
          </Section>
        )}

        {/* EDUCATION */}
        {data.education.length > 0 && (
          <Section title="Education">
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {data.education.map((education) => {
                const startDate = formatDate(education.startDate);
                const endDate = formatDate(education.endDate);
                const dateRange = [startDate, endDate]
                  .filter(Boolean)
                  .join(" – ");
                const degreeLine = [education.degree, education.fieldOfStudy]
                  .filter(Boolean)
                  .join(" in ");

                return (
                  <div key={education.id}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "baseline",
                        gap: "16px",
                      }}
                    >
                      <div>
                        <h3
                          style={{
                            fontWeight: 700,
                            fontSize: "13.5px",
                            color: "#0f172a",
                            margin: 0,
                          }}
                        >
                          {education.institution || "Institution"}
                        </h3>
                        {degreeLine && (
                          <p
                            style={{
                              margin: "2px 0 0",
                              color: "#334155",
                              fontSize: "12.5px",
                            }}
                          >
                            {degreeLine}
                          </p>
                        )}
                        {education.location && (
                          <p
                            style={{
                              fontSize: "12px",
                              color: "#64748b",
                              margin: "1px 0 0",
                            }}
                          >
                            {education.location}
                          </p>
                        )}
                        {education.grade && (
                          <p
                            style={{
                              fontSize: "12px",
                              color: "#64748b",
                              margin: "1px 0 0",
                            }}
                          >
                            Grade / CGPA: {education.grade}
                          </p>
                        )}
                      </div>
                      {dateRange && (
                        <p
                          style={{
                            whiteSpace: "nowrap",
                            fontSize: "12px",
                            color: "#64748b",
                            fontWeight: 500,
                            margin: 0,
                          }}
                        >
                          {dateRange}
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
          <Section title="Key Projects">
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {data.projects.map((project) => (
                <div key={project.id}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                      gap: "12px",
                    }}
                  >
                    <h3
                      style={{
                        fontWeight: 700,
                        fontSize: "13.5px",
                        color: "#0f172a",
                        margin: 0,
                      }}
                    >
                      {project.name || "Project Name"}
                    </h3>
                    {project.technologies && (
                      <span
                        style={{
                          fontSize: "11.5px",
                          fontWeight: 500,
                          color: "#1e40af",
                          backgroundColor: "#eff6ff",
                          padding: "2px 8px",
                          borderRadius: "4px",
                        }}
                      >
                        {project.technologies}
                      </span>
                    )}
                  </div>
                  {project.link && (
                    <p
                      style={{
                        fontSize: "11.5px",
                        margin: "2px 0 0",
                      }}
                    >
                      <a
                        href={project.link}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          color: "#1e40af",
                          textDecoration: "none",
                        }}
                      >
                        {project.link}
                      </a>
                    </p>
                  )}
                  {project.description && (
                    <FormattedDescription text={project.description} />
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* CERTIFICATIONS */}
        {data.certifications.length > 0 && (
          <Section title="Certifications & Licenses">
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {data.certifications.map((certification) => (
                <div
                  key={certification.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    gap: "16px",
                  }}
                >
                  <div>
                    <h3
                      style={{
                        fontWeight: 700,
                        fontSize: "13px",
                        color: "#0f172a",
                        margin: 0,
                      }}
                    >
                      {certification.name || "Certification"}
                    </h3>
                    {certification.issuer && (
                      <p
                        style={{
                          color: "#334155",
                          margin: "1px 0 0",
                          fontSize: "12px",
                        }}
                      >
                        {certification.issuer}
                      </p>
                    )}
                    {certification.credentialUrl && (
                      <p style={{ margin: "1px 0 0" }}>
                        <a
                          href={certification.credentialUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            fontSize: "11px",
                            color: "#1e40af",
                            textDecoration: "none",
                          }}
                        >
                          View Credential ↗
                        </a>
                      </p>
                    )}
                  </div>
                  {certification.issueDate && (
                    <p
                      style={{
                        whiteSpace: "nowrap",
                        fontSize: "12px",
                        color: "#64748b",
                        margin: 0,
                      }}
                    >
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