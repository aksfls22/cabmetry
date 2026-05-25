import { createClient } from "@/lib/supabase/server";
import { fromZonedTime } from "date-fns-tz";
import { APP_TIMEZONE } from "@/lib/datetime";

export interface PendingPayment {
  id: string;
  amount: number;
  payment_type: string;
  created_at: string;
}

export interface DaySummary {
  date: string; // YYYY-MM-DD
  hasActivity: boolean;
  hasPending: boolean;
  paidIncome: number;
  pendingIncome: number;
  totalExpenses: number;
  ridesCount: number;
  kilometers: number;
  pendingPayments: PendingPayment[];
}

export interface MonthSummary {
  year: number;
  month: number; // 1-12
  days: DaySummary[];
}

/**
 * Get timezone-safe bounds for a specific month.
 * Returns UTC ISO strings for the entire month.
 */
function getMonthBoundsUTC(year: number, month: number): { start: string; end: string } {
  // Start: first day of month at 00:00:00
  const localStart = `${year}-${String(month).padStart(2, "0")}-01T00:00:00`;
  
  // End: first day of next month at 00:00:00
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const localEnd = `${nextYear}-${String(nextMonth).padStart(2, "0")}-01T00:00:00`;

  const startUTC = fromZonedTime(localStart, APP_TIMEZONE);
  const endUTC = fromZonedTime(localEnd, APP_TIMEZONE);

  return {
    start: startUTC.toISOString(),
    end: endUTC.toISOString(),
  };
}

/**
 * Get the number of days in a specific month.
 */
function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/**
 * Extract local date (YYYY-MM-DD) from UTC timestamp.
 */
function getLocalDate(utcTimestamp: string): string {
  const date = new Date(utcTimestamp);
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(date);
}

/**
 * Get monthly summary with daily aggregations in a SINGLE query per table.
 * NO per-day queries. NO duplicated financial logic.
 * Reuses exact payment semantics from reports.ts and financial.ts.
 */
export async function getMonthSummary(year: number, month: number): Promise<MonthSummary> {
  const supabase = createClient();
  const { start, end } = getMonthBoundsUTC(year, month);
  const daysInMonth = getDaysInMonth(year, month);

  // Initialize all days with empty data
  const dayMap = new Map<string, DaySummary>();
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    dayMap.set(dateStr, {
      date: dateStr,
      hasActivity: false,
      hasPending: false,
      paidIncome: 0,
      pendingIncome: 0,
      totalExpenses: 0,
      ridesCount: 0,
      kilometers: 0,
      pendingPayments: [],
    });
  }

  // =========================
  // PAYMENTS (Income) - Single query with pending details
  // Reuses exact pattern from reports.ts and financial.ts
  // =========================
  const { data: payments, error: paymentsError } = await supabase
    .from("payments")
    .select("id, amount, payment_status, payment_type, created_at")
    .gte("created_at", start)
    .lt("created_at", end);

  if (paymentsError) {
    throw paymentsError;
  }

  // Aggregate payments by day
  // Reuses exact payment_status logic from reports.ts
  (payments ?? []).forEach((payment) => {
    const localDate = getLocalDate(payment.created_at);
    const daySummary = dayMap.get(localDate);
    if (daySummary) {
      daySummary.hasActivity = true;
      const amount = Number(payment.amount ?? 0);
      if (payment.payment_status === "paid") {
        daySummary.paidIncome += amount;
      } else if (payment.payment_status === "pending") {
        daySummary.pendingIncome += amount;
        daySummary.hasPending = true;
        // Store individual pending payment for settlement UI
        daySummary.pendingPayments.push({
          id: payment.id,
          amount: amount,
          payment_type: payment.payment_type || "voucher",
          created_at: payment.created_at,
        });
      }
    }
  });

  // =========================
  // EXPENSES - Single query
  // =========================
  const { data: expenses, error: expensesError } = await supabase
    .from("expenses")
    .select("amount, created_at")
    .gte("created_at", start)
    .lt("created_at", end);

  if (expensesError) {
    throw expensesError;
  }

  // Aggregate expenses by day
  (expenses ?? []).forEach((expense) => {
    const localDate = getLocalDate(expense.created_at);
    const daySummary = dayMap.get(localDate);
    if (daySummary) {
      daySummary.hasActivity = true;
      daySummary.totalExpenses += Number(expense.amount ?? 0);
    }
  });

  // =========================
  // RIDES (Count) - Single query
  // =========================
  const { data: rides, error: ridesError } = await supabase
    .from("rides")
    .select("created_at")
    .gte("created_at", start)
    .lt("created_at", end);

  if (ridesError) {
    throw ridesError;
  }

  // Count rides by day
  (rides ?? []).forEach((ride) => {
    const localDate = getLocalDate(ride.created_at);
    const daySummary = dayMap.get(localDate);
    if (daySummary) {
      daySummary.hasActivity = true;
      daySummary.ridesCount += 1;
    }
  });

  // =========================
  // KILOMETERS - Single query
  // =========================
  const startDate = start.split("T")[0];
  const endDate = end.split("T")[0];

  const { data: metricsData, error: metricsError } = await supabase
    .from("daily_metrics")
    .select("date, kilometers")
    .gte("date", startDate)
    .lt("date", endDate);

  if (metricsError) {
    throw metricsError;
  }

  // Aggregate kilometers by day
  (metricsData ?? []).forEach((metric) => {
    const daySummary = dayMap.get(metric.date);
    if (daySummary) {
      daySummary.kilometers = Number(metric.kilometers ?? 0);
      if (daySummary.kilometers > 0) {
        daySummary.hasActivity = true;
      }
    }
  });

  // Convert map to sorted array
  const days = Array.from(dayMap.values()).sort((a, b) => a.date.localeCompare(b.date));

  return {
    year,
    month,
    days,
  };
}
