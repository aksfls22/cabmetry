import { es } from "@/lib/i18n/es";
import { formatCurrency } from "@/lib/utils";
import type { LastActiveDayMetrics } from "@/lib/last-active-day";

interface DashboardInsightsProps {
  todayKilometers: number;
  lastActiveDay: LastActiveDayMetrics;
}

export function DashboardInsights({
  todayKilometers,
  lastActiveDay,
}: DashboardInsightsProps) {
  return (
    <section className="mb-8" aria-label={es.dashboard.analysisAria}>
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-500">
        {es.dashboard.analysis}
      </h2>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <InsightCard
          label={es.dashboard.lastKilometers}
          value={todayKilometers > 0 ? `${todayKilometers} km` : es.dashboard.noData}
          muted={todayKilometers === 0}
          icon="📍"
        />
        <InsightCard
          label={es.dashboard.lastShift}
          value={lastActiveDay.hasData ? es.dashboard.ridesCount(lastActiveDay.ridesCount) : es.dashboard.noData}
          muted={!lastActiveDay.hasData}
          icon="🚕"
        />
        <InsightCard
          label={es.dashboard.lastShiftNet}
          value={lastActiveDay.hasData ? formatCurrency(lastActiveDay.netIncome) : es.dashboard.noData}
          muted={!lastActiveDay.hasData}
          icon="💰"
          className="col-span-2 md:col-span-1"
        />
      </div>
    </section>
  );
}

function InsightCard({
  label,
  value,
  muted,
  icon,
  className,
}: {
  label: string;
  value: string;
  muted?: boolean;
  icon?: string;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-surface-border bg-surface-raised/80 p-4 shadow-card ${className || ""}`}>
      <div className="flex items-center gap-2">
        {icon && <span className="text-base opacity-60">{icon}</span>}
        <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">{label}</p>
      </div>
      <p
        className={`mt-2 truncate text-lg font-bold tabular-nums leading-none ${
          muted ? "text-zinc-500" : "text-zinc-100"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
