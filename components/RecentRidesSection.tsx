import Link from "next/link";
import { FormattedDateTime } from "@/components/FormattedDateTime";
import { es } from "@/lib/i18n/es";
import { formatCurrency, paymentLabel } from "@/lib/utils";
import type { Ride } from "@/lib/types";

interface RecentRidesSectionProps {
  rides: Ride[];
}

export function RecentRidesSection({ rides }: RecentRidesSectionProps) {
  return (
    <section className="mb-8" aria-label={es.dashboard.recentRides}>
      <div className="mb-3 flex items-end justify-between gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          {es.dashboard.recentRides}
        </h2>
        {rides.length > 0 ? (
  <Link
    href="/rides/history"
    className="text-xs font-medium text-accent hover:text-accent/90"
  >
    {es.dashboard.seeAll}
  </Link>
) : (
  <Link
    href="/rides/new"
    className="text-xs font-medium text-accent hover:text-accent/90"
  >
    Añadir primera carrera
  </Link>
)}
      </div>

      {rides.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-surface-border bg-surface-raised/50 px-4 py-10 text-center">
          <p className="text-sm text-zinc-500">{es.dashboard.noRidesToday}</p>
          <p className="mt-1 text-xs text-zinc-600">
            {es.dashboard.noRidesTodayHint}
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {rides.map((ride) => (
            <li
              key={ride.id}
              className="flex items-center gap-3 rounded-2xl border border-surface-border bg-surface-raised p-3.5 shadow-card"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-profit/15 text-sm font-bold text-profit">
                +
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold tabular-nums text-white">
                  {formatCurrency(Number(ride.amount))}
                </p>
                <p className="truncate text-xs text-zinc-400">
                  {paymentLabel(ride.payment_method)} ·{" "}
                  <FormattedDateTime iso={ride.created_at} />
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
