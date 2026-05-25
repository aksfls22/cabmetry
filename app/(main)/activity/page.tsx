import { PageHeader } from "@/components/PageHeader";
import { OperationalCalendar } from "@/components/OperationalCalendar";
import { getMonthSummary } from "@/lib/calendar-summary";
import { APP_TIMEZONE } from "@/lib/datetime";

interface ActivityPageProps {
  searchParams: { year?: string; month?: string };
}

export default async function ActivityPage({ searchParams }: ActivityPageProps) {
  // Get current month in app timezone as default
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIMEZONE,
    year: "numeric",
    month: "2-digit",
  });

  const parts = formatter.formatToParts(now);
  const currentYear = Number(parts.find((p) => p.type === "year")?.value);
  const currentMonth = Number(parts.find((p) => p.type === "month")?.value);

  // Use query params if provided, otherwise use current month
  const year = searchParams.year ? Number(searchParams.year) : currentYear;
  const month = searchParams.month ? Number(searchParams.month) : currentMonth;

  // Validate year and month
  const isValidYear = year >= 2020 && year <= 2100;
  const isValidMonth = month >= 1 && month <= 12;

  let monthSummary;
  let error: string | null = null;

  if (!isValidYear || !isValidMonth) {
    error = "Fecha inválida";
  } else {
    try {
      monthSummary = await getMonthSummary(year, month);
    } catch (e) {
      error = e instanceof Error ? e.message : "Error al cargar el calendario";
    }
  }

  return (
    <>
      <PageHeader
        title="Actividad"
        subtitle="Calendario operacional mensual"
      />

      {error ? (
        <div className="mb-6 rounded-2xl border border-expense/30 bg-expense/10 p-4 text-sm text-expense">
          <p className="font-medium">Error al cargar</p>
          <p className="mt-1 text-expense/80">{error}</p>
        </div>
      ) : monthSummary ? (
        <OperationalCalendar
          initialYear={monthSummary.year}
          initialMonth={monthSummary.month}
          days={monthSummary.days}
        />
      ) : null}
    </>
  );
}
