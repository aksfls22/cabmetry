import type { ReportData } from "@/lib/reports";

/**
 * Generate CSV content from existing ReportData.
 * NO new calculations - only formats the normalized payload.
 * Uses semicolon delimiter for Excel Spanish locale compatibility.
 */
export function generateReportCSV(data: ReportData, periodLabel: string): string {
  const rows: string[] = [];

  // Header
  rows.push("Informe Cabmetry");
  rows.push(`Período;${periodLabel}`);
  rows.push(""); // Empty line

  // Financial Summary (uses existing ReportData fields)
  rows.push("RESUMEN FINANCIERO");
  rows.push("Concepto;Importe (€)");
  rows.push(`Ingresos cobrados;${data.paidIncome.toFixed(2)}`);
  rows.push(`Pendiente de cobro;${data.pendingIncome.toFixed(2)}`);
  rows.push(`Gastos operativos;${data.totalExpenses.toFixed(2)}`);
  rows.push(`Beneficio neto;${data.netProfit.toFixed(2)}`);
  rows.push(""); // Empty line

  // Operational Metrics (uses existing ReportData fields)
  rows.push("MÉTRICAS OPERACIONALES");
  rows.push("Métrica;Valor");
  rows.push(`Total de carreras;${data.totalRides}`);
  rows.push(`Kilómetros totales;${data.totalKilometers.toFixed(2)}`);
  
  // Efficiency calculation (same formula as page.tsx)
  const euroPorKm = data.totalKilometers > 0 
    ? (data.paidIncome / data.totalKilometers).toFixed(2)
    : "0.00";
  rows.push(`Eficiencia (€/km);${euroPorKm}`);

  // Add UTF-8 BOM for Excel compatibility
  return "\uFEFF" + rows.join("\n");
}

/**
 * Trigger browser download of CSV file.
 */
export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}
