"use client";

import { ResumeData } from "@/lib/resume-types";

interface GoogleProps {
  data: ResumeData;
}

function Section({
  title,
  color,
  children,
}: {
  title: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <section style={{ marginTop: "20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
        <div
          style={{
            width: "4px",
            height: "18px",
            backgroundColor: color,
            borderRadius: "2px",
            flexShrink: 0,
          }}
        />
        <h2
          style={{
            fontSize: "14px",
            fontWeight: 600,
            color: "#202124",
            margin: 0,
            fontFamily: "'Google Sans', 'Segoe UI', Roboto, sans-serif",
          }}
        >
          {title}
        </h2>
      </div>
      <div style={{ paddingLeft: "14px" }}>{children}</div>
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

export default function Google({ data }: GoogleProps) {
  const personal = data.personal;

  const contactItems = [
    personal.email,
    personal.phone,
    personal.location,
    personal.linkedin,
    personal.github,
    personal.portfolio,
  ].filter(Boolean);

  // Google-style color palette
  const colors = ["#4285f4", "#ea4335", "#fbbc04", "#34a853", "#4285f4", "#ea4335"];

  return (
    <article
      style={{
        maxWidth: "850px",
        margin: "0 auto",
        backgroundColor: "#ffffff",
        fontFamily: "'Google Sans', 'Segoe UI', Roboto, sans-serif",
        fontSize: "13px",
        lineHeight: "1.5",
        color: "#202124",
      }}
    >
      {/* HEADER */}
      <header style={{ padding: "36px 40px 24px", borderBottom: "1px solid #e8eaed" }}>
        <h1
          style={{
            fontSize: "32px",
            fontWeight: 400,
            letterSpacing: "-0.01em",
            color: "#202124",
            margin: 0,
          }}
        >
          {personal.fullName || "Your Name"}
        </h1>

        {contactItems.length > 0 && (
          <div
            style={{
              marginTop: "10px",
              display: "flex",
              flexWrap: "wrap",
              gap: "6px 16px",
              fontSize: "12px",
              color: "#5f6368",
            }}
          >
            {contactItems.map((item, i) => (
              <span key={i} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <span
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    backgroundColor: colors[i % colors.length],
                    flexShrink: 0,
                  }}
                />
                {item}
              </span>
            ))}
          </div>
        )}

        {/* Color bar */}
        <div
          style={{
            marginTop: "16px",
            display: "flex",
            height: "4px",
            borderRadius: "2px",
            overflow: "hidden",
          }}
        >
          <div style={{ flex: 1, backgroundColor: "#4285f4" }} />
          <div style={{ flex: 1, backgroundColor: "#ea4335" }} />
          <div style={{ flex: 1, backgroundColor: "#fbbc04" }} />
          <div style={{ flex: 1, backgroundColor: "#34a853" }} />
        </div>
      </header>

      {/* BODY */}
      <div style={{ padding: "24px 40px 36px" }}>

        {/* SUMMARY */}
        {data.summary && (
          <Section title="Summary" color="#4285f4">
            <p style={{ whiteSpace: "pre-line", color: "#3c4043", lineHeight: "1.7" }}>
              {data.summary}
            </p>
          </Section>
        )}

        {/* EXPERIENCE */}
        {data.experiences.length > 0 && (
          <Section title="Experience" color="#ea4335">
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
                        gap: "16px",
                      }}
                    >
                      <div>
                        <h3 style={{ fontWeight: 600, fontSize: "14px", margin: 0 }}>
                          {experience.role || "Role"}
                        </h3>
                        {experience.company && (
                          <p style={{ color: "#5f6368", margin: "2px 0 0" }}>
                            {experience.company}
                            {experience.location ? ` · ${experience.location}` : ""}
                          </p>
                        )}
                      </div>
                      {dateRange && (
                        <p style={{ whiteSpace: "nowrap", fontSize: "12px", color: "#80868b" }}>
                          {dateRange}
                        </p>
                      )}
                    </div>
                    {experience.description && (
                      <p
                        style={{
                          marginTop: "6px",
                          whiteSpace: "pre-line",
                          color: "#3c4043",
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
          <Section title="Projects" color="#fbbc04">
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
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
                    <h3 style={{ fontWeight: 600, fontSize: "14px", margin: 0 }}>
                      {project.name || "Project Name"}
                    </h3>
                    {project.technologies && (
                      <p style={{ fontSize: "12px", color: "#80868b", whiteSpace: "nowrap" }}>
                        {project.technologies}
                      </p>
                    )}
                  </div>
                  {project.description && (
                    <p
                      style={{
                        marginTop: "4px",
                        whiteSpace: "pre-line",
                        color: "#3c4043",
                        lineHeight: "1.7",
                      }}
                    >
                      {project.description}
                    </p>
                  )}
                  {project.link && (
                    <p style={{ fontSize: "11px", color: "#4285f4", wordBreak: "break-all", marginTop: "2px" }}>
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
          <Section title="Education" color="#34a853">
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
                      gap: "16px",
                    }}
                  >
                    <div>
                      <h3 style={{ fontWeight: 600, fontSize: "14px", margin: 0 }}>
                        {education.institution || "Institution"}
                      </h3>
                      {degree && (
                        <p style={{ color: "#5f6368", margin: "2px 0 0" }}>{degree}</p>
                      )}
                      {education.location && (
                        <p style={{ fontSize: "12px", color: "#80868b", margin: "1px 0 0" }}>
                          {education.location}
                        </p>
                      )}
                      {education.grade && (
                        <p style={{ fontSize: "12px", color: "#5f6368", margin: "1px 0 0" }}>
                          Grade / CGPA: {education.grade}
                        </p>
                      )}
                    </div>
                    {dateRange && (
                      <p style={{ fontSize: "12px", color: "#80868b", whiteSpace: "nowrap" }}>
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
          <Section title="Skills" color="#4285f4">
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {data.skills.map((skill, i) => (
                <span
                  key={skill}
                  style={{
                    padding: "4px 14px",
                    borderRadius: "16px",
                    fontSize: "12px",
                    fontWeight: 500,
                    backgroundColor: `${colors[i % colors.length]}12`,
                    color: colors[i % colors.length],
                    border: `1px solid ${colors[i % colors.length]}30`,
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
          <Section title="Certifications" color="#ea4335">
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
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
                    <span style={{ fontWeight: 600 }}>{certification.name}</span>
                    {certification.issuer && (
                      <span style={{ color: "#5f6368" }}>
                        {" "}— {certification.issuer}
                      </span>
                    )}
                    {certification.credentialUrl && (
                      <p
                        style={{
                          fontSize: "11px",
                          color: "#4285f4",
                          wordBreak: "break-all",
                          margin: "2px 0 0",
                        }}
                      >
                        {certification.credentialUrl}
                      </p>
                    )}
                  </div>
                  {certification.issueDate && (
                    <p style={{ fontSize: "12px", color: "#80868b", whiteSpace: "nowrap" }}>
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