"use server";

import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

/**
 * Settle a pending payment by marking it as paid.
 * Updates payment_status: pending → paid
 * NO delete/recreate, NO hacks, simple deterministic update.
 */
export async function settlePayment(paymentId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await requireUser();
    const supabase = createClient();

    // Update payment_status to paid
    const { error } = await supabase
      .from("payments")
      .update({
        payment_status: "paid",
        paid_at: new Date().toISOString(),
      })
      .eq("id", paymentId)
      .eq("user_id", user.id); // Security: only update own payments

    if (error) {
      return { success: false, error: error.message };
    }

    // Revalidate activity page for clean refetch
    revalidatePath("/activity");

    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Error al marcar como cobrado",
    };
  }
}

/**
 * Update kilometers for a specific date.
 * Reuses daily_metrics with upsert pattern.
 * Timezone-safe, maintains source-of-truth.
 */
export async function updateDailyKilometers(
  date: string, // YYYY-MM-DD
  kilometers: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await requireUser();
    const supabase = createClient();

    // Validate input
    if (kilometers < 0) {
      return { success: false, error: "Los kilómetros no pueden ser negativos" };
    }

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return { success: false, error: "Formato de fecha inválido" };
    }

    // Upsert kilometers for the date
    const { error } = await supabase
      .from("daily_metrics")
      .upsert(
        {
          user_id: user.id,
          date,
          kilometers,
        },
        {
          onConflict: "user_id,date",
        }
      );

    if (error) {
      return { success: false, error: error.message };
    }

    // Revalidate activity page for clean refetch
    revalidatePath("/activity");

    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Error al actualizar kilómetros",
    };
  }
}
