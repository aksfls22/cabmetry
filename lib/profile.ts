import { createClient } from "@/lib/supabase/server";

export async function getProfile() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select(`
      id,
      user_id,
      display_name,
      language,
      currency,
      compensation_model,
      revenue_percentage
    `)
    .eq("user_id", user.id)
    .single();

  if (error) {
    console.error("Error loading profile:", error);
    return null;
  }

  return data;
}

export async function updateProfile({
    currency,
    compensation_model,
    revenue_percentage,
  }: {
    currency: string;
    compensation_model: string;
    revenue_percentage: number;
  }) {
    if (
        revenue_percentage < 0.01 ||
        revenue_percentage > 1
      ) {
        throw new Error(
          "Revenue percentage must be between 1% and 100%"
        );
      }
    const supabase = createClient();
  
    const {
      data: { user },
    } = await supabase.auth.getUser();
  
    if (!user) {
      throw new Error("Unauthorized");
    }
  
    const { error } = await supabase
      .from("profiles")
      .update({
        currency,
        compensation_model,
        revenue_percentage,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);
  
    if (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  
    return { success: true };
  }