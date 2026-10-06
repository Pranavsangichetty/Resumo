import React from "react";

interface EditorSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export default function EditorSection({
  title,
  description,
  children,
  className = "",
}: EditorSectionProps) {
  return (
    <section className={`space-y-6 ${className}`}>
      {(title || description) && (
        <div className="space-y-1">
          {title && (
            <h2 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
              {title}
            </h2>
          )}
          {description && (
            <p className="text-sm text-[var(--text-muted)]">
              {description}
            </p>
          )}
        </div>
      )}
      <div className="space-y-4">
        {children}
      </div>
    </section>
  );
}
