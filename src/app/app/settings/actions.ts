"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProfileAvatarAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const avatar_url = formData.get("avatar_url") as string;

  if (avatar_url !== null) {
    const { error } = await supabase
      .from("profiles")
      .update({ avatar_url })
      .eq("id", user.id);

    if (error) {
      console.error(error);
      throw new Error("Failed to update profile picture");
    }
  }

  revalidatePath("/app/settings");
  revalidatePath("/app/orgs");
}
