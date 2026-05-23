import { ReportRangeTabs } from "@/components/reports/ReportRangeTabs";
import { ReportFinancialSummary } from "@/components/reports/ReportFinancialSummary";
import { ReportOperationalSummary } from "@/components/reports/ReportOperationalSummary";
import { getReportData, type ReportPeriod } from "@/lib/reports";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

interface ReportsPageProps {
  searchParams: { period?: string };
}

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  await requireUser();

  // Get period from URL, default to "hoy"
  const period = (searchParams.period as ReportPeriod) ?? "hoy";
  
  // Validate period
  const validPeriod: ReportPeriod = ["hoy", "semana", "mes"].includes(period)
    ? period
    : "hoy";

  // Fetch real data
  const data = await getReportData(validPeriod);

  // Calculate efficiency (€/km)
  const euroPorKm = data.totalKilometers > 0 
    ? data.paidIncome / data.totalKilometers 
    : 0;

  // Period label mapping for section headers
  const periodHeaderMap = {
    hoy: "hoy",
    semana: "esta semana",
    mes: "este mes",
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <header>
        <h1 className="text-2xl font-bold text-white">Informes</h1>
        <p className="mt-1 text-sm text-zinc-400">Resumen operacional y financiero</p>
      </header>

      {/* Period Selector */}
      <ReportRangeTabs />

      {/* Period Context */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-zinc-500">Período:</span>
        <span className="font-medium text-zinc-300">{data.periodLabel}</span>
      </div>

      {/* Financial Statement */}
      <section aria-label="Resumen financiero">
        <h2 className="mb-4 text-sm font-semibold text-zinc-400">
          Resumen de {periodHeaderMap[validPeriod]}
        </h2>
        <ReportFinancialSummary
          ingresosCobrados={data.paidIncome}
          pendienteCobro={data.pendingIncome}
          gastosOperativos={data.totalExpenses}
        />
      </section>

      {/* Operational Metrics */}
      <section aria-label="Métricas operacionales">
        <h2 className="mb-3 text-sm font-semibold text-zinc-400">
          Métricas operacionales
        </h2>
        <ReportOperationalSummary
          carreras={data.totalRides}
          kilometros={data.totalKilometers}
          euroPorKm={euroPorKm}
        />
      </section>
    </div>
  );
}
