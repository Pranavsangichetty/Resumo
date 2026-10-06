"use client";

import { ResumeData } from "@/lib/resume-types";

interface ElegantProps {
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
    <section style={{ marginTop: "26px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "14px" }}>
        <div style={{ width: "8px", height: "8px", backgroundColor: "#b8860b", transform: "rotate(45deg)", flexShrink: 0 }} />
        <h2
          style={{
            fontSize: "13px",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            color: "#1a1a1a",
            margin: 0,
            fontFamily: "'Georgia', 'Palatino Linotype', serif",
          }}
        >
          {title}
        </h2>
        <div style={{ flex: 1, height: "1px", backgroundColor: "#d4af37" }} />
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

export default function Elegant({ data }: ElegantProps) {
  const personal = data.personal;

  const contactItems = [
    personal.email,
    personal.phone,
    personal.location,
    personal.linkedin,
    personal.github,
    personal.portfolio,
  ].filter(Boolean);

  return (
    <article
      style={{
        maxWidth: "850px",
        margin: "0 auto",
        backgroundColor: "#fffef9",
        fontFamily: "'Georgia', 'Palatino Linotype', serif",
        fontSize: "13px",
        lineHeight: "1.55",
        color: "#1a1a1a",
        border: "1px solid #e8e0d0",
      }}
    >
      {/* HEADER */}
      <header
        style={{
          textAlign: "center",
          padding: "40px 48px 28px",
          borderBottom: "2px solid #d4af37",
        }}
      >
        {/* Decorative line */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            marginBottom: "12px",
          }}
        >
          <div style={{ width: "40px", height: "1px", backgroundColor: "#d4af37" }} />
          <div style={{ width: "6px", height: "6px", backgroundColor: "#d4af37", transform: "rotate(45deg)" }} />
          <div style={{ width: "40px", height: "1px", backgroundColor: "#d4af37" }} />
        </div>

        <h1
          style={{
            fontSize: "34px",
            fontWeight: 400,
            letterSpacing: "0.06em",
            color: "#1a1a1a",
            margin: 0,
            fontFamily: "'Georgia', 'Palatino Linotype', serif",
          }}
        >
          {personal.fullName || "Your Name"}
        </h1>

        {contactItems.length > 0 && (
          <div
            style={{
              marginTop: "12px",
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "4px",
              fontSize: "11px",
              color: "#8b7355",
              fontFamily: "'Segoe UI', sans-serif",
            }}
          >
            {contactItems.map((item, i) => (
              <span key={i}>
                {i > 0 && <span style={{ margin: "0 6px", color: "#d4af37" }}>◈</span>}
                {item}
              </span>
            ))}
          </div>
        )}

        {/* Decorative line */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            marginTop: "14px",
          }}
        >
          <div style={{ width: "40px", height: "1px", backgroundColor: "#d4af37" }} />
          <div style={{ width: "6px", height: "6px", backgroundColor: "#d4af37", transform: "rotate(45deg)" }} />
          <div style={{ width: "40px", height: "1px", backgroundColor: "#d4af37" }} />
        </div>
      </header>

      {/* BODY */}
      <div style={{ padding: "28px 48px 40px" }}>

        {/* SUMMARY */}
        {data.summary && (
          <Section title="Profile">
            <p
              style={{
                whiteSpace: "pre-line",
                color: "#4a4a4a",
                lineHeight: "1.8",
                fontStyle: "italic",
                textAlign: "justify",
              }}
            >
              {data.summary}
            </p>
          </Section>
        )}

        {/* EXPERIENCE */}
        {data.experiences.length > 0 && (
          <Section title="Experience">
            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
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
                  <div key={experience.id}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: "20px",
                      }}
                    >
                      <div>
                        <h3
                          style={{
                            fontWeight: 700,
                            fontSize: "14px",
                            margin: 0,
                            fontFamily: "'Georgia', serif",
                          }}
                        >
                          {experience.role || "Role"}
                        </h3>
                        {experience.company && (
                          <p
                            style={{
                              color: "#8b7355",
                              margin: "3px 0 0",
                              fontStyle: "italic",
                              fontFamily: "'Segoe UI', sans-serif",
                              fontSize: "12px",
                            }}
                          >
                            {experience.company}
                            {experience.location ? `, ${experience.location}` : ""}
                          </p>
                        )}
                      </div>
                      {dateRange && (
                        <p
                          style={{
                            whiteSpace: "nowrap",
                            fontSize: "11px",
                            color: "#b8860b",
                            fontWeight: 500,
                            fontFamily: "'Segoe UI', sans-serif",
                          }}
                        >
                          {dateRange}
                        </p>
                      )}
                    </div>
                    {experience.description && (
                      <p
                        style={{
                          marginTop: "8px",
                          whiteSpace: "pre-line",
                          color: "#4a4a4a",
                          lineHeight: "1.75",
                        }}
                      >
                        {experience.description}
                      </p>
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
                const degree = [education.degree, education.fieldOfStudy]
                  .filter(Boolean)
                  .join(" in ");
                const dateRange = [
                  formatDate(education.startDate),
                  formatDate(education.endDate),
                ]
                  .filter(Boolean)
                  .join(" – ");

                return (
                  <div
                    key={education.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: "20px",
                    }}
                  >
                    <div>
                      <h3
                        style={{
                          fontWeight: 700,
                          fontSize: "14px",
                          margin: 0,
                          fontFamily: "'Georgia', serif",
                        }}
                      >
                        {education.institution || "Institution"}
                      </h3>
                      {degree && (
                        <p style={{ fontStyle: "italic", margin: "2px 0 0", color: "#4a4a4a" }}>
                          {degree}
                        </p>
                      )}
                      {education.location && (
                        <p
                          style={{
                            fontSize: "11px",
                            color: "#8b7355",
                            margin: "1px 0 0",
                            fontFamily: "'Segoe UI', sans-serif",
                          }}
                        >
                          {education.location}
                        </p>
                      )}
                      {education.grade && (
                        <p style={{ fontSize: "11px", color: "#8b7355", margin: "1px 0 0", fontFamily: "'Segoe UI', sans-serif" }}>
                          Grade / CGPA: {education.grade}
                        </p>
                      )}
                    </div>
                    {dateRange && (
                      <p
                        style={{
                          whiteSpace: "nowrap",
                          fontSize: "11px",
                          color: "#b8860b",
                          fontWeight: 500,
                          fontFamily: "'Segoe UI', sans-serif",
                        }}
                      >
                        {dateRange}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </Section>
        )}

        {/* PROJECTS */}
        {data.projects.length > 0 && (
          <Section title="Projects">
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {data.projects.map((project) => (
                <div key={project.id}>
                  <h3
                    style={{
                      fontWeight: 700,
                      fontSize: "14px",
                      margin: 0,
                      fontFamily: "'Georgia', serif",
                    }}
                  >
                    {project.name || "Project Name"}
                  </h3>
                  {project.technologies && (
                    <p
                      style={{
                        fontSize: "11px",
                        fontStyle: "italic",
                        color: "#8b7355",
                        margin: "2px 0 0",
                        fontFamily: "'Segoe UI', sans-serif",
                      }}
                    >
                      {project.technologies}
                    </p>
                  )}
                  {project.description && (
                    <p
                      style={{
                        marginTop: "6px",
                        whiteSpace: "pre-line",
                        color: "#4a4a4a",
                        lineHeight: "1.75",
                      }}
                    >
                      {project.description}
                    </p>
                  )}
                  {project.link && (
                    <p
                      style={{
                        fontSize: "11px",
                        color: "#b8860b",
                        wordBreak: "break-all",
                        marginTop: "2px",
                        fontFamily: "'Segoe UI', sans-serif",
                      }}
                    >
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
          <Section title="Skills & Expertise">
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "6px",
              }}
            >
              {data.skills.map((skill) => (
                <span
                  key={skill}
                  style={{
                    padding: "3px 14px",
                    border: "1px solid #d4af37",
                    borderRadius: "2px",
                    fontSize: "12px",
                    color: "#8b7355",
                    fontFamily: "'Segoe UI', sans-serif",
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </Section>
        )}

        {/* CERTIFICATIONS */}
        {data.certifications.length > 0 && (
          <Section title="Certifications">
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {data.certifications.map((certification) => (
                <div
                  key={certification.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "20px",
                  }}
                >
                  <div>
                    <h3 style={{ fontWeight: 700, margin: 0, fontFamily: "'Georgia', serif" }}>
                      {certification.name}
                    </h3>
                    {certification.issuer && (
                      <p style={{ color: "#8b7355", margin: "1px 0 0", fontFamily: "'Segoe UI', sans-serif", fontSize: "12px" }}>
                        {certification.issuer}
                      </p>
                    )}
                    {certification.credentialUrl && (
                      <p
                        style={{
                          fontSize: "11px",
                          color: "#b8860b",
                          wordBreak: "break-all",
                          margin: "1px 0 0",
                          fontFamily: "'Segoe UI', sans-serif",
                        }}
                      >
                        {certification.credentialUrl}
                      </p>
                    )}
                  </div>
                  {certification.issueDate && (
                    <p
                      style={{
                        whiteSpace: "nowrap",
                        fontSize: "11px",
                        color: "#b8860b",
                        fontFamily: "'Segoe UI', sans-serif",
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
