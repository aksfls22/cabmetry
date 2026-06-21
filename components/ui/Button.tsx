"use client";

import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  fullWidth?: boolean;
}

const variants = {
  primary:
    "bg-accent text-surface font-semibold hover:bg-accent-muted active:scale-[0.98]",
  secondary:
    "bg-surface-raised border border-surface-border text-white hover:bg-surface-border/50",
  ghost: "text-zinc-400 hover:text-white hover:bg-white/5",
  danger: "bg-expense/20 text-expense border border-expense/30 hover:bg-expense/30",
};

export function Button({
  className,
  variant = "primary",
  fullWidth = true,
  children,
  disabled,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={cn(
        "touch-target inline-flex items-center justify-center rounded-2xl px-6 py-4 text-base font-medium transition-all disabled:opacity-50 disabled:pointer-events-none",
        fullWidth && "w-full",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
