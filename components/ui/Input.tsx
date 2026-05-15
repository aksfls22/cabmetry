"use client";

import { cn } from "@/lib/utils";
import { forwardRef, type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input({ label, className, id, ...props }, ref) {
    const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="space-y-2">
        <label htmlFor={inputId} className="block text-sm font-medium text-zinc-300">
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full rounded-2xl border border-surface-border bg-surface-raised px-4 py-4 text-lg text-white placeholder:text-zinc-600 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30",
            className
          )}
          {...props}
        />
      </div>
    );
  }
);
