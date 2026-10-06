"use client";

import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  title?: string;
  description?: string;
  className?: string;
}

export default function Card({
  children,
  title,
  description,
  className = "",
}: CardProps) {
  return (
    <div
      className={`
        rounded-2xl
        border
        border-[var(--border)]
        bg-[var(--bg-surface)]
        shadow-sm
        shadow-navy-950/40
        p-6
        ${className}
      `}
    >
      {(title || description) && (
        <div className="mb-5">
          {title && (
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">
              {title}
            </h2>
          )}

          {description && (
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              {description}
            </p>
          )}
        </div>
      )}

      {children}
    </div>
  );
}