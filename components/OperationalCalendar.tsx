"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Check, Edit2 } from "lucide-react";
import type { DaySummary } from "@/lib/calendar-summary";
import { formatCurrency } from "@/lib/utils";
import { settlePayment, updateDailyKilometers } from "@/lib/activity-actions";
import { Toast } from "@/components/Toast";

interface OperationalCalendarProps {
  initialYear: number;
  initialMonth: number;
  days: DaySummary[];
}

const WEEKDAYS = ["L", "M", "X", "J", "V", "S", "D"];
const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

export function OperationalCalendar({ initialYear, initialMonth, days }: OperationalCalendarProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedDay, setSelectedDay] = useState<DaySummary | null>(null);
  const [currentYear, setCurrentYear] = useState(initialYear);
  const [currentMonth, setCurrentMonth] = useState(initialMonth);
  
  // Kilometers editing state
  const [isEditingKm, setIsEditingKm] = useState(false);
  const [kmValue, setKmValue] = useState("");
  const [kmError, setKmError] = useState<string | null>(null);
  const [isSavingKm, setIsSavingKm] = useState(false);
  
  // Settlement state
  const [settlingPaymentId, setSettlingPaymentId] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Get first day of month (0 = Sunday, 1 = Monday, ...)
  const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1).getDay();
  // Convert to Monday-based (0 = Monday, 6 = Sunday)
  const firstDayOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  // Create calendar grid
  const calendarDays: (DaySummary | null)[] = [
    ...Array(firstDayOffset).fill(null),
    ...days,
  ];

  const navigateMonth = (direction: "prev" | "next") => {
    let newYear = currentYear;
    let newMonth = currentMonth;

    if (direction === "prev") {
      if (currentMonth === 1) {
        newMonth = 12;
        newYear = currentYear - 1;
      } else {
        newMonth = currentMonth - 1;
      }
    } else {
      if (currentMonth === 12) {
        newMonth = 1;
        newYear = currentYear + 1;
      } else {
        newMonth = currentMonth + 1;
      }
    }

    setCurrentYear(newYear);
    setCurrentMonth(newMonth);
    setSelectedDay(null);

    // Navigate to new URL with query params
    startTransition(() => {
      router.push(`/activity?year=${newYear}&month=${newMonth}`);
    });
  };

  const getDayStyle = (day: DaySummary) => {
    if (!day.hasActivity) {
      return "bg-surface-raised/40 text-zinc-600";
    }
    if (day.hasPending) {
      return "bg-amber-500/15 text-amber-400 font-semibold";
    }
    return "bg-blue-500/15 text-blue-400 font-semibold";
  };

  const efficiency = selectedDay && selectedDay.kilometers > 0
    ? selectedDay.paidIncome / selectedDay.kilometers
    : 0;

  // Handle settlement of pending payment
  const handleSettlePayment = async (paymentId: string) => {
    setSettlingPaymentId(paymentId);
    const result = await settlePayment(paymentId);
    
    if (result.success) {
      // Show success toast
      setToastMessage("Vale marcado como cobrado");
      setShowToast(true);
      
      // Refresh the page to get updated data (clean refetch)
      router.refresh();
    } else {
      alert(result.error || "Error al marcar como cobrado");
      setSettlingPaymentId(null);
    }
  };

  // Handle kilometers edit
  const handleEditKm = () => {
    if (selectedDay) {
      setKmValue(selectedDay.kilometers > 0 ? selectedDay.kilometers.toString() : "");
      setIsEditingKm(true);
      setKmError(null);
    }
  };

  const handleSaveKm = async () => {
    if (!selectedDay) return;
    
    const parsed = parseFloat(kmValue.replace(",", "."));
    
    if (isNaN(parsed) || parsed < 0) {
      setKmError("Valor inválido");
      return;
    }
    
    setIsSavingKm(true);
    const result = await updateDailyKilometers(selectedDay.date, parsed);
    
    if (result.success) {
      // Show success toast
      setToastMessage("Kilómetros actualizados");
      setShowToast(true);
      
      setIsEditingKm(false);
      setKmError(null);
      
      // Refresh the page to get updated data (clean refetch)
      router.refresh();
    } else {
      setKmError(result.error || "Error al guardar");
      setIsSavingKm(false);
    }
  };

  const handleCancelKmEdit = () => {
    setIsEditingKm(false);
    setKmValue("");
    setKmError(null);
  };

  return (
    <div className="space-y-4">
      {/* Month Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-zinc-100">
          {MONTH_NAMES[currentMonth - 1]} {currentYear}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => navigateMonth("prev")}
            disabled={isPending}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-raised border border-surface-border text-zinc-400 hover:text-zinc-200 transition-colors disabled:opacity-50"
            aria-label="Mes anterior"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => navigateMonth("next")}
            disabled={isPending}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-raised border border-surface-border text-zinc-400 hover:text-zinc-200 transition-colors disabled:opacity-50"
            aria-label="Mes siguiente"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-2">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="flex h-8 items-center justify-center text-xs font-medium text-zinc-500"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map((day, index) => (
          <button
            key={index}
            onClick={() => day && setSelectedDay(day)}
            disabled={!day}
            className={`
              flex h-12 items-center justify-center rounded-xl text-sm transition-all
              ${day ? getDayStyle(day) : ""}
              ${day && day.hasActivity ? "hover:scale-105 active:scale-95" : ""}
              ${selectedDay?.date === day?.date ? "ring-2 ring-blue-400" : ""}
              ${!day ? "invisible" : ""}
            `}
          >
            {day && new Date(day.date).getDate()}
          </button>
        ))}
      </div>

      {/* Day Detail Panel - FIXED LAYOUT */}
      {selectedDay && selectedDay.hasActivity && (
        <div className="rounded-2xl border border-surface-border bg-surface-raised/80 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-300">
              {new Date(selectedDay.date).toLocaleDateString("es-ES", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </h3>
            <button
              onClick={() => setSelectedDay(null)}
              className="text-xs text-zinc-500 hover:text-zinc-300"
            >
              Cerrar
            </button>
          </div>

          {/* FIXED GRID - Always shows same 4 fields */}
          <div className="grid grid-cols-2 gap-3">
            {/* Cobrado - Always visible */}
            <div className="rounded-xl bg-profit/10 p-3">
              <p className="text-xs text-zinc-500">Cobrado</p>
              <p className="text-lg font-bold text-profit tabular-nums">
                {formatCurrency(selectedDay.paidIncome)}
              </p>
            </div>

            {/* Pendiente - Always visible */}
            <div className={`rounded-xl p-3 ${selectedDay.pendingIncome > 0 ? 'bg-amber-500/10' : 'bg-surface-raised'}`}>
              <p className="text-xs text-zinc-500">Pendiente</p>
              <p className={`text-lg font-bold tabular-nums ${selectedDay.pendingIncome > 0 ? 'text-amber-400' : 'text-zinc-600'}`}>
                {formatCurrency(selectedDay.pendingIncome)}
              </p>
            </div>

            {/* Carreras - Always visible */}
            <div className="rounded-xl bg-surface-raised p-3">
              <p className="text-xs text-zinc-500">Carreras</p>
              <p className="text-lg font-bold text-zinc-300 tabular-nums">
                {selectedDay.ridesCount}
              </p>
            </div>

            {/* Kilómetros - Always visible with edit */}
            <div className="rounded-xl bg-surface-raised p-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-zinc-500">Kilómetros</p>
                {!isEditingKm && (
                  <button
                    onClick={handleEditKm}
                    className="text-zinc-500 hover:text-zinc-300 transition-colors"
                    aria-label="Editar kilómetros"
                  >
                    <Edit2 className="h-3 w-3" />
                  </button>
                )}
              </div>
              {isEditingKm ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={kmValue}
                    onChange={(e) => setKmValue(e.target.value)}
                    className="w-full px-2 py-1 text-sm bg-surface border border-surface-border rounded-lg text-zinc-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="0"
                    autoFocus
                  />
                  {kmError && (
                    <p className="text-xs text-expense">{kmError}</p>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveKm}
                      disabled={isSavingKm}
                      className="flex-1 px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors disabled:opacity-50"
                    >
                      {isSavingKm ? "Guardando..." : "Guardar"}
                    </button>
                    <button
                      onClick={handleCancelKmEdit}
                      disabled={isSavingKm}
                      className="flex-1 px-2 py-1 text-xs bg-surface-raised text-zinc-500 rounded-lg hover:text-zinc-300 transition-colors disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <p className={`text-lg font-bold tabular-nums ${selectedDay.kilometers > 0 ? 'text-zinc-300' : 'text-zinc-600'}`}>
                  {selectedDay.kilometers > 0 ? `${selectedDay.kilometers.toFixed(1)} km` : '0 km'}
                </p>
              )}
            </div>
          </div>

          {/* Pending Payments Settlement */}
          {selectedDay.pendingPayments.length > 0 && (
            <div className="pt-2 border-t border-surface-border">
              <p className="text-xs font-medium text-zinc-400 mb-2">
                Pendientes ({selectedDay.pendingPayments.length})
              </p>
              <div className="space-y-2">
                {selectedDay.pendingPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-amber-500/5 border border-amber-500/20"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-zinc-300 capitalize">
                        {payment.payment_type === "voucher" ? "Vale" : payment.payment_type}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {formatCurrency(payment.amount)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleSettlePayment(payment.id)}
                      disabled={settlingPaymentId === payment.id}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-profit/20 text-profit rounded-lg hover:bg-profit/30 transition-colors disabled:opacity-50"
                    >
                      {settlingPaymentId === payment.id ? (
                        "..."
                      ) : (
                        <>
                          <Check className="h-3 w-3" />
                          Marcar cobrado
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 text-xs text-zinc-500">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-blue-500/15" />
          <span>Cerrado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-amber-500/15" />
          <span>Pendiente</span>
        </div>
      </div>

      {/* Success Toast */}
      {showToast && (
        <Toast
          message={toastMessage}
          onClose={() => {
            setShowToast(false);
            setSettlingPaymentId(null);
          }}
        />
      )}
    </div>
  );
}
