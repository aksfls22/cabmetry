"use client";

import { ClientOnly } from "@/components/ClientOnly";
import { formatDate, formatTime } from "@/lib/utils";

interface FormattedDateTimeProps {
  iso: string;
  className?: string;
}

/** Date + time text safe for SSR hydration (client renders after mount). */
export function FormattedDateTime({ iso, className }: FormattedDateTimeProps) {
  return (
    <ClientOnly
      fallback={
        <span className={className} suppressHydrationWarning>
          —
        </span>
      }
    >
      <span className={className}>
        {formatDate(iso)} {formatTime(iso)}
      </span>
    </ClientOnly>
  );
}
