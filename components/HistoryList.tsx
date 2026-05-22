"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { FormattedDateTime } from "@/components/FormattedDateTime";
import { formatCurrency, paymentLabel } from "@/lib/utils";
import type { Expense, Ride } from "@/lib/types";
import { es } from "@/lib/i18n/es";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface RideHistoryProps {
  rides: Ride[];
}

interface ExpenseHistoryProps {
  expenses: Expense[];
}

export function RideHistoryList({ rides }: RideHistoryProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    
    setDeletingId(id);
    const supabase = createClient();
    const { error } = await supabase
  .from("rides")
  .delete()
  .eq("id", id);

setDeletingId(null);

if (error) {
  toast.error("No pudimos eliminar la carrera.");
  return;
}

toast.success("Carrera eliminada.");

router.refresh();
  }

  if (rides.length === 0) {
    return (
      <EmptyState
        message={es.rides.empty}
        href="/"
        actionLabel="Registrar primera carrera"
      />
    );
  }

  return (
    <ul className="space-y-3">
      {rides.map((ride) => (
        <li
          key={ride.id}
          className="flex items-center gap-3 rounded-2xl border border-surface-border bg-surface-raised p-4 shadow-card"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-profit/15 text-profit">
            <span className="text-lg font-bold">+</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-lg font-bold tabular-nums text-white">
              {formatCurrency(Number(ride.amount))}
            </p>
            <p className="text-sm text-zinc-400">
              {paymentLabel(ride.payment_method)} ·{" "}
              <FormattedDateTime iso={ride.created_at} />
            </p>
            {ride.notes && (
              <p className="mt-1 truncate text-sm text-zinc-500">{ride.notes}</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => handleDelete(ride.id)}
            disabled={deletingId === ride.id}
            className="touch-target shrink-0 rounded-xl px-3 text-sm text-zinc-500 hover:bg-expense/10 hover:text-expense"
            aria-label={es.rides.deleteAria}
          >
            {deletingId === ride.id ? "…" : "✕"}
          </button>
        </li>
      ))}
    </ul>
  );
}

export function ExpenseHistoryList({ expenses }: ExpenseHistoryProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
   
    setDeletingId(id);
    const supabase = createClient();
    const { error } = await supabase
  .from("expenses")
  .delete()
  .eq("id", id);

setDeletingId(null);

if (error) {
  toast.error("No pudimos eliminar el gasto.");
  return;
}

toast.success("Gasto eliminado.");

router.refresh();
  }

  if (expenses.length === 0) {
    return (
      <EmptyState
        message={es.expenses.empty}
        href="/expenses/new"
        actionLabel="Registrar primer gasto"
      />
    );
  }

  return (
    <ul className="space-y-3">
      {expenses.map((expense) => (
        <li
          key={expense.id}
          className="flex items-center gap-3 rounded-2xl border border-surface-border bg-surface-raised p-4 shadow-card"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-expense/15 text-expense">
            <span className="text-lg font-bold">−</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-white">{expense.category}</p>
            <p className="text-lg font-bold tabular-nums text-expense">
              −{formatCurrency(Number(expense.amount))}
            </p>
            <p className="text-sm text-zinc-400">
              <FormattedDateTime iso={expense.created_at} />
            </p>
            {expense.notes && (
              <p className="mt-1 truncate text-sm text-zinc-500">{expense.notes}</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => handleDelete(expense.id)}
            disabled={deletingId === expense.id}
            className="touch-target shrink-0 rounded-xl px-3 text-sm text-zinc-500 hover:bg-expense/10 hover:text-expense"
            aria-label={es.expenses.deleteAria}
          >
            {deletingId === expense.id ? "…" : "✕"}
          </button>
        </li>
      ))}
    </ul>
  );
}

function EmptyState({
  message,
  href,
  actionLabel,
}: {
  message: string;
  href: string;
  actionLabel: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-surface-border py-16 text-center">
      <p className="text-zinc-500">{message}</p>

      <Link
        href={href}
        className="mt-4 inline-flex text-sm font-medium text-accent hover:text-accent/90"
      >
        {actionLabel}
      </Link>
    </div>
  );
}
