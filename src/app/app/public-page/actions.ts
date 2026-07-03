// ============================================
// GitTy — Public Page Builder Actions
// ============================================
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updatePublicPageAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const isPublished = formData.get("isPublished") === "on";
  const theme = formData.get("theme") as string;
  const linksJson = formData.get("links") as string;
  const username = formData.get("username") as string;

  const links = linksJson ? JSON.parse(linksJson) : [];

  // 1. Update Profile (username)
  if (username) {
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ username })
      .eq("id", user.id);
      
    if (profileError && profileError.code === "23505") { // Unique violation
      throw new Error("Username already taken");
    } else if (profileError) {
      throw new Error(profileError.message);
    }
  }

  // 2. Update Public Page config
  const { error: pageError } = await supabase
    .from("public_pages")
    .upsert({
      user_id: user.id,
      theme,
      is_published: isPublished,
      links,
      // For MVP, we will just use basic custom sections
      custom_sections: [],
    }, { onConflict: "user_id" });

  if (pageError) {
    console.error(pageError);
    throw new Error("Failed to update public page");
  }

  revalidatePath("/app/public-page");
  revalidatePath(`/${username}`);
}
