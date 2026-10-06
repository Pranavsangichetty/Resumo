import React from "react";

interface PreviewSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export default function PreviewSection({
  title,
  children,
  className = "",
}: PreviewSectionProps) {
  return (
    <section className={`mt-5 ${className}`}>
      <h2 className="border-b border-black pb-1 text-xs font-bold uppercase tracking-wider">
        {title}
      </h2>

      <div className="mt-2">
        {children}
      </div>
    </section>
  );
}