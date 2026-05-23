import { createClient } from "@/lib/supabase/server";
import { fromZonedTime } from "date-fns-tz";
import { APP_TIMEZONE } from "@/lib/datetime";

export type ReportPeriod = "hoy" | "semana" | "mes";

export interface ReportData {
  // Financial
  paidIncome: number;
  pendingIncome: number;
  totalExpenses: number;
  netProfit: number;
  
  // Operational
  totalRides: number;
  totalKilometers: number;
  
  // Period context
  periodLabel: string;
}

/**
 * Get timezone-safe bounds for a report period.
 * Reuses datetime.ts patterns for consistency.
 */
function getPeriodBoundsUTC(period: ReportPeriod): { start: string; end: string } {
  const now = new Date();

  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = formatter.formatToParts(now);
  const year = Number(parts.find((p) => p.type === "year")?.value);
  const month = Number(parts.find((p) => p.type === "month")?.value);
  const day = Number(parts.find((p) => p.type === "day")?.value);

  let localStart: string;
  let localEnd: string;

  if (period === "hoy") {
    // Today: 00:00:00 → next day 00:00:00
    localStart = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T00:00:00`;
    localEnd = `${year}-${String(month).padStart(2, "0")}-${String(day + 1).padStart(2, "0")}T00:00:00`;
  } else if (period === "semana") {
    // Current week: Monday → Sunday (inclusive)
    const currentDate = new Date(year, month - 1, day);
    const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 1 = Monday, ...
    const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // If Sunday, go back 6 days
    
    const monday = new Date(currentDate);
    monday.setDate(currentDate.getDate() + daysToMonday);
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    
    const nextMonday = new Date(sunday);
    nextMonday.setDate(sunday.getDate() + 1);

    localStart = `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, "0")}-${String(monday.getDate()).padStart(2, "0")}T00:00:00`;
    localEnd = `${nextMonday.getFullYear()}-${String(nextMonday.getMonth() + 1).padStart(2, "0")}-${String(nextMonday.getDate()).padStart(2, "0")}T00:00:00`;
  } else {
    // Current month: 1st → next month 1st
    localStart = `${year}-${String(month).padStart(2, "0")}-01T00:00:00`;
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    localEnd = `${nextYear}-${String(nextMonth).padStart(2, "0")}-01T00:00:00`;
  }

  const startUTC = fromZonedTime(localStart, APP_TIMEZONE);
  const endUTC = fromZonedTime(localEnd, APP_TIMEZONE);

  return {
    start: startUTC.toISOString(),
    end: endUTC.toISOString(),
  };
}

/**
 * Generate human-readable period label in Spanish.
 */
function getPeriodLabel(period: ReportPeriod): string {
  const now = new Date();
  
  const formatter = new Intl.DateTimeFormat("es-ES", {
    timeZone: APP_TIMEZONE,
  });

  if (period === "hoy") {
    // e.g., "Sábado 23 mayo 2026"
    const dayName = new Intl.DateTimeFormat("es-ES", {
      timeZone: APP_TIMEZONE,
      weekday: "long",
    }).format(now);
    
    const day = new Intl.DateTimeFormat("es-ES", {
      timeZone: APP_TIMEZONE,
      day: "numeric",
    }).format(now);
    
    const month = new Intl.DateTimeFormat("es-ES", {
      timeZone: APP_TIMEZONE,
      month: "long",
    }).format(now);
    
    const year = new Intl.DateTimeFormat("es-ES", {
      timeZone: APP_TIMEZONE,
      year: "numeric",
    }).format(now);

    return `${dayName.charAt(0).toUpperCase() + dayName.slice(1)} ${day} ${month} ${year}`;
  } else if (period === "semana") {
    // e.g., "20 mayo → 26 mayo"
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: APP_TIMEZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(now);
    
    const year = Number(parts.find((p) => p.type === "year")?.value);
    const month = Number(parts.find((p) => p.type === "month")?.value);
    const day = Number(parts.find((p) => p.type === "day")?.value);
    
    const currentDate = new Date(year, month - 1, day);
    const dayOfWeek = currentDate.getDay();
    const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    
    const monday = new Date(currentDate);
    monday.setDate(currentDate.getDate() + daysToMonday);
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const mondayDay = monday.getDate();
    const mondayMonth = new Intl.DateTimeFormat("es-ES", {
      month: "long",
    }).format(monday);
    
    const sundayDay = sunday.getDate();
    const sundayMonth = new Intl.DateTimeFormat("es-ES", {
      month: "long",
    }).format(sunday);

    if (monday.getMonth() === sunday.getMonth()) {
      return `${mondayDay} ${mondayMonth} → ${sundayDay} ${mondayMonth}`;
    } else {
      return `${mondayDay} ${mondayMonth} → ${sundayDay} ${sundayMonth}`;
    }
  } else {
    // e.g., "Mayo 2026"
    const month = new Intl.DateTimeFormat("es-ES", {
      timeZone: APP_TIMEZONE,
      month: "long",
    }).format(now);
    
    const year = new Intl.DateTimeFormat("es-ES", {
      timeZone: APP_TIMEZONE,
      year: "numeric",
    }).format(now);

    return `${month.charAt(0).toUpperCase() + month.slice(1)} ${year}`;
  }
}

/**
 * Get report data for a specific period.
 * Reuses financial.ts patterns for consistency with dashboard.
 */
export async function getReportData(period: ReportPeriod): Promise<ReportData> {
  const supabase = createClient();
  const { start, end } = getPeriodBoundsUTC(period);

  // =========================
  // PAYMENTS (Income)
  // =========================
  // Reuses exact pattern from financial.ts

  const { data: payments, error: paymentsError } = await supabase
    .from("payments")
    .select("amount, payment_status, created_at")
    .gte("created_at", start)
    .lt("created_at", end);

  if (paymentsError) {
    throw paymentsError;
  }

  // =========================
  // EXPENSES
  // =========================
  // Reuses exact pattern from financial.ts

  const { data: expenses, error: expensesError } = await supabase
    .from("expenses")
    .select("amount, created_at")
    .gte("created_at", start)
    .lt("created_at", end);

  if (expensesError) {
    throw expensesError;
  }

  // =========================
  // RIDES (Count)
  // =========================

  const { count: totalRides, error: ridesError } = await supabase
    .from("rides")
    .select("*", { count: "exact", head: true })
    .gte("created_at", start)
    .lt("created_at", end);

  if (ridesError) {
    throw ridesError;
  }

  // =========================
  // KILOMETERS (from daily_metrics)
  // =========================
  // Source of truth: daily_metrics.kilometers

  // Extract date range from UTC bounds
  const startDate = start.split("T")[0];
  const endDate = end.split("T")[0];

  const { data: metricsData, error: metricsError } = await supabase
    .from("daily_metrics")
    .select("kilometers")
    .gte("date", startDate)
    .lt("date", endDate);

  if (metricsError) {
    throw metricsError;
  }

  // =========================
  // CALCULATIONS
  // =========================
  // Reuses exact financial logic from financial.ts

  const paidIncome = (payments ?? [])
    .filter((p) => p.payment_status === "paid")
    .reduce((sum, p) => sum + Number(p.amount ?? 0), 0);

  const pendingIncome = (payments ?? [])
    .filter((p) => p.payment_status === "pending")
    .reduce((sum, p) => sum + Number(p.amount ?? 0), 0);

  const totalExpenses = (expenses ?? [])
    .reduce((sum, e) => sum + Number(e.amount ?? 0), 0);

  const netProfit = paidIncome - totalExpenses;

  // Aggregate kilometers from daily_metrics
  const totalKilometers = (metricsData ?? [])
    .reduce((sum, metric) => sum + Number(metric.kilometers ?? 0), 0);

  return {
    paidIncome,
    pendingIncome,
    totalExpenses,
    netProfit,
    totalRides: totalRides ?? 0,
    totalKilometers,
    periodLabel: getPeriodLabel(period),
  };
}
