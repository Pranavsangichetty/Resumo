import React from "react";
import { ResumeData } from "@/lib/resume-types";

interface ResumeHeaderProps {
  personal: ResumeData["personal"];
}

export default function ResumeHeader({
  personal,
}: ResumeHeaderProps) {
  const contact = [
    personal.email,
    personal.phone,
    personal.location,
  ]
    .filter(Boolean)
    .join(" • ");

  const links = [
    personal.linkedin,
    personal.github,
    personal.portfolio,
  ]
    .filter(Boolean)
    .join(" • ");

  return (
    <header className="border-b border-black pb-4 text-center">
      <h1 className="text-2xl font-bold">
        {personal.fullName || "Your Name"}
      </h1>

      {contact && (
        <p className="mt-2 text-xs">
          {contact}
        </p>
      )}

      {links && (
        <p className="mt-1 break-all text-xs">
          {links}
        </p>
      )}
    </header>
  );
}