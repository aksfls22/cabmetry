import { getProfile } from "@/lib/profile";
import { getReportData, type ReportPeriod } from "@/lib/reports";
import { requireUser } from "@/lib/auth";
import { formatCurrency } from "@/lib/formatters";
import { APP_TIMEZONE } from "@/lib/datetime";
import { PrintButton } from "@/components/reports/PrintButton";

export const dynamic = "force-dynamic";

interface PrintReportPageProps {
  searchParams: { 
    type?: string;
    offset?: string;
  };
}

export default async function PrintReportPage({ searchParams }: PrintReportPageProps) {
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
  
  const period = periodMap[periodType] ?? "hoy";

  // Fetch report data with offset support
  const data = await getReportData(period, offset);
  const profile = await getProfile();
  const revenuePercentage = profile?.revenue_percentage ?? 1;

const driverShare =
  data.paidIncome * revenuePercentage;

const ownerShare =
  data.paidIncome - driverShare;

const compensationLabel =
  profile?.compensation_model === "PERCENTAGE"
    ? "Porcentaje de ganancias"
    : "Dueño del vehículo";

  // Get current date/time for footer
  const now = new Date();
  const generatedDate = new Intl.DateTimeFormat("es-ES", {
    timeZone: APP_TIMEZONE,
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(now);

  return (
    <div className="print-page bg-white">
      {/* Print Button - Desktop: top-right, Mobile: below content */}
      <div className="no-print fixed right-8 top-8 z-10 hidden md:block">
        <PrintButton />
      </div>

      {/* Document Container - True A4/Letter proportions */}
      <div className="mx-auto max-w-[850px] px-8 py-8 md:px-16 md:py-10">
        
        {/* Header - Editorial Style */}
        <header className="mb-6 text-center">
          <div className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
            Cabmetry
          </div>
          <h1 className="mb-4 text-3xl font-light tracking-tight text-zinc-900">
            Informe Operacional
          </h1>
          {profile?.display_name && (
  <div className="mb-4 text-lg font-medium text-zinc-700">
    {profile.display_name}
  </div>
)}
          <div className="flex items-center justify-center gap-4 text-sm text-zinc-500">
            <span>{data.periodLabel}</span>
            <span className="text-zinc-300">•</span>
            <span>{generatedDate}</span>
          </div>
        </header>

        {/* Main KPI - Centered, Minimal */}
        <section className="mb-10 text-center">
          <div className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
            Ingresos Cobrados
          </div>
          <div className="mb-4 text-5xl font-light tracking-tight text-zinc-900">
            {formatCurrency(data.paidIncome)}
          </div>
          <div className="text-sm text-zinc-500">
            Beneficio neto:{" "}
            <span className={`font-semibold ${data.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {formatCurrency(data.netProfit)}
            </span>
          </div>
        </section>

        {/* Divider */}
        <div className="mb-8 border-t border-zinc-100"></div>
        <section className="mb-10">
  <div className="mb-6">
    <div className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
      Modelo de ingresos
    </div>

    <div className="text-lg font-medium text-zinc-900">
      {compensationLabel}
    </div>

    <div className="mt-1 text-sm text-zinc-500">
      {Math.round(revenuePercentage * 100)}%
    </div>
  </div>

  <div className="grid grid-cols-2 gap-6">
    <div>
      <div className="mb-1 text-xs font-semibold uppercase tracking-[0.15em] text-zinc-400">
        Tu parte estimada
      </div>

      <div className="text-2xl font-light text-zinc-900">
        {formatCurrency(driverShare)}
      </div>
    </div>

    <div>
      <div className="mb-1 text-xs font-semibold uppercase tracking-[0.15em] text-zinc-400">
        Parte propietario
      </div>

      <div className="text-2xl font-light text-zinc-900">
        {formatCurrency(ownerShare)}
      </div>
    </div>
  </div>
</section>

<div className="mb-8 border-t border-zinc-100"></div>

       {/* Financial Summary - Aligned Rows */}
<section className="mb-10">
  <h2 className="mb-4 text-center text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
    Resumen Financiero
  </h2>

  <div className="space-y-2">
            <div className="flex items-center justify-between border-b border-zinc-50 pb-4">
              <span className="text-sm text-zinc-600">Pendiente de cobro</span>
              <span className="text-lg font-semibold text-zinc-900">
                {formatCurrency(data.pendingIncome)}
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-zinc-50 pb-4">
              <span className="text-sm text-zinc-600">Gastos operativos</span>
              <span className="text-lg font-semibold text-zinc-900">
                {formatCurrency(data.totalExpenses)}
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-zinc-50 pb-4">
              <span className="text-sm text-zinc-600">Beneficio neto</span>
              <span className={`text-lg font-semibold ${data.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {formatCurrency(data.netProfit)}
              </span>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="mb-6 border-t border-zinc-100"></div>

        {/* Operational Metrics - Aligned Rows */}
        <section className="mb-4">
          <h2 className="mb-4 text-center text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
            Métricas Operacionales
          </h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between border-b border-zinc-50 pb-4">
              <span className="text-sm text-zinc-600">Carreras</span>
              <span className="text-lg font-semibold text-zinc-900">
                {data.totalRides}
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-zinc-50 pb-4">
              <span className="text-sm text-zinc-600">Kilómetros</span>
              <span className="text-lg font-semibold text-zinc-900">
                {data.totalKilometers.toFixed(1)} km
              </span>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="mb-2 border-t border-zinc-100"></div>

                     {/* Report ends after operational metrics */}

        

        {/* Mobile Print Button - Below content */}
        <div className="no-print mt-12 flex justify-center md:hidden">
          <PrintButton />
        </div>
      </div>
    </div>
  );
}
