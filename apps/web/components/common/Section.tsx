"use client";

import { ReactNode } from "react";

interface SectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export default function Section({
  title,
  description,
  children,
  className = "",
}: SectionProps) {
  return (
    <section
      className={`
        mb-8
        rounded-2xl
        border
        border-[var(--border)]
        bg-[var(--bg-surface)]
        p-6
        shadow-sm
        ${className}
      `}
    >
      <div className="mb-5">
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">
          {title}
        </h2>

        {description && (
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            {description}
          </p>
        )}
      </div>

      {children}
    </section>
  );
}