"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { es } from "@/lib/i18n/es";
import { translateDbError } from "@/lib/i18n/translate-auth-error";
import { EXPENSE_CATEGORIES } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { cn } from "@/lib/utils";

export function ExpenseForm() {
  const router = useRouter();
  const amountRef = useRef<HTMLInputElement>(null);
  const [category, setCategory] = useState<string>(EXPENSE_CATEGORIES[0]);
  const [customCategory, setCustomCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isOther = category === "Otros";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = parseFloat(amount.replace(",", "."));
    if (Number.isNaN(parsed) || parsed <= 0) {
      setError(es.expenses.invalidAmount);
      amountRef.current?.focus();
      return;
    }

    const finalCategory = isOther ? customCategory.trim() : category;
    if (!finalCategory) {
      setError(es.expenses.categoryRequired);
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      setError(es.auth.loginRequiredExpense);
      return;
    }

    const { error: insertError } = await supabase.from("expenses").insert({
      user_id: user.id,
      category: finalCategory,
      amount: parsed,
      notes: notes.trim() || null,
    });

    setLoading(false);

    if (insertError) {
      setError(translateDbError(insertError.message));
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-medium text-zinc-300">{es.expenses.category}</p>
        <div className="flex flex-wrap gap-2">
          {EXPENSE_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={cn(
                "touch-target rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors",
                category === cat
                  ? "border-accent bg-accent/15 text-accent"
                  : "border-surface-border bg-surface-raised text-zinc-400 hover:text-zinc-200"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {isOther && (
        <Input
          label={es.expenses.customCategory}
          placeholder={es.expenses.customPlaceholder}
          value={customCategory}
          onChange={(e) => setCustomCategory(e.target.value)}
          required
        />
      )}

      <Input
        ref={amountRef}
        label={es.expenses.amount}
        type="text"
        inputMode="decimal"
        placeholder={es.expenses.amountPlaceholder}
        autoComplete="off"
        autoFocus={!isOther}
        required
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="text-3xl font-bold text-center tabular-nums"
      />

      <Textarea
        label={es.expenses.notes}
        placeholder={es.expenses.notesPlaceholder}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      {error && (
        <p className="rounded-xl bg-expense/10 px-4 py-3 text-sm text-expense" role="alert">
          {error}
        </p>
      )}

      <Button type="submit" disabled={loading}>
        {loading ? es.expenses.saving : es.expenses.save}
      </Button>
    </form>
  );
}
