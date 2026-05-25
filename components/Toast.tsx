"use client";

import { useEffect } from "react";
import { Check } from "lucide-react";

interface ToastProps {
  message: string;
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, onClose, duration = 2000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-profit/20 border border-profit/30 text-profit shadow-lg backdrop-blur-sm">
        <Check className="h-4 w-4" />
        <p className="text-sm font-medium">{message}</p>
      </div>
    </div>
  );
}
