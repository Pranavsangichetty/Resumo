"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "danger"
  | "success"
  | "outline";

type ButtonSize =
  | "sm"
  | "md"
  | "lg";

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  loading = false,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={clsx(
        "rounded-xl font-medium transition-all duration-200",
        "disabled:opacity-50 disabled:cursor-not-allowed",

        fullWidth && "w-full",

        size === "sm" && "px-3 py-2 text-sm",
        size === "md" && "px-5 py-3",
        size === "lg" && "px-6 py-4 text-lg",

        variant === "primary" &&
          "bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-900/30",

        variant === "secondary" &&
          "bg-[var(--bg-muted)] text-[var(--text-primary)] hover:bg-[var(--border)]",

        variant === "danger" &&
          "bg-red-600 text-white hover:bg-red-700",

        variant === "success" &&
          "bg-emerald-600 text-white hover:bg-emerald-700",

        variant === "outline" &&
          "border border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--bg-muted)]",

        className
      )}
      {...props}
    >
      {loading ? "Loading..." : children}
    </button>
  );
}