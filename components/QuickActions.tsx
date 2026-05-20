"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { es } from "@/lib/i18n/es";

export function QuickActions() {
  const router = useRouter();

  const [kilometers, setKilometers] = useState("");

  const [isSaving, setIsSaving] = useState(false);

  async function handleSaveKilometers() {
    try {
      setIsSaving(true);

      const response = await fetch("/api/daily-metrics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          kilometers: Number(kilometers),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save kilometers");
      }

      setKilometers("");

      router.refresh();
    } catch (error) {
      console.error(error);

      alert("No se pudieron guardar los kilómetros.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      {/* Floating Action Button */}
      <Link
        href="/rides/new"
        className="
          fixed bottom-24 right-5 z-50
          flex h-16 w-16 items-center justify-center
          rounded-full
          bg-yellow-400
          text-black
          shadow-2xl
          transition-all
          active:scale-95
        "
      >
        <span className="text-4xl leading-none">+</span>
      </Link>

      <div className="mb-4 rounded-2xl border border-surface-border bg-surface-raised/80 p-4 shadow-card">
  <p className="mb-3 text-sm font-semibold text-zinc-200">
    Kilómetros hoy
  </p>

  <div className="flex gap-2">
    <input
      type="number"
      inputMode="decimal"
      min="0"
      placeholder="Ej: 180"
      value={kilometers}
      onChange={(e) => setKilometers(e.target.value)}
      className="
        flex-1 rounded-xl border border-surface-border
        bg-zinc-900 px-4 py-3 text-zinc-100
        outline-none transition-all
        focus:border-yellow-400
      "
    />

    <button
      type="button"
      onClick={handleSaveKilometers}
      disabled={isSaving || !kilometers}
      className="
        rounded-xl bg-yellow-400 px-4 py-3
        font-medium text-black transition-all
        disabled:opacity-50
      "
    >
      {isSaving ? "..." : "Guardar"}
    </button>
  </div>
</div>
      {/* Secondary Action */}
      <div className="mb-6">
        <Link
          href="/expenses/new"
          className="
            touch-target
            flex w-full items-center justify-center gap-2
            rounded-2xl
            border border-red-500/20
            bg-red-500/10
            px-5 py-4
            text-red-300
            transition-all
            active:scale-[0.98]
          "
        >
          <span className="text-lg leading-none">−</span>
          <span>{es.dashboard.newExpense}</span>
        </Link>
      </div>
    </>
  );
}