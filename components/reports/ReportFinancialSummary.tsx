import { formatCurrency } from "@/lib/utils";

interface ReportFinancialSummaryProps {
  ingresosCobrados: number;
  pendienteCobro: number;
  gastosOperativos: number;
}

export function ReportFinancialSummary({
  ingresosCobrados,
  pendienteCobro,
  gastosOperativos,
}: ReportFinancialSummaryProps) {
  return (
    <div className="rounded-2xl border border-zinc-800/50 bg-zinc-900/30 overflow-hidden">
      {/* PRIMARY: Ingresos cobrados - Hero metric */}
      <div className="bg-zinc-800/30 px-6 py-6">
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-semibold text-zinc-400">
            Ingresos cobrados
          </span>
          <span className="text-3xl font-bold tabular-nums text-profit">
            {formatCurrency(ingresosCobrados)}
          </span>
        </div>
      </div>

      {/* SECONDARY: Supporting financial information */}
      <div className="divide-y divide-zinc-800/50">
        <FinancialLine
          label="Pendiente de cobro"
          value={pendienteCobro}
          variant="neutral"
        />
        <FinancialLine
          label="Gastos operativos"
          value={gastosOperativos}
          variant="expense"
        />
      </div>
    </div>
  );
}

function FinancialLine({
  label,
  value,
  variant,
}: {
  label: string;
  value: number;
  variant: "neutral" | "expense";
}) {
  const textColor = {
    neutral: "text-zinc-300",
    expense: "text-zinc-300",
  }[variant];

  return (
    <div className="flex items-center justify-between px-6 py-4">
      <span className="text-sm text-zinc-400">{label}</span>
      <span className={`text-base font-semibold tabular-nums ${textColor}`}>
        {formatCurrency(value)}
      </span>
    </div>
  );
}
