import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { getTodayBoundsUTC } from "@/lib/datetime";

export async function saveDailyKilometers(
  kilometers: number
): Promise<void> {
  const user = await requireUser();

  const supabase = createClient();

  const { start } = getTodayBoundsUTC();

  const date = start.split("T")[0];

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
    throw error;
  }
}

export async function getTodayKilometers(): Promise<number> {
  const user = await requireUser();

  const supabase = createClient();

  const { start } = getTodayBoundsUTC();

  const date = start.split("T")[0];

  const { data, error } = await supabase
    .from("daily_metrics")
    .select("kilometers")
    .eq("user_id", user.id)
    .eq("date", date)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return Number(data?.kilometers ?? 0);
}