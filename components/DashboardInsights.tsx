import { es } from "@/lib/i18n/es";
import { formatCurrency } from "@/lib/utils";
import type { DashboardInsights as Insights } from "@/lib/types";

interface DashboardInsightsProps {
  insights: Insights;
  hasRides: boolean;
  todayKilometers: number;
  totalIncome: number;
  totalExpenses: number;
}

export function DashboardInsights({
  insights,
  hasRides,
  todayKilometers,
  totalIncome,
  totalExpenses,
}: DashboardInsightsProps) {
  const efficiency = todayKilometers > 0 && totalIncome > 0
    ? totalIncome / todayKilometers
    : 0;

  const avgExpensePerRide = hasRides && insights.averageRideValue > 0
    ? (totalExpenses / (totalIncome / insights.averageRideValue))
    : 0;

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
          label={es.dashboard.efficiency}
          value={efficiency > 0 ? `${formatCurrency(efficiency)}${es.dashboard.efficiencyUnit}` : es.dashboard.noData}
          muted={efficiency === 0}
          icon="⚡"
        />
        <InsightCard
          label={es.dashboard.avgPerRide}
          value={hasRides ? formatCurrency(insights.averageRideValue) : es.dashboard.noData}
          muted={!hasRides}
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
