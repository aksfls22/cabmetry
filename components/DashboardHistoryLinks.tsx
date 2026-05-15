"use client";

import Link from "next/link";
import { es } from "@/lib/i18n/es";

export function DashboardHistoryLinks() {
  return (
    <div className="mt-2 flex gap-3 border-t border-surface-border pt-6">
      <Link
        href="/rides/history"
        className="touch-target flex-1 rounded-2xl border border-surface-border bg-surface-raised py-3 text-center text-sm font-medium text-zinc-300 transition-colors hover:border-accent/30 hover:text-accent"
      >
        {es.dashboard.historyRides}
      </Link>
      <Link
        href="/expenses/history"
        className="touch-target flex-1 rounded-2xl border border-surface-border bg-surface-raised py-3 text-center text-sm font-medium text-zinc-300 transition-colors hover:border-accent/30 hover:text-accent"
      >
        {es.dashboard.historyExpenses}
      </Link>
    </div>
  );
}
