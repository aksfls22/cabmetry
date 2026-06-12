import { formatCurrency } from "@/lib/utils";

interface ReportFinancialSummaryProps {
  ingresosCobrados: number;
  pendienteCobro: number;
  gastosOperativos: number;

  isPercentageModel?: boolean;
  estimatedDriverShare?: number;
  estimatedOwnerShare?: number;

  previousPaidIncome?: number;
}
export function ReportFinancialSummary({
  ingresosCobrados,
  pendienteCobro,
  gastosOperativos,
  isPercentageModel = false,
  estimatedDriverShare = 0,
  estimatedOwnerShare = 0,
  previousPaidIncome,
}: ReportFinancialSummaryProps){
  console.log("REPORT FINANCIAL PROPS", {
    isPercentageModel,
    estimatedDriverShare,
    estimatedOwnerShare,
  });
  const hasComparison =
  previousPaidIncome !== undefined &&
  previousPaidIncome > 0;

const absoluteChange = hasComparison
  ? ingresosCobrados - previousPaidIncome
  : 0;

const percentageChange = hasComparison
  ? (absoluteChange / previousPaidIncome) * 100
  : 0;

const isPositive = absoluteChange > 0;
const isNegative = absoluteChange < 0;
  return (
    <div className="rounded-2xl border border-zinc-800/50 bg-zinc-900/30 overflow-hidden">
     {/* PRIMARY: Facturación generada */}
<div className="bg-zinc-800/50 px-6 py-6">
  <div className="flex items-baseline justify-between">
    <span className="text-sm font-semibold text-zinc-400">
      Facturación generada
    </span>

    <span className="text-3xl font-bold tabular-nums text-profit">
      {formatCurrency(ingresosCobrados)}
    </span>
  </div>
</div>

{isPercentageModel && (
  <div className="border-t border-zinc-800/50 px-6 py-5">
    <div className="mb-4 text-xs font-semibold uppercase tracking-[0.15em] text-zinc-500">
  Reparto
</div>

    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-emerald-400">
          Tu parte
        </span>

        <span className="text-lg font-semibold text-emerald-400">
          {formatCurrency(estimatedDriverShare)}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-zinc-400">
          Propietario
        </span>

        <span className="text-lg font-semibold text-zinc-300">
          {formatCurrency(estimatedOwnerShare)}
        </span>
      </div>
    </div>
  </div>
)}

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
