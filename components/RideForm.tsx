"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { es } from "@/lib/i18n/es";
import { translateDbError } from "@/lib/i18n/translate-auth-error";
import { PAYMENT_METHODS, type PaymentMethod } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";

const QUICK_AMOUNTS = [5, 10, 15, 20, 25, 30, 40, 50];

export function RideForm() {
  const router = useRouter();
  const amountRef = useRef<HTMLInputElement>(null);
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
  
    setError(null);
  
    const parsed = parseFloat(amount.replace(",", "."));
  
    if (Number.isNaN(parsed) || parsed <= 0) {
      setError(es.rides.invalidAmount);
      amountRef.current?.focus();
      return;
    }
  
    setLoading(true);
  
    const supabase = createClient();
  
    const {
      data: { user },
    } = await supabase.auth.getUser();
  
    if (!user) {
      setLoading(false);
      setError(es.auth.loginRequiredRide);
      return;
    }
  
    // =========================
    // CREATE RIDE
    // =========================
  
    const { data: ride, error: rideError } = await supabase
      .from("rides")
      .insert({
        user_id: user.id,
        amount: parsed,
        payment_method: paymentMethod,
        notes: notes.trim() || null,
      })
      .select()
      .single();
  
    if (rideError || !ride) {
      setLoading(false);
  
      setError(
        translateDbError(
          rideError?.message || "Failed to create ride"
        )
      );
  
      return;
    }
  
    // =========================
    // PAYMENT LOGIC
    // =========================
  
    const isVoucher = paymentMethod === "voucher";
  
    const dueDate = new Date();
  
    dueDate.setDate(dueDate.getDate() + 30);
  
    const { error: paymentError } = await supabase
      .from("payments")
      .insert({
        ride_id: ride.id,
  
        user_id: user.id,
  
        payment_type: paymentMethod,
  
        payment_status: isVoucher
          ? "pending"
          : "paid",
  
        amount: parsed,
  
        due_date: isVoucher
          ? dueDate.toISOString()
          : null,
  
        paid_at: isVoucher
          ? null
          : new Date().toISOString(),
      });
  
    // =========================
    // ROLLBACK
    // =========================
  
    if (paymentError) {
      await supabase
        .from("rides")
        .delete()
        .eq("id", ride.id);
  
      setLoading(false);
  
      setError(
        translateDbError(paymentError.message)
      );
  
      return;
    }
  
    setLoading(false);
  
    router.push("/");
  
    router.refresh();
  }
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        ref={amountRef}
        label={es.rides.amount}
        type="text"
        inputMode="decimal"
        placeholder={es.rides.amountPlaceholder}
        autoComplete="off"
        autoFocus
        required
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="text-3xl font-bold text-center tabular-nums"
      />

      <div className="grid grid-cols-4 gap-2">
        {QUICK_AMOUNTS.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => setAmount(String(q))}
            className="touch-target rounded-xl border border-surface-border bg-surface-raised py-3 text-sm font-semibold text-zinc-300 transition-colors hover:border-accent/50 hover:text-accent active:scale-95"
          >
            {q}€
          </button>
        ))}
      </div>

      <Select
        label={es.rides.paymentMethod}
        value={paymentMethod}
        onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
        options={PAYMENT_METHODS}
      />

      <Textarea
        label={es.rides.notes}
        placeholder={es.rides.notesPlaceholder}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      {error && (
        <p className="rounded-xl bg-expense/10 px-4 py-3 text-sm text-expense" role="alert">
          {error}
        </p>
      )}

      <Button type="submit" disabled={loading}>
        {loading ? es.rides.saving : es.rides.save}
      </Button>
    </form>
  );
}
