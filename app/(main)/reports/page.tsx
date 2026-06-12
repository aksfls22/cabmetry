import { getProfile } from "@/lib/profile";
import { ReportRangeTabs } from "@/components/reports/ReportRangeTabs";
import { ReportFinancialSummary } from "@/components/reports/ReportFinancialSummary";
import { ReportOperationalSummary } from "@/components/reports/ReportOperationalSummary";
import { ExportButton } from "@/components/reports/ExportButton";
import { GenerateReportButton } from "@/components/reports/GenerateReportButton";
import { getReportData, type ReportPeriod } from "@/lib/reports";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

interface ReportsPageProps {
  searchParams: { 
    period?: string;
    type?: string;
    offset?: string;
  };
}

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  await requireUser();

  // Get period type and offset from URL
  const periodType = searchParams.type ?? "dia";
  const offset = parseInt(searchParams.offset ?? "0");

  // Map period type to ReportPeriod for getReportData
  const periodMap: Record<string, ReportPeriod> = {
    dia: "hoy",
    semana: "semana",
    mes: "mes",
  };
  
  const validPeriod: ReportPeriod = periodMap[periodType] ?? "hoy";

 // Fetch current and previous period in parallel
const [data, previousData] = await Promise.all([
  getReportData(validPeriod, offset),
  getReportData(validPeriod, offset - 1),
]);
  const profile = await getProfile();
  console.log("PROFILE REPORTS:", profile);
  const revenuePercentage =
  profile?.revenue_percentage ?? 1;

const isPercentageModel =
  profile?.compensation_model === "PERCENTAGE";

const estimatedDriverShare =

  data.paidIncome * revenuePercentage;
  const estimatedOwnerShare =
  data.paidIncome - estimatedDriverShare;
  console.log("REPORT CALCULATIONS", {
    paidIncome: data.paidIncome,
    revenuePercentage,
    estimatedDriverShare,
    estimatedOwnerShare,
  });

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

      {/* Export Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch sm:justify-end">
      <div className="w-full sm:w-[220px]">
          <GenerateReportButton type={periodType} offset={offset} />
        </div>
        <div className="w-full sm:w-[220px]">
          <ExportButton data={data} period={validPeriod} />
        </div>
      </div>

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
  isPercentageModel={isPercentageModel}
  estimatedDriverShare={estimatedDriverShare}
  estimatedOwnerShare={estimatedOwnerShare}
  previousPaidIncome={previousData.paidIncome}
/>
      </section>

      {/* Driver Share - Only for percentage model */}
      {isPercentageModel && (
        <section aria-label="Tu parte estimada" className="rounded-2xl border border-emerald-800/30 bg-emerald-900/10 p-6">
          <h2 className="mb-2 text-sm font-semibold text-emerald-400">
            Tu parte estimada
          </h2>
          <p className="text-3xl font-bold text-emerald-300">
            {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(estimatedDriverShare)}
          </p>
          <p className="mt-2 text-xs text-zinc-400">
            Basado en tu porcentaje configurado del {(revenuePercentage * 100).toFixed(0)}%
          </p>
        </section>
      )}

      {/* Operational Metrics */}
      <section aria-label="Métricas operacionales">
        <h2 className="mb-3 text-sm font-semibold text-zinc-400">
          Métricas operacionales
        </h2>
        <ReportOperationalSummary
          carreras={data.totalRides}
          kilometros={data.totalKilometers}
        />
      </section>
    </div>
  );
}
