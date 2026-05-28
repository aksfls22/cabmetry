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
 * Get timezone-safe bounds for a report period with offset support.
 * Reuses datetime.ts patterns for consistency.
 * 
 * @param period - The period type (hoy, semana, mes)
 * @param offset - Number of periods to offset (0 = current, -1 = previous, etc.)
 */
function getPeriodBoundsUTC(period: ReportPeriod, offset: number = 0): { start: string; end: string } {
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
    // Day with offset: apply offset to current day
    const targetDate = new Date(year, month - 1, day + offset);
    const nextDate = new Date(year, month - 1, day + offset + 1);
    
    localStart = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, "0")}-${String(targetDate.getDate()).padStart(2, "0")}T00:00:00`;
    localEnd = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, "0")}-${String(nextDate.getDate()).padStart(2, "0")}T00:00:00`;
  } else if (period === "semana") {
    // Week with offset: apply offset in weeks
    const currentDate = new Date(year, month - 1, day);
    const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 1 = Monday, ...
    const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    
    // Get Monday of current week, then apply week offset
    const monday = new Date(currentDate);
    monday.setDate(currentDate.getDate() + daysToMonday + (offset * 7));
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    
    const nextMonday = new Date(sunday);
    nextMonday.setDate(sunday.getDate() + 1);

    localStart = `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, "0")}-${String(monday.getDate()).padStart(2, "0")}T00:00:00`;
    localEnd = `${nextMonday.getFullYear()}-${String(nextMonday.getMonth() + 1).padStart(2, "0")}-${String(nextMonday.getDate()).padStart(2, "0")}T00:00:00`;
  } else {
    // Month with offset: apply offset in months
    const targetMonth = month + offset;
    const targetYear = year + Math.floor((targetMonth - 1) / 12);
    const normalizedMonth = ((targetMonth - 1) % 12) + 1;
    
    localStart = `${targetYear}-${String(normalizedMonth).padStart(2, "0")}-01T00:00:00`;
    
    const nextMonth = normalizedMonth === 12 ? 1 : normalizedMonth + 1;
    const nextYear = normalizedMonth === 12 ? targetYear + 1 : targetYear;
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
 * Generate human-readable period label in Spanish with offset support.
 * 
 * @param period - The period type (hoy, semana, mes)
 * @param offset - Number of periods to offset (0 = current, -1 = previous, etc.)
 */
function getPeriodLabel(period: ReportPeriod, offset: number = 0): string {
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

  if (period === "hoy") {
    // Day with offset
    const targetDate = new Date(year, month - 1, day + offset);
    
    const dayName = new Intl.DateTimeFormat("es-ES", {
      weekday: "long",
    }).format(targetDate);
    
    const targetDay = new Intl.DateTimeFormat("es-ES", {
      day: "numeric",
    }).format(targetDate);
    
    const targetMonth = new Intl.DateTimeFormat("es-ES", {
      month: "long",
    }).format(targetDate);
    
    const targetYear = new Intl.DateTimeFormat("es-ES", {
      year: "numeric",
    }).format(targetDate);

    return `${dayName.charAt(0).toUpperCase() + dayName.slice(1)} ${targetDay} ${targetMonth} ${targetYear}`;
  } else if (period === "semana") {
    // Week with offset
    const currentDate = new Date(year, month - 1, day);
    const dayOfWeek = currentDate.getDay();
    const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    
    const monday = new Date(currentDate);
    monday.setDate(currentDate.getDate() + daysToMonday + (offset * 7));
    
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
    // Month with offset
    const targetMonth = month + offset;
    const targetYear = year + Math.floor((targetMonth - 1) / 12);
    const normalizedMonth = ((targetMonth - 1) % 12) + 1;
    
    const targetDate = new Date(targetYear, normalizedMonth - 1, 1);
    
    const monthName = new Intl.DateTimeFormat("es-ES", {
      month: "long",
    }).format(targetDate);
    
    const yearName = new Intl.DateTimeFormat("es-ES", {
      year: "numeric",
    }).format(targetDate);

    return `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${yearName}`;
  }
}

/**
 * Get report data for a specific period with offset support.
 * Reuses financial.ts patterns for consistency with dashboard.
 * 
 * @param period - The period type (hoy, semana, mes)
 * @param offset - Number of periods to offset (0 = current, -1 = previous, etc.)
 */
export async function getReportData(period: ReportPeriod, offset: number = 0): Promise<ReportData> {
  const supabase = createClient();
  const { start, end } = getPeriodBoundsUTC(period, offset);

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
    periodLabel: getPeriodLabel(period, offset),
  };
}
