"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

type PeriodType = "dia" | "semana" | "mes";

const periodTabs: { value: PeriodType; label: string }[] = [
  { value: "dia", label: "Día" },
  { value: "semana", label: "Semana" },
  { value: "mes", label: "Mes" },
];

export function ReportRangeTabs() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get current period type and offset
  const periodType = (searchParams.get("type") as PeriodType) ?? "dia";
  const offset = parseInt(searchParams.get("offset") ?? "0");

  const handlePeriodTypeChange = (type: PeriodType) => {
    router.push(`/reports?type=${type}&offset=0`);
  };

  const handleNavigate = (direction: "prev" | "next") => {
    const newOffset = direction === "prev" ? offset - 1 : offset + 1;
    router.push(`/reports?type=${periodType}&offset=${newOffset}`);
  };

  // Generate period label based on type and offset
  const getPeriodLabel = () => {
    const now = new Date();
    
    if (periodType === "dia") {
      const targetDate = new Date(now);
      targetDate.setDate(now.getDate() + offset);
      
      if (offset === 0) return "Hoy";
      if (offset === -1) return "Ayer";
      
      return new Intl.DateTimeFormat("es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(targetDate);
    }
    
    if (periodType === "semana") {
      if (offset === 0) return "Esta semana";
      if (offset === -1) return "Semana pasada";
      
      const weekNumber = getWeekNumber(now) + offset;
      return `Semana ${weekNumber}`;
    }
    
    if (periodType === "mes") {
      const targetDate = new Date(now);
      targetDate.setMonth(now.getMonth() + offset);
      
      if (offset === 0) return "Este mes";
      
      return new Intl.DateTimeFormat("es-ES", {
        month: "long",
        year: "numeric",
      }).format(targetDate);
    }
    
    return "";
  };

  return (
    <div className="space-y-4">
      {/* Period Type Tabs */}
      <div className="inline-flex gap-1 rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-1">
        {periodTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handlePeriodTypeChange(tab.value)}
            className={cn(
              "relative rounded-lg px-6 py-2 text-sm font-medium transition-all",
              periodType === tab.value
                ? "bg-zinc-800 text-white shadow-sm"
                : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Period Navigation */}
      <div className="flex items-center justify-between rounded-xl border border-surface-border bg-surface-raised px-4 py-3">
        {/* Quick Navigation */}
<div className="flex flex-wrap gap-2">
  {periodType === "dia" && (
    <>
      <button
        onClick={() => router.push(`/reports?type=dia&offset=0`)}
        className="rounded-lg border border-zinc-800 px-3 py-1 text-xs text-zinc-400 hover:text-white"
      >
        Hoy
      </button>

      <button
        onClick={() => router.push(`/reports?type=dia&offset=-7`)}
        className="rounded-lg border border-zinc-800 px-3 py-1 text-xs text-zinc-400 hover:text-white"
      >
        -7d
      </button>

      <button
        onClick={() => router.push(`/reports?type=dia&offset=-30`)}
        className="rounded-lg border border-zinc-800 px-3 py-1 text-xs text-zinc-400 hover:text-white"
      >
        -30d
      </button>

      <button
        onClick={() => router.push(`/reports?type=dia&offset=-90`)}
        className="rounded-lg border border-zinc-800 px-3 py-1 text-xs text-zinc-400 hover:text-white"
      >
        -90d
      </button>
    </>
  )}

  {periodType === "semana" && (
    <>
      <button
        onClick={() => router.push(`/reports?type=semana&offset=0`)}
        className="rounded-lg border border-zinc-800 px-3 py-1 text-xs text-zinc-400 hover:text-white"
      >
        Esta
      </button>

      <button
        onClick={() => router.push(`/reports?type=semana&offset=-4`)}
        className="rounded-lg border border-zinc-800 px-3 py-1 text-xs text-zinc-400 hover:text-white"
      >
        -4 sem
      </button>

      <button
        onClick={() => router.push(`/reports?type=semana&offset=-12`)}
        className="rounded-lg border border-zinc-800 px-3 py-1 text-xs text-zinc-400 hover:text-white"
      >
        -12 sem
      </button>
    </>
  )}

  {periodType === "mes" && (
    <>
      <button
        onClick={() => router.push(`/reports?type=mes&offset=0`)}
        className="rounded-lg border border-zinc-800 px-3 py-1 text-xs text-zinc-400 hover:text-white"
      >
        Este
      </button>

      <button
        onClick={() => router.push(`/reports?type=mes&offset=-3`)}
        className="rounded-lg border border-zinc-800 px-3 py-1 text-xs text-zinc-400 hover:text-white"
      >
        -3m
      </button>

      <button
        onClick={() => router.push(`/reports?type=mes&offset=-6`)}
        className="rounded-lg border border-zinc-800 px-3 py-1 text-xs text-zinc-400 hover:text-white"
      >
        -6m
      </button>

      <button
        onClick={() => router.push(`/reports?type=mes&offset=-12`)}
        className="rounded-lg border border-zinc-800 px-3 py-1 text-xs text-zinc-400 hover:text-white"
      >
        -12m
      </button>
    </>
  )}
</div>
        <button
          onClick={() => handleNavigate("prev")}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-surface-border hover:text-white"
          aria-label="Período anterior"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <div className="text-sm font-medium text-white">
          {getPeriodLabel()}
        </div>
        
        <button
          onClick={() => handleNavigate("next")}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-surface-border hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-zinc-400"
          aria-label="Período siguiente"
          disabled={offset >= 0}
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// Helper function to get ISO week number
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}
