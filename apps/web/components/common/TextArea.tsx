"use client";

import { TextareaHTMLAttributes } from "react";

interface TextAreaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export default function TextArea({
  label,
  error,
  className = "",
  ...props
}: TextAreaProps) {
  return (
    <div className="flex w-full flex-col gap-2">
      {label && (
        <label className="text-sm font-medium text-[var(--text-muted)]">
          {label}
        </label>
      )}

      <textarea
        className={`
          min-h-[120px]
          w-full
          rounded-xl
          border
          border-[var(--border)]
          bg-[var(--bg-surface)]
          px-4
          py-3
          text-sm
          text-[var(--text-primary)]
          outline-none
          transition-all
          duration-200
          resize-y
          placeholder:text-[var(--text-muted)]
          focus:border-blue-500
          focus:ring-2
          focus:ring-blue-500/20
          ${className}
        `}
        {...props}
      />

      {error && (
        <p className="text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}