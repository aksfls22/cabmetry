import { createClient } from "@/lib/supabase/server";
import { fromZonedTime } from "date-fns-tz";
import { APP_TIMEZONE, getTodayBoundsUTC } from "@/lib/datetime";

export interface LastActiveDayMetrics {
  ridesCount: number;
  netIncome: number;
  hasData: boolean;
}

/**
 * Gets metrics for the last COMPLETE PREVIOUS day with ride activity.
 * Excludes today completely - only shows data from previous days.
 */
export async function getLastActiveDayMetrics(): Promise<LastActiveDayMetrics> {
  const supabase = createClient();

  // Get today's bounds to exclude current day
  const { start: todayStart } = getTodayBoundsUTC();

  // Get the most recent ride BEFORE today to find the last complete previous day
  const { data: lastRide, error: lastRideError } = await supabase
    .from("rides")
    .select("created_at")
    .lt("created_at", todayStart)  // Exclude today
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (lastRideError || !lastRide) {
    return { ridesCount: 0, netIncome: 0, hasData: false };
  }

  // Extract the date from that previous day's ride
  const lastRideDate = new Date(lastRide.created_at);
  
  // Get the calendar day in app timezone
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = formatter.formatToParts(lastRideDate);
  const year = Number(parts.find((p) => p.type === "year")?.value);
  const month = Number(parts.find((p) => p.type === "month")?.value);
  const day = Number(parts.find((p) => p.type === "day")?.value);

  // Build UTC bounds for that day
  const localStart = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T00:00:00`;
  const localEnd = `${year}-${String(month).padStart(2, "0")}-${String(day + 1).padStart(2, "0")}T00:00:00`;

  const startUTC = fromZonedTime(localStart, APP_TIMEZONE);
  const endUTC = fromZonedTime(localEnd, APP_TIMEZONE);

  // Get rides count for that day
  const { count: ridesCount, error: ridesError } = await supabase
    .from("rides")
    .select("*", { count: "exact", head: true })
    .gte("created_at", startUTC.toISOString())
    .lt("created_at", endUTC.toISOString());

  if (ridesError) {
    throw ridesError;
  }

  // Get payments (income) for that day
  const { data: payments, error: paymentsError } = await supabase
    .from("payments")
    .select("amount, payment_status")
    .gte("created_at", startUTC.toISOString())
    .lt("created_at", endUTC.toISOString());

  if (paymentsError) {
    throw paymentsError;
  }

  // Get expenses for that day
  const { data: expenses, error: expensesError } = await supabase
    .from("expenses")
    .select("amount")
    .gte("created_at", startUTC.toISOString())
    .lt("created_at", endUTC.toISOString());

  if (expensesError) {
    throw expensesError;
  }

  // Calculate net income (paid income - expenses)
  const paidIncome = (payments ?? [])
    .filter((p) => p.payment_status === "paid")
    .reduce((sum, p) => sum + Number(p.amount ?? 0), 0);

  const totalExpenses = (expenses ?? [])
    .reduce((sum, e) => sum + Number(e.amount ?? 0), 0);

  const netIncome = paidIncome - totalExpenses;

  return {
    ridesCount: ridesCount ?? 0,
    netIncome,
    hasData: true,
  };
}
