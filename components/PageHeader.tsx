"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { LogoutButton } from "@/components/auth/LogoutButton";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  subtitleSlot?: ReactNode;
}

export function PageHeader({
  title,
  subtitle,
  subtitleSlot,
}: PageHeaderProps) {
  const [open, setOpen] = useState(false);

  return (
    <header className="mb-6 flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          {title}
        </h1>

        {subtitleSlot}

        {subtitle && !subtitleSlot && (
          <p className="mt-1 text-sm text-zinc-400">
            {subtitle}
          </p>
        )}
      </div>

      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900 text-sm font-semibold text-white transition-colors hover:border-zinc-700 hover:bg-zinc-800"
          aria-label="Abrir menú"
          >
          <div className="h-3 w-3 rounded-full bg-white" />
        </button>

        {open && (
          <div className="absolute right-0 mt-3 w-52 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl">
            <div className="border-b border-zinc-800 px-4 py-3">
              <p className="text-sm font-semibold text-white">
                Cabmetry
              </p>

              <p className="text-xs text-zinc-400">
                Panel de usuario
              </p>
            </div>

            <div className="p-2">
              <Link
                href="/settings"
                className="flex items-center rounded-xl px-3 py-2 text-sm text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
                onClick={() => setOpen(false)}
              >
                Configuración
              </Link>

              <Link
                href="/reports"
                className="flex items-center rounded-xl px-3 py-2 text-sm text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
                onClick={() => setOpen(false)}
              >
                Reportes
              </Link>

              <LogoutButton
  className="flex w-full items-center rounded-xl px-3 py-2 text-sm text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
/>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
