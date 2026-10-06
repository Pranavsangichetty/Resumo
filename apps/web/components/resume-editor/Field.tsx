import React from "react";

interface FieldProps {
  children: React.ReactNode;
  className?: string;
}

export default function Field({
  children,
  className = "",
}: FieldProps) {
  return (
    <div className={`mb-5 ${className}`}>
      {children}
    </div>
  );
}