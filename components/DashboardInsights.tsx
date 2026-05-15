import { es } from "@/lib/i18n/es";
import { formatCurrency, paymentLabel } from "@/lib/utils";
import type { DashboardInsights as Insights } from "@/lib/types";

interface DashboardInsightsProps {
  insights: Insights;
  hasRides: boolean;
}

export function DashboardInsights({
  insights,
  hasRides,
}: DashboardInsightsProps) {
  const paymentLabelText = insights.topPaymentMethod
    ? paymentLabel(insights.topPaymentMethod)
    : "—";

  return (
    <section className="mb-8" aria-label={es.dashboard.analysisAria}>
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
        {es.dashboard.analysis}
      </h2>
      <div className="grid grid-cols-2 gap-3">
        <InsightCard
          label={es.dashboard.topPaymentMethod}
          value={hasRides ? paymentLabelText : es.dashboard.noData}
          muted={!hasRides}
        />
        <InsightCard
          label={es.dashboard.avgPerRide}
          value={hasRides ? formatCurrency(insights.averageRideValue) : "—"}
          muted={!hasRides}
        />
      </div>
    </section>
  );
}

function InsightCard({
  label,
  value,
  muted,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-surface-border bg-surface-raised/80 p-4 shadow-card">
      <p className="text-xs font-medium text-zinc-500">{label}</p>
      <p
        className={`mt-1.5 truncate text-base font-semibold tabular-nums ${
          muted ? "text-zinc-500" : "text-zinc-100"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
