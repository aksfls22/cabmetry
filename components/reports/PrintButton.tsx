"use client";

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="rounded-lg bg-zinc-900 px-6 py-3 text-sm font-medium text-white shadow-lg transition-all hover:bg-zinc-800 hover:shadow-xl"
    >
      Guardar PDF
    </button>
  );
}
