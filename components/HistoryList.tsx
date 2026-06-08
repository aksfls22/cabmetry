"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
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
  const [collapsedDates, setCollapsedDates] = useState<Set<string>>(new Set());

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

  const groupedByDate = useMemo(() => {
    const groups = new Map<string, Ride[]>();
    
    rides.forEach((ride) => {
      const date = new Date(ride.created_at);
      const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      
      if (!groups.has(dateKey)) {
        groups.set(dateKey, []);
      }
      groups.get(dateKey)!.push(ride);
    });
    
    return Array.from(groups.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [rides]);

  function toggleDate(dateKey: string) {
    setCollapsedDates((prev) => {
      const next = new Set(prev);
      if (next.has(dateKey)) {
        next.delete(dateKey);
      } else {
        next.add(dateKey);
      }
      return next;
    });
  }

  function formatDateHeader(dateKey: string): string {
    const [year, month, day] = dateKey.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const monthNames = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    return `${day} ${monthNames[month - 1]} ${year}`;
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
    <div className="space-y-4">
      {groupedByDate.map(([dateKey, dateRides], index) => {
        const isExpanded = index === 0 ? !collapsedDates.has(dateKey) : collapsedDates.has(dateKey);
        
        return (
          <div key={dateKey}>
            <button
              onClick={() => toggleDate(dateKey)}
              className="mb-3 flex w-full items-center gap-2 text-left"
            >
              <span className="text-zinc-400">
                {isExpanded ? '▼' : '▶'}
              </span>
              <span className="font-semibold text-white">
                {formatDateHeader(dateKey)}
              </span>
              <span className="text-sm text-zinc-500">
                {dateRides.length} {dateRides.length === 1 ? 'carrera' : 'carreras'}
              </span>
            </button>
            
            {isExpanded && (
              <ul className="space-y-3">
                {dateRides.map((ride) => (
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
            )}
          </div>
        );
      })}
    </div>
  );
}

export function ExpenseHistoryList({ expenses }: ExpenseHistoryProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [collapsedDates, setCollapsedDates] = useState<Set<string>>(new Set());

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

  const groupedByDate = useMemo(() => {
    const groups = new Map<string, Expense[]>();
    
    expenses.forEach((expense) => {
      const date = new Date(expense.created_at);
      const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      
      if (!groups.has(dateKey)) {
        groups.set(dateKey, []);
      }
      groups.get(dateKey)!.push(expense);
    });
    
    return Array.from(groups.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [expenses]);

  function toggleDate(dateKey: string) {
    setCollapsedDates((prev) => {
      const next = new Set(prev);
      if (next.has(dateKey)) {
        next.delete(dateKey);
      } else {
        next.add(dateKey);
      }
      return next;
    });
  }

  function formatDateHeader(dateKey: string): string {
    const [year, month, day] = dateKey.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const monthNames = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    return `${day} ${monthNames[month - 1]} ${year}`;
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
    <div className="space-y-4">
      {groupedByDate.map(([dateKey, dateExpenses], index) => {
        const isExpanded = index === 0 ? !collapsedDates.has(dateKey) : collapsedDates.has(dateKey);
        
        return (
          <div key={dateKey}>
            <button
              onClick={() => toggleDate(dateKey)}
              className="mb-3 flex w-full items-center gap-2 text-left"
            >
              <span className="text-zinc-400">
                {isExpanded ? '▼' : '▶'}
              </span>
              <span className="font-semibold text-white">
                {formatDateHeader(dateKey)}
              </span>
              <span className="text-sm text-zinc-500">
                {dateExpenses.length} {dateExpenses.length === 1 ? 'gasto' : 'gastos'}
              </span>
            </button>
            
            {isExpanded && (
              <ul className="space-y-3">
                {dateExpenses.map((expense) => (
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
            )}
          </div>
        );
      })}
    </div>
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
