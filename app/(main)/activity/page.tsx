import { PageHeader } from "@/components/PageHeader";
import { getRides, getExpenses } from "@/lib/queries";
import { formatCurrency } from "@/lib/utils";
import { FormattedDateTime } from "@/components/FormattedDateTime";
import { CarTaxiFront, WalletCards } from "lucide-react";

type ActivityItem = {
  id: string;
  type: "ride" | "expense";
  amount: number;
  description: string;
  timestamp: string;
};

const ACTIVITY_LIMIT = 20;

export default async function ActivityPage() {
  let activityItems: ActivityItem[] = [];
  let error: string | null = null;

  try {
    // Fetch recent rides and expenses
    const [rides, expenses] = await Promise.all([
      getRides(ACTIVITY_LIMIT),
      getExpenses(ACTIVITY_LIMIT),
    ]);

    // Map rides to activity items
    const rideItems: ActivityItem[] = rides.map((ride) => ({
      id: ride.id,
      type: "ride" as const,
      amount: ride.amount,
      description: ride.payment_method,
      timestamp: ride.created_at,
    }));

    // Map expenses to activity items
    const expenseItems: ActivityItem[] = expenses.map((expense) => ({
      id: expense.id,
      type: "expense" as const,
      amount: expense.amount,
      description: expense.category,
      timestamp: expense.created_at,
    }));

    // Merge and sort by timestamp (most recent first)
    activityItems = [...rideItems, ...expenseItems]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, ACTIVITY_LIMIT);
  } catch (e) {
    error = e instanceof Error ? e.message : "Error al cargar la actividad";
  }

  return (
    <>
      <PageHeader
        title="Actividad"
        subtitle="Historial completo de carreras y gastos"
      />

      {error ? (
        <div className="mb-6 rounded-2xl border border-expense/30 bg-expense/10 p-4 text-sm text-expense">
          <p className="font-medium">Error al cargar</p>
          <p className="mt-1 text-expense/80">{error}</p>
        </div>
      ) : activityItems.length === 0 ? (
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="text-center">
            <p className="text-sm text-zinc-500">No hay actividad registrada</p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {activityItems.map((item) => (
            <ActivityCard key={`${item.type}-${item.id}`} item={item} />
          ))}
        </div>
      )}
    </>
  );
}

function ActivityCard({ item }: { item: ActivityItem }) {
  const isRide = item.type === "ride";

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-surface-border bg-surface-raised/80 p-4">
      {/* Icon */}
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
          isRide ? "bg-profit/10 text-profit" : "bg-expense/10 text-expense"
        }`}
      >
        {isRide ? (
          <CarTaxiFront className="h-5 w-5" strokeWidth={2} />
        ) : (
          <WalletCards className="h-5 w-5" strokeWidth={2} />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-zinc-300 capitalize">
          {item.description}
        </p>
        <p className="text-xs text-zinc-500">
          <FormattedDateTime iso={item.timestamp} />
        </p>
      </div>

      {/* Amount */}
      <div className="text-right">
        <p
          className={`text-base font-bold tabular-nums ${
            isRide ? "text-profit" : "text-expense"
          }`}
        >
          {isRide ? "+" : "-"}
          {formatCurrency(item.amount)}
        </p>
      </div>
    </div>
  );
}
