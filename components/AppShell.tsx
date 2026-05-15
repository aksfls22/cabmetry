"use client";

import { LogoutButton } from "@/components/auth/LogoutButton";
import { es } from "@/lib/i18n/es";
import { BottomNav } from "@/components/BottomNav";
import { CabmetryIcon } from "@/components/CabmetryIcon";
import { ThemeToggle } from "@/components/ThemeToggle";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto min-h-dvh max-w-lg">
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-surface-border bg-surface/90 px-4 py-3 backdrop-blur-lg">
        <div className="flex items-center gap-2">
          <CabmetryIcon className="h-9 w-9 shrink-0" />
          <span className="font-semibold text-white">{es.brand}</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LogoutButton />
        </div>
      </header>

      <main className="px-4 pb-28 pt-6">{children}</main>
      <BottomNav />
    </div>
  );
}
