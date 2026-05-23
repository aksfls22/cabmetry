import { formatCurrency } from "@/lib/utils";

interface ReportOperationalSummaryProps {
  carreras: number;
  kilometros: number;
  euroPorKm: number;
}

export function ReportOperationalSummary({
  carreras,
  kilometros,
  euroPorKm,
}: ReportOperationalSummaryProps) {
  return (
    <div className="flex items-center gap-6 rounded-xl border border-zinc-800/30 bg-zinc-900/20 px-5 py-4">
      <MetricItem
        label="Carreras"
        value={carreras.toString()}
      />
      <div className="h-8 w-px bg-zinc-800/50" />
      <MetricItem
        label="Kilómetros"
        value={`${kilometros} km`}
      />
      <div className="h-8 w-px bg-zinc-800/50" />
      <MetricItem
        label="Eficiencia"
        value={formatCurrency(euroPorKm)}
        suffix="/km"
      />
    </div>
  );
}

function MetricItem({
  label,
  value,
  suffix,
}: {
  label: string;
  value: string;
  suffix?: string;
}) {
  return (
    <div className="flex-1">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-1 text-base font-semibold tabular-nums text-zinc-200">
        {value}
        {suffix && <span className="ml-0.5 text-xs text-zinc-500">{suffix}</span>}
      </p>
    </div>
  );
}
