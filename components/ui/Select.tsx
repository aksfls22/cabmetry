"use client";

import { cn } from "@/lib/utils";
import type { SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: { value: string; label: string }[];
}

export function Select({ label, options, className, id, ...props }: SelectProps) {
  const selectId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="space-y-2">
      <label htmlFor={selectId} className="block text-sm font-medium text-zinc-300">
        {label}
      </label>
      <select
        id={selectId}
        className={cn(
          "touch-target w-full appearance-none rounded-2xl border border-surface-border bg-surface-raised px-4 py-4 text-lg text-white focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30",
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-surface-raised">
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
