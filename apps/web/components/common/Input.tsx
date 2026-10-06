"use client";

import { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({
  label,
  error,
  className = "",
  ...props
}: InputProps) {
  return (
    <div className="flex flex-col gap-2 w-full">
      {label && (
        <label className="text-sm font-medium text-[var(--text-muted)]">
          {label}
        </label>
      )}

      <input
        className={`
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