"use client";

import { cn } from "@/lib/utils";
import type { TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
}

export function Textarea({ label, className, id, ...props }: TextareaProps) {
  const textareaId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="space-y-2">
      <label htmlFor={textareaId} className="block text-sm font-medium text-zinc-300">
        {label}
        <span className="ml-1 font-normal text-zinc-500">(opcional)</span>
      </label>
      <textarea
        id={textareaId}
        rows={3}
        className={cn(
          "w-full resize-none rounded-2xl border border-surface-border bg-surface-raised px-4 py-3 text-base text-white placeholder:text-zinc-600 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30",
          className
        )}
        {...props}
      />
    </div>
  );
}
