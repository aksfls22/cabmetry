import { PageHeader } from "@/components/PageHeader";
import { ExpenseHistoryList } from "@/components/HistoryList";
import { es } from "@/lib/i18n/es";
import { getExpenses } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function ExpensesHistoryPage() {
  let expenses: Awaited<ReturnType<typeof getExpenses>> = [];
  let error: string | null = null;

  try {
    expenses = await getExpenses();
  } catch (e) {
    error = e instanceof Error ? e.message : es.expenses.loadError;
  }

  return (
    <>
      <PageHeader
        title={es.expenses.historyTitle}
        subtitle={es.dashboard.records(expenses.length)}
      />
      {error ? (
        <p className="text-expense text-sm">{error}</p>
      ) : (
        <ExpenseHistoryList expenses={expenses} />
      )}
    </>
  );
}
