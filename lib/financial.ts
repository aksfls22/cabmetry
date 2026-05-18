import { createClient } from "@/lib/supabase/server";

export interface DashboardFinancialSummary {
  paidIncome: number;
  pendingIncome: number;
  totalExpenses: number;
  netProfit: number;
  totalRides: number;
}

export async function getDashboardFinancialSummary(): Promise<DashboardFinancialSummary> {
  const supabase = createClient();

  const today = new Date();

  today.setHours(0, 0, 0, 0);

  const todayIso = today.toISOString();

  // =========================
  // PAYMENTS
  // =========================

  const { data: payments, error: paymentsError } = await supabase
    .from("payments")
    .select("*")
    .gte("created_at", todayIso);

  if (paymentsError) {
    throw paymentsError;
  }

  // =========================
  // EXPENSES
  // =========================

  const { data: expenses, error: expensesError } = await supabase
    .from("expenses")
    .select("*")
    .gte("created_at", todayIso);

  if (expensesError) {
    throw expensesError;
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

  const totalRides = (payments ?? []).length;

  const netProfit = paidIncome - totalExpenses;

  return {
    paidIncome,
    pendingIncome,
    totalExpenses,
    netProfit,
    totalRides,
  };
}