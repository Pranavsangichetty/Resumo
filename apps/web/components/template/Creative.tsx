"use client";

import { ResumeData } from "@/lib/resume-types";

interface CreativeProps {
  data: ResumeData;
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

export default function Creative({ data }: CreativeProps) {
  const personal = data.personal;

  return (
    <article
      style={{
        maxWidth: "850px",
        margin: "0 auto",
        display: "grid",
        gridTemplateColumns: "240px 1fr",
        backgroundColor: "#ffffff",
        fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
        fontSize: "13px",
        lineHeight: "1.5",
        color: "#1a1a1a",
        minHeight: "100%",
      }}
    >
      {/* SIDEBAR */}
      <aside
        style={{
          background: "linear-gradient(180deg, #7c3aed 0%, #4f46e5 50%, #2563eb 100%)",
          padding: "36px 22px",
          color: "#ffffff",
        }}
      >
        {/* Initials Circle */}
        <div
          style={{
            width: "72px",
            height: "72px",
            borderRadius: "50%",
            backgroundColor: "rgba(255,255,255,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "26px",
            fontWeight: 700,
            letterSpacing: "0.05em",
            margin: "0 auto",
            border: "2px solid rgba(255,255,255,0.3)",
          }}
        >
          {(personal.fullName || "YN")
            .split(" ")
            .map((n) => n[0])
            .join("")
            .substring(0, 2)
            .toUpperCase()}
        </div>

        {/* Name */}
        <h1
          style={{
            fontSize: "20px",
            fontWeight: 700,
            textAlign: "center",
            marginTop: "14px",
            lineHeight: "1.2",
          }}
        >
          {personal.fullName || "Your Name"}
        </h1>

        {/* Contact */}
        <div style={{ marginTop: "24px" }}>
          <h2
            style={{
              fontSize: "10px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              color: "rgba(255,255,255,0.6)",
              margin: "0 0 8px",
            }}
          >
            Contact
          </h2>
          {personal.email && (
            <p style={{ fontSize: "11px", margin: "6px 0", wordBreak: "break-all", color: "rgba(255,255,255,0.9)" }}>
              {personal.email}
            </p>
          )}
          {personal.phone && (
            <p style={{ fontSize: "11px", margin: "6px 0", color: "rgba(255,255,255,0.9)" }}>
              {personal.phone}
            </p>
          )}
          {personal.location && (
            <p style={{ fontSize: "11px", margin: "6px 0", color: "rgba(255,255,255,0.9)" }}>
              {personal.location}
            </p>
          )}
          {personal.linkedin && (
            <p style={{ fontSize: "11px", margin: "6px 0", wordBreak: "break-all", color: "rgba(255,255,255,0.9)" }}>
              {personal.linkedin}
            </p>
          )}
          {personal.github && (
            <p style={{ fontSize: "11px", margin: "6px 0", wordBreak: "break-all", color: "rgba(255,255,255,0.9)" }}>
              {personal.github}
            </p>
          )}
          {personal.portfolio && (
            <p style={{ fontSize: "11px", margin: "6px 0", wordBreak: "break-all", color: "rgba(255,255,255,0.9)" }}>
              {personal.portfolio}
            </p>
          )}
        </div>

        {/* Skills */}
        {data.skills.length > 0 && (
          <div style={{ marginTop: "24px" }}>
            <h2
              style={{
                fontSize: "10px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.2em",
                color: "rgba(255,255,255,0.6)",
                margin: "0 0 10px",
              }}
            >
              Skills
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {data.skills.map((skill) => (
                <div
                  key={skill}
                  style={{
                    padding: "4px 10px",
                    backgroundColor: "rgba(255,255,255,0.15)",
                    borderRadius: "6px",
                    fontSize: "11px",
                    color: "#ffffff",
                  }}
                >
                  {skill}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {data.education.length > 0 && (
          <div style={{ marginTop: "24px" }}>
            <h2
              style={{
                fontSize: "10px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.2em",
                color: "rgba(255,255,255,0.6)",
                margin: "0 0 10px",
              }}
            >
              Education
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {data.education.map((education) => {
                const degree = [education.degree, education.fieldOfStudy]
                  .filter(Boolean)
                  .join(" in ");
                return (
                  <div key={education.id}>
                    <p style={{ fontWeight: 600, fontSize: "12px", margin: 0 }}>
                      {education.institution}
                    </p>
                    {degree && (
                      <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)", margin: "2px 0 0" }}>
                        {degree}
                      </p>
                    )}
                    {(education.startDate || education.endDate) && (
                      <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)", margin: "2px 0 0" }}>
                        {formatDate(education.startDate)} – {formatDate(education.endDate)}
                      </p>
                    )}
                    {education.grade && (
                      <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.6)", margin: "2px 0 0" }}>
                        CGPA: {education.grade}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Certifications */}
        {data.certifications.length > 0 && (
          <div style={{ marginTop: "24px" }}>
            <h2
              style={{
                fontSize: "10px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.2em",
                color: "rgba(255,255,255,0.6)",
                margin: "0 0 10px",
              }}
            >
              Certifications
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {data.certifications.map((cert) => (
                <div key={cert.id}>
                  <p style={{ fontWeight: 600, fontSize: "12px", margin: 0 }}>
                    {cert.name}
                  </p>
                  {cert.issuer && (
                    <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.6)", margin: "1px 0 0" }}>
                      {cert.issuer}
                    </p>
                  )}
                  {cert.issueDate && (
                    <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)", margin: "1px 0 0" }}>
                      {formatDate(cert.issueDate)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </aside>

      {/* MAIN CONTENT */}
      <main style={{ padding: "36px 32px" }}>

        {/* Summary */}
        {data.summary && (
          <section>
            <h2
              style={{
                fontSize: "12px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                color: "#7c3aed",
                margin: "0 0 8px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span
                style={{
                  width: "20px",
                  height: "3px",
                  backgroundColor: "#7c3aed",
                  borderRadius: "2px",
                  display: "inline-block",
                }}
              />
              About Me
            </h2>
            <p style={{ whiteSpace: "pre-line", color: "#4b5563", lineHeight: "1.75" }}>
              {data.summary}
            </p>
          </section>
        )}

        {/* Experience */}
        {data.experiences.length > 0 && (
          <section style={{ marginTop: "24px" }}>
            <h2
              style={{
                fontSize: "12px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                color: "#7c3aed",
                margin: "0 0 12px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span
                style={{
                  width: "20px",
                  height: "3px",
                  backgroundColor: "#7c3aed",
                  borderRadius: "2px",
                  display: "inline-block",
                }}
              />
              Experience
            </h2>
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
                  <div
                    key={experience.id}
                    style={{
                      paddingLeft: "14px",
                      borderLeft: "3px solid #e9d5ff",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: "12px",
                      }}
                    >
                      <div>
                        <h3 style={{ fontWeight: 700, fontSize: "14px", margin: 0 }}>
                          {experience.role || "Role"}
                        </h3>
                        {experience.company && (
                          <p style={{ fontWeight: 500, color: "#7c3aed", margin: "2px 0 0", fontSize: "13px" }}>
                            {experience.company}
                            {experience.location ? ` · ${experience.location}` : ""}
                          </p>
                        )}
                      </div>
                      {dateRange && (
                        <p style={{ whiteSpace: "nowrap", fontSize: "11px", color: "#9ca3af" }}>
                          {dateRange}
                        </p>
                      )}
                    </div>
                    {experience.description && (
                      <p
                        style={{
                          marginTop: "6px",
                          whiteSpace: "pre-line",
                          color: "#4b5563",
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
          </section>
        )}

        {/* Projects */}
        {data.projects.length > 0 && (
          <section style={{ marginTop: "24px" }}>
            <h2
              style={{
                fontSize: "12px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                color: "#7c3aed",
                margin: "0 0 12px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span
                style={{
                  width: "20px",
                  height: "3px",
                  backgroundColor: "#7c3aed",
                  borderRadius: "2px",
                  display: "inline-block",
                }}
              />
              Projects
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {data.projects.map((project) => (
                <div
                  key={project.id}
                  style={{
                    padding: "12px 14px",
                    backgroundColor: "#faf5ff",
                    borderRadius: "8px",
                    border: "1px solid #ede9fe",
                  }}
                >
                  <h3 style={{ fontWeight: 700, fontSize: "14px", margin: 0 }}>
                    {project.name || "Project Name"}
                  </h3>
                  {project.technologies && (
                    <p style={{ fontSize: "12px", fontWeight: 500, color: "#7c3aed", margin: "2px 0 0" }}>
                      {project.technologies}
                    </p>
                  )}
                  {project.description && (
                    <p
                      style={{
                        marginTop: "6px",
                        whiteSpace: "pre-line",
                        color: "#4b5563",
                        lineHeight: "1.7",
                      }}
                    >
                      {project.description}
                    </p>
                  )}
                  {project.link && (
                    <p style={{ fontSize: "11px", color: "#7c3aed", wordBreak: "break-all", marginTop: "4px" }}>
                      {project.link}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </article>
  );
}
