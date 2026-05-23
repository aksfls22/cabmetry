"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

type RangeTab = "hoy" | "semana" | "mes";

const tabs: { value: RangeTab; label: string }[] = [
  { value: "hoy", label: "Hoy" },
  { value: "semana", label: "Semana" },
  { value: "mes", label: "Mes" },
];

export function ReportRangeTabs() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = (searchParams.get("period") as RangeTab) ?? "hoy";

  const handleTabChange = (period: RangeTab) => {
    router.push(`/reports?period=${period}`);
  };

  return (
    <div className="inline-flex gap-1 rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-1">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => handleTabChange(tab.value)}
          className={cn(
            "relative px-6 py-2 text-sm font-medium transition-all rounded-lg",
            activeTab === tab.value
              ? "text-white bg-zinc-800 shadow-sm"
              : "text-zinc-500 hover:text-zinc-300"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
