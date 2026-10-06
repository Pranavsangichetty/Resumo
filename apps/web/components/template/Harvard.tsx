"use client";

import { ResumeData } from "@/lib/resume-types";

interface HarvardProps {
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
          fontSize: "13px",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "#000000",
          borderBottom: "1.5px solid #000000",
          paddingBottom: "3px",
          marginBottom: "10px",
          fontFamily: "'Georgia', 'Times New Roman', serif",
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

export default function Harvard({ data }: HarvardProps) {
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
        backgroundColor: "#ffffff",
        padding: "44px 48px",
        fontFamily: "'Georgia', 'Times New Roman', serif",
        fontSize: "13px",
        lineHeight: "1.55",
        color: "#000000",
      }}
    >
      {/* HEADER */}
      <header style={{ textAlign: "center", borderBottom: "2.5px solid #000", paddingBottom: "14px" }}>
        <h1
          style={{
            fontSize: "30px",
            fontWeight: 700,
            letterSpacing: "0.02em",
            margin: 0,
            fontFamily: "'Georgia', 'Times New Roman', serif",
          }}
        >
          {personal.fullName || "Your Name"}
        </h1>

        {contactItems.length > 0 && (
          <div
            style={{
              marginTop: "8px",
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "4px",
              fontSize: "12px",
              color: "#333333",
            }}
          >
            {contactItems.map((item, i) => (
              <span key={i}>
                {i > 0 && <span style={{ margin: "0 4px", color: "#999" }}>|</span>}
                {item}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* SUMMARY */}
      {data.summary && (
        <Section title="Professional Summary">
          <p style={{ whiteSpace: "pre-line", color: "#222", lineHeight: "1.7" }}>
            {data.summary}
          </p>
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
                <div key={education.id}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: "24px",
                    }}
                  >
                    <div>
                      <p style={{ fontWeight: 700, margin: 0, fontSize: "14px" }}>
                        {education.institution}
                      </p>
                      {degree && (
                        <p style={{ margin: "2px 0 0", fontStyle: "italic" }}>{degree}</p>
                      )}
                      {education.location && (
                        <p style={{ fontSize: "12px", color: "#555", margin: "1px 0 0" }}>
                          {education.location}
                        </p>
                      )}
                      {education.grade && (
                        <p style={{ fontSize: "12px", color: "#555", margin: "1px 0 0" }}>
                          Grade / CGPA: {education.grade}
                        </p>
                      )}
                    </div>
                    {dateRange && (
                      <p style={{ whiteSpace: "nowrap", fontSize: "12px", color: "#555" }}>
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

      {/* EXPERIENCE */}
      {data.experiences.length > 0 && (
        <Section title="Experience">
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
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
                      gap: "24px",
                    }}
                  >
                    <div>
                      <p style={{ fontWeight: 700, margin: 0, fontSize: "14px" }}>
                        {experience.company}
                      </p>
                      <p style={{ fontStyle: "italic", margin: "2px 0 0" }}>
                        {experience.role}
                        {experience.location ? `, ${experience.location}` : ""}
                      </p>
                    </div>
                    {dateRange && (
                      <p style={{ whiteSpace: "nowrap", fontSize: "12px", color: "#555" }}>
                        {dateRange}
                      </p>
                    )}
                  </div>
                  {experience.description && (
                    <p
                      style={{
                        marginTop: "6px",
                        whiteSpace: "pre-line",
                        color: "#222",
                        lineHeight: "1.7",
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

      {/* PROJECTS */}
      {data.projects.length > 0 && (
        <Section title="Projects">
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {data.projects.map((project) => (
              <div key={project.id}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "16px",
                  }}
                >
                  <p style={{ fontWeight: 700, margin: 0, fontSize: "14px" }}>
                    {project.name || "Project Name"}
                  </p>
                </div>
                {project.technologies && (
                  <p style={{ fontSize: "12px", fontStyle: "italic", margin: "2px 0 0" }}>
                    {project.technologies}
                  </p>
                )}
                {project.description && (
                  <p
                    style={{
                      marginTop: "4px",
                      whiteSpace: "pre-line",
                      color: "#222",
                      lineHeight: "1.7",
                    }}
                  >
                    {project.description}
                  </p>
                )}
                {project.link && (
                  <p
                    style={{
                      marginTop: "2px",
                      fontSize: "11px",
                      color: "#555",
                      wordBreak: "break-all",
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
        <Section title="Skills">
          <p style={{ lineHeight: "1.8" }}>{data.skills.join(", ")}</p>
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
                  gap: "24px",
                }}
              >
                <div>
                  <p style={{ fontWeight: 700, margin: 0 }}>{certification.name}</p>
                  {certification.issuer && (
                    <p style={{ margin: "1px 0 0" }}>{certification.issuer}</p>
                  )}
                  {certification.credentialUrl && (
                    <p
                      style={{
                        fontSize: "11px",
                        color: "#555",
                        wordBreak: "break-all",
                        margin: "1px 0 0",
                      }}
                    >
                      {certification.credentialUrl}
                    </p>
                  )}
                </div>
                {certification.issueDate && (
                  <p style={{ whiteSpace: "nowrap", fontSize: "12px", color: "#555" }}>
                    {formatDate(certification.issueDate)}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}
    </article>
  );
}