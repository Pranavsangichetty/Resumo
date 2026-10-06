"use client";

import { ResumeData } from "@/lib/resume-types";

interface CloudProps {
  data: ResumeData;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginTop: "16px" }}>
      <h2
        style={{
          fontSize: "13px",
          fontWeight: 700,
          textTransform: "uppercase",
          color: "#0066cc",
          borderBottom: "2px solid #0066cc",
          paddingBottom: "3px",
          marginBottom: "8px",
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
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString("en-US", { month: "2-digit", year: "numeric" });
}

function BulletList({ text }: { text: string }) {
  if (!text) return null;
  const lines = text.split("\n").filter((l) => l.trim());

  return (
    <ul style={{ margin: "4px 0 0", paddingLeft: "16px", listStyleType: "disc" }}>
      {lines.map((line, i) => (
        <li
          key={i}
          style={{ color: "#1a1a1a", fontSize: "11.5px", lineHeight: "1.5", marginBottom: "2px" }}
        >
          {line.replace(/^[•\-\*]\s*/, "").trim()}
        </li>
      ))}
    </ul>
  );
}

export default function Cloud({ data }: CloudProps) {
  const p = data.personal;
  const name = p.fullName || "Your Name";

  const contacts = [
    p.email,
    p.phone,
    p.location,
  ].filter(Boolean);

  const links = [
    p.linkedin && { label: "LinkedIn", href: p.linkedin },
    p.github && { label: "GitHub", href: p.github },
    p.portfolio && { label: "Portfolio", href: p.portfolio },
  ].filter(Boolean) as { label: string; href: string }[];

  return (
    <article
      style={{
        maxWidth: "850px",
        margin: "0 auto",
        backgroundColor: "#fff",
        fontFamily: "'Calibri', 'Segoe UI', Arial, sans-serif",
        fontSize: "12px",
        lineHeight: "1.45",
        color: "#1a1a1a",
        padding: "28px 36px",
        boxSizing: "border-box",
        border: "3px solid #0066cc",
      }}
    >
      {/* Header */}
      <header style={{ textAlign: "center", marginBottom: "4px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#0066cc", margin: 0 }}>
          {name}
        </h1>
        {contacts.length > 0 && (
          <p style={{ fontSize: "11px", color: "#333", margin: "4px 0 0" }}>
            {contacts.join(" · ")}
            {links.length > 0 && " · "}
            {links.map((l, i) => (
              <span key={i}>
                {i > 0 && " · "}
                <a href={l.href.startsWith("http") ? l.href : `https://${l.href}`} target="_blank" rel="noreferrer" style={{ color: "#0066cc", textDecoration: "none" }}>
                  {l.label}
                </a>
              </span>
            ))}
          </p>
        )}
      </header>

      {/* Summary */}
      {data.summary && (
        <Section title="Professional Summary">
          <p style={{ fontSize: "11.5px", color: "#1a1a1a", lineHeight: "1.55", margin: 0, textAlign: "justify" }}>
            {data.summary}
          </p>
        </Section>
      )}

      {/* Education */}
      {data.education.length > 0 && (
        <Section title="Education">
          {data.education.map((edu) => {
            const dates = [formatDate(edu.startDate), formatDate(edu.endDate)].filter(Boolean).join("–");
            const degree = [edu.degree, edu.fieldOfStudy].filter(Boolean).join(" in ");
            return (
              <div key={edu.id} style={{ marginBottom: "6px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div>
                    <span style={{ fontWeight: 700, fontSize: "12px" }}>{edu.institution}</span>
                    {edu.location && <span style={{ fontSize: "11px", color: "#555" }}> · {edu.location}</span>}
                  </div>
                  {dates && <span style={{ fontSize: "11px", color: "#555", whiteSpace: "nowrap" }}>{dates}</span>}
                </div>
                {degree && <p style={{ margin: "1px 0 0", fontSize: "11.5px" }}>{degree}{edu.grade ? `, ${edu.grade}` : ""}</p>}
              </div>
            );
          })}
        </Section>
      )}

      {/* Experience */}
      {data.experiences.length > 0 && (
        <Section title="Work Experience">
          {data.experiences.map((exp) => {
            const start = formatDate(exp.startDate);
            const end = exp.current ? "Present" : formatDate(exp.endDate);
            const dates = [start, end].filter(Boolean).join(" – ");
            return (
              <div key={exp.id} style={{ marginBottom: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div>
                    <span style={{ fontWeight: 700, fontSize: "12px" }}>{exp.role}</span>
                    <span style={{ fontSize: "11px", color: "#0066cc" }}> – {exp.company}</span>
                    {exp.location && <span style={{ fontSize: "11px", color: "#555" }}> · {exp.location}</span>}
                  </div>
                  {dates && <span style={{ fontSize: "11px", color: "#555", whiteSpace: "nowrap" }}>{dates}</span>}
                </div>
                {exp.description && <BulletList text={exp.description} />}
              </div>
            );
          })}
        </Section>
      )}

      {/* Skills */}
      {data.skills.length > 0 && (
        <Section title="Skills">
          <p style={{ fontSize: "11.5px", margin: 0, lineHeight: "1.6" }}>
            {data.skills.join(", ")}
          </p>
        </Section>
      )}

      {/* Projects */}
      {data.projects.length > 0 && (
        <Section title="Projects">
          {data.projects.map((proj) => (
            <div key={proj.id} style={{ marginBottom: "8px" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                <span style={{ fontWeight: 700, fontSize: "12px" }}>{proj.name}</span>
                {proj.technologies && (
                  <span style={{ fontSize: "10.5px", color: "#0066cc" }}>{proj.technologies}</span>
                )}
              </div>
              {proj.link && (
                <a href={proj.link} target="_blank" rel="noreferrer" style={{ fontSize: "10.5px", color: "#0066cc", textDecoration: "none" }}>
                  {proj.link}
                </a>
              )}
              {proj.description && <BulletList text={proj.description} />}
            </div>
          ))}
        </Section>
      )}

      {/* Certifications */}
      {data.certifications.length > 0 && (
        <Section title="Certifications">
          <ul style={{ margin: 0, paddingLeft: "16px", listStyleType: "disc" }}>
            {data.certifications.map((cert) => (
              <li key={cert.id} style={{ fontSize: "11.5px", marginBottom: "3px" }}>
                <span style={{ fontWeight: 600 }}>{cert.name}</span>
                {cert.issuer && <span> - {cert.issuer}</span>}
                {cert.credentialUrl && (
                  <>
                    {" "}
                    <a href={cert.credentialUrl} target="_blank" rel="noreferrer" style={{ fontSize: "10.5px", color: "#0066cc", textDecoration: "none" }}>
                      View Credential
                    </a>
                  </>
                )}
              </li>
            ))}
          </ul>
        </Section>
      )}
    </article>
  );
}
