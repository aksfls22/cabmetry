import { createClient } from "@/lib/supabase/server";
import { getTodayBoundsUTC } from "@/lib/datetime";

export interface DashboardFinancialSummary {
  paidIncome: number;
  pendingIncome: number;
  totalExpenses: number;
  netProfit: number;
  totalRides: number;
}

export async function getDashboardFinancialSummary(): Promise<DashboardFinancialSummary> {
  const supabase = createClient();

  const { start, end } = getTodayBoundsUTC();

  // =========================
  // PAYMENTS
  // =========================

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

  const { data: expenses, error: expensesError } = await supabase
  .from("expenses")
  .select("amount, created_at")
  .gte("created_at", start)
  .lt("created_at", end);

  if (expensesError) {
    throw expensesError;
  }
// =========================
// RIDES
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
  // CALCULATIONS
  // =========================

  const paidIncome = (payments ?? [])
    .filter((p) => p.payment_status === "paid")
    .reduce((sum, p) => sum + Number(p.amount ?? 0), 0);

  const pendingIncome = (payments ?? [])
    .filter((p) => p.payment_status === "pending")
    .reduce((sum, p) => sum + Number(p.amount ?? 0), 0);

  const totalExpenses = (expenses ?? [])
  .reduce((sum, e) => sum + Number(e.amount ?? 0), 0);

 
  const netProfit = paidIncome - totalExpenses;

  return {
    paidIncome,
    pendingIncome,
    totalExpenses,
    netProfit,
    totalRides: totalRides ?? 0,
  };
}