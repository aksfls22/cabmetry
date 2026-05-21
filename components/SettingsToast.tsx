"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

export function SettingsToast() {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      toast.success("Cambios guardados");
      
      // Limpiar el parámetro de la URL sin recargar
      const url = new URL(window.location.href);
      url.searchParams.delete("success");
      window.history.replaceState({}, "", url.toString());
    }
  }, [searchParams]);

  return null;
}
