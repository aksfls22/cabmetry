import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  subtitleSlot?: ReactNode;
}

export function PageHeader({ title, subtitle, subtitleSlot }: PageHeaderProps) {
  return (
    <header className="mb-6">
      <h1 className="text-2xl font-bold tracking-tight text-white">{title}</h1>
      {subtitleSlot}
      {subtitle && !subtitleSlot && (
        <p className="mt-1 text-sm text-zinc-400">{subtitle}</p>
      )}
    </header>
  );
}
