"use client";

import { ResumeData } from "@/lib/resume-types";

interface ModernProps {
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

export default function Modern({ data }: ModernProps) {
  const personal = data.personal;

  return (
    <article
      style={{
        maxWidth: "850px",
        margin: "0 auto",
        display: "grid",
        gridTemplateColumns: "260px 1fr",
        backgroundColor: "#ffffff",
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        fontSize: "13px",
        lineHeight: "1.5",
        color: "#1a1a1a",
        minHeight: "100%",
      }}
    >
      {/* SIDEBAR */}
      <aside
        style={{
          background: "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)",
          padding: "36px 24px",
          color: "#e2e8f0",
        }}
      >
        {/* Name */}
        <h1
          style={{
            fontSize: "24px",
            fontWeight: 700,
            color: "#ffffff",
            lineHeight: "1.2",
            margin: 0,
          }}
        >
          {personal.fullName || "Your Name"}
        </h1>

        {/* Contact */}
        <div style={{ marginTop: "20px" }}>
          {personal.email && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px", fontSize: "12px" }}>
              <span style={{ color: "#60a5fa" }}>✉</span>
              <span style={{ wordBreak: "break-all" }}>{personal.email}</span>
            </div>
          )}
          {personal.phone && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px", fontSize: "12px" }}>
              <span style={{ color: "#60a5fa" }}>☎</span>
              <span>{personal.phone}</span>
            </div>
          )}
          {personal.location && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px", fontSize: "12px" }}>
              <span style={{ color: "#60a5fa" }}>⊕</span>
              <span>{personal.location}</span>
            </div>
          )}
          {personal.linkedin && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px", fontSize: "12px" }}>
              <span style={{ color: "#60a5fa" }}>in</span>
              <span style={{ wordBreak: "break-all" }}>{personal.linkedin}</span>
            </div>
          )}
          {personal.github && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px", fontSize: "12px" }}>
              <span style={{ color: "#60a5fa" }}>⌂</span>
              <span style={{ wordBreak: "break-all" }}>{personal.github}</span>
            </div>
          )}
          {personal.portfolio && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px", fontSize: "12px" }}>
              <span style={{ color: "#60a5fa" }}>◈</span>
              <span style={{ wordBreak: "break-all" }}>{personal.portfolio}</span>
            </div>
          )}
        </div>

        {/* Skills */}
        {data.skills.length > 0 && (
          <div style={{ marginTop: "28px" }}>
            <h2
              style={{
                fontSize: "11px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                color: "#60a5fa",
                margin: 0,
              }}
            >
              Skills
            </h2>
            <div
              style={{
                marginTop: "10px",
                display: "flex",
                flexWrap: "wrap",
                gap: "6px",
              }}
            >
              {data.skills.map((skill) => (
                <span
                  key={skill}
                  style={{
                    padding: "3px 10px",
                    backgroundColor: "rgba(96, 165, 250, 0.15)",
                    borderRadius: "4px",
                    fontSize: "11px",
                    color: "#93c5fd",
                    border: "1px solid rgba(96, 165, 250, 0.25)",
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {data.education.length > 0 && (
          <div style={{ marginTop: "28px" }}>
            <h2
              style={{
                fontSize: "11px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                color: "#60a5fa",
                margin: 0,
              }}
            >
              Education
            </h2>
            <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "14px" }}>
              {data.education.map((education) => {
                const degree = [education.degree, education.fieldOfStudy]
                  .filter(Boolean)
                  .join(" in ");
                return (
                  <div key={education.id}>
                    <p style={{ fontWeight: 600, color: "#ffffff", fontSize: "13px", margin: 0 }}>
                      {education.institution}
                    </p>
                    {degree && (
                      <p style={{ marginTop: "2px", fontSize: "12px", color: "#94a3b8" }}>
                        {degree}
                      </p>
                    )}
                    {education.location && (
                      <p style={{ fontSize: "11px", color: "#64748b", marginTop: "1px" }}>
                        {education.location}
                      </p>
                    )}
                    {education.grade && (
                      <p style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>
                        CGPA: {education.grade}
                      </p>
                    )}
                    {(education.startDate || education.endDate) && (
                      <p style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
                        {formatDate(education.startDate)} – {formatDate(education.endDate)}
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
          <div style={{ marginTop: "28px" }}>
            <h2
              style={{
                fontSize: "11px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                color: "#60a5fa",
                margin: 0,
              }}
            >
              Certifications
            </h2>
            <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "12px" }}>
              {data.certifications.map((certification) => (
                <div key={certification.id}>
                  <p style={{ fontWeight: 600, color: "#ffffff", fontSize: "12px", margin: 0 }}>
                    {certification.name}
                  </p>
                  {certification.issuer && (
                    <p style={{ fontSize: "11px", color: "#94a3b8", marginTop: "1px" }}>
                      {certification.issuer}
                    </p>
                  )}
                  {certification.issueDate && (
                    <p style={{ fontSize: "11px", color: "#64748b", marginTop: "1px" }}>
                      {formatDate(certification.issueDate)}
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
                fontSize: "11px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                color: "#1e293b",
                borderBottom: "2px solid #1e293b",
                paddingBottom: "4px",
                margin: "0 0 10px",
              }}
            >
              Profile
            </h2>
            <p style={{ whiteSpace: "pre-line", color: "#475569", lineHeight: "1.7", fontSize: "13px" }}>
              {data.summary}
            </p>
          </section>
        )}

        {/* Experience */}
        {data.experiences.length > 0 && (
          <section style={{ marginTop: "24px" }}>
            <h2
              style={{
                fontSize: "11px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                color: "#1e293b",
                borderBottom: "2px solid #1e293b",
                paddingBottom: "4px",
                margin: "0 0 10px",
              }}
            >
              Experience
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
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
                      borderLeft: "3px solid #3b82f6",
                      paddingLeft: "14px",
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
                          <p style={{ fontWeight: 500, color: "#3b82f6", margin: "2px 0 0", fontSize: "13px" }}>
                            {experience.company}
                            {experience.location ? ` · ${experience.location}` : ""}
                          </p>
                        )}
                      </div>
                      {dateRange && (
                        <p style={{ whiteSpace: "nowrap", fontSize: "11px", color: "#94a3b8" }}>
                          {dateRange}
                        </p>
                      )}
                    </div>
                    {experience.description && (
                      <p
                        style={{
                          marginTop: "6px",
                          whiteSpace: "pre-line",
                          color: "#475569",
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
                fontSize: "11px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                color: "#1e293b",
                borderBottom: "2px solid #1e293b",
                paddingBottom: "4px",
                margin: "0 0 10px",
              }}
            >
              Projects
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {data.projects.map((project) => (
                <div key={project.id}>
                  <h3 style={{ fontWeight: 700, fontSize: "14px", margin: 0 }}>
                    {project.name || "Project Name"}
                  </h3>
                  {project.technologies && (
                    <p style={{ fontSize: "12px", fontWeight: 500, color: "#3b82f6", margin: "2px 0 0" }}>
                      {project.technologies}
                    </p>
                  )}
                  {project.description && (
                    <p
                      style={{
                        marginTop: "4px",
                        whiteSpace: "pre-line",
                        color: "#475569",
                        lineHeight: "1.7",
                      }}
                    >
                      {project.description}
                    </p>
                  )}
                  {project.link && (
                    <p style={{ fontSize: "11px", color: "#94a3b8", wordBreak: "break-all", marginTop: "2px" }}>
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