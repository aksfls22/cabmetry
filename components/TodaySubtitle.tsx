"use client";

import { ClientOnly } from "@/components/ClientOnly";
import { formatTodayLabel } from "@/lib/utils";

export function TodaySubtitle() {
  return (
    <ClientOnly
      fallback={
        <p className="mt-1 text-sm text-zinc-400" aria-hidden>
          &nbsp;
        </p>
      }
    >
      <p className="mt-1 text-sm text-zinc-400">{formatTodayLabel()}</p>
    </ClientOnly>
  );
}
