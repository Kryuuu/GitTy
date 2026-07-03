// ============================================
// GitTy Hub — Builder Server Actions
// ============================================
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateHubSettingsAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const isPublished = formData.get("isPublished") === "on";
  const theme = formData.get("theme") as string;
  const username = formData.get("username") as string;
  const avatar_url = formData.get("avatar_url") as string;
  const linksJson = formData.get("links") as string;
  const layoutConfigJson = formData.get("layout_config") as string;
  
  const links = linksJson ? JSON.parse(linksJson) : [];
  const layout_config = layoutConfigJson ? JSON.parse(layoutConfigJson) : { alignment: "center", card_style: "glass" };

  if (username || avatar_url !== undefined) {
    const updateData: any = {};
    if (username) updateData.username = username;
    if (avatar_url !== null) updateData.avatar_url = avatar_url;

    const { error: profileError } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", user.id);
      
    if (profileError && profileError.code === "23505") {
      throw new Error("Username already taken");
    } else if (profileError) {
      throw new Error(profileError.message);
    }
  }

  const { error: pageError } = await supabase
    .from("public_pages")
    .upsert({
      user_id: user.id,
      theme,
      is_published: isPublished,
      links,
      layout_config,
    }, { onConflict: "user_id" });

  if (pageError) {
    console.error(pageError);
    throw new Error("Failed to update Hub settings");
  }

  revalidatePath("/app/hub");
  revalidatePath(`/${username}`);
}
