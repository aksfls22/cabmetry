import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type {
  DashboardData,
  DashboardInsights,
  Expense,
  PaymentMethod,
  Ride,
  TodayStats,
} from "@/lib/types";
import { getTodayBounds } from "@/lib/utils";

const RECENT_RIDES_LIMIT = 5;

function topPaymentMethod(rides: Ride[]): PaymentMethod | null {
  if (rides.length === 0) return null;

  const counts = new Map<PaymentMethod, number>();
  for (const ride of rides) {
    const method = ride.payment_method as PaymentMethod;
    counts.set(method, (counts.get(method) ?? 0) + 1);
  }

  let best: PaymentMethod | null = null;
  let max = 0;
  counts.forEach((count, method) => {
    if (count > max) {
      max = count;
      best = method;
    }
  });
  return best;
}

function buildInsights(rides: Ride[], totalEarnings: number): DashboardInsights {
  const totalRides = rides.length;
  return {
    topPaymentMethod: topPaymentMethod(rides),
    averageRideValue: totalRides > 0 ? totalEarnings / totalRides : 0,
  };
}

export async function getDashboardData(): Promise<DashboardData> {
  await requireUser();
  const supabase = createClient();
  const { start, end } = getTodayBounds();

  const [ridesRes, expensesRes] = await Promise.all([
    supabase
      .from("rides")
      .select("id, amount, payment_method, notes, created_at")
      .gte("created_at", start)
      .lt("created_at", end)
      .order("created_at", { ascending: false }),
    supabase
      .from("expenses")
      .select("amount")
      .gte("created_at", start)
      .lt("created_at", end),
  ]);

  if (ridesRes.error) throw ridesRes.error;
  if (expensesRes.error) throw expensesRes.error;

  const rides = (ridesRes.data ?? []) as Ride[];
  const expenses = expensesRes.data ?? [];

  const totalEarnings = rides.reduce((sum, r) => sum + Number(r.amount), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  return {
    totalEarnings,
    totalRides: rides.length,
    totalExpenses,
    netProfit: totalEarnings - totalExpenses,
    recentRides: rides.slice(0, RECENT_RIDES_LIMIT),
    insights: buildInsights(rides, totalEarnings),
  };
}

/** @deprecated Prefer getDashboardData — kept for compatibility */
export async function getTodayStats(): Promise<TodayStats> {
  const data = await getDashboardData();
  return {
    totalEarnings: data.totalEarnings,
    totalRides: data.totalRides,
    totalExpenses: data.totalExpenses,
    netProfit: data.netProfit,
  };
}

export async function getRides(limit = 100): Promise<Ride[]> {
  await requireUser();
  const supabase = createClient();
  const { data, error } = await supabase
    .from("rides")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as Ride[];
}

export async function getExpenses(limit = 100): Promise<Expense[]> {
  await requireUser();
  const supabase = createClient();
  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as Expense[];
}
