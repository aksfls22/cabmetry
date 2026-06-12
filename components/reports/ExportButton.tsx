"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { generateReportCSV, downloadCSV } from "@/lib/export-csv";
import type { ReportData } from "@/lib/reports";

interface ExportButtonProps {
  data: ReportData;
  period: string;
}

export function ExportButton({ data, period }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    setIsExporting(true);
    
    try {
      // Generate CSV from existing ReportData (no new queries)
      const csvContent = generateReportCSV(data, data.periodLabel);
      
      // Generate filename with period
      const timestamp = new Date().toISOString().split("T")[0];
      const filename = `cabmetry-informe-${period}-${timestamp}.csv`;
      
      // Trigger download
      downloadCSV(csvContent, filename);
    } catch (error) {
      console.error("Error exporting report:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      type="button"
      variant="secondary"
      onClick={handleExport}
      disabled={isExporting}
      fullWidth={true}
      className="gap-2"
    >
      <svg
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      {isExporting ? "Exportando..." : "Exportar CSV"}
    </Button>
  );
}
