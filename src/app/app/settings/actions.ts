"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
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

export async function deleteAccountAction() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const adminClient = createAdminClient();
  
  // Clean up dependent records that don't have ON DELETE CASCADE in the schema
  await adminClient.from("ai_logs").delete().eq("user_id", user.id);
  await adminClient.from("marketplace_purchases").delete().eq("buyer_id", user.id);
  await adminClient.from("marketplace_items").delete().eq("creator_id", user.id);
  await adminClient.from("agents").delete().eq("created_by", user.id);
  await adminClient.from("knowledge_bases").delete().eq("created_by", user.id);
  await adminClient.from("projects").delete().eq("created_by", user.id);

  // Now delete the user from auth.users (this will cascade to profiles, organizations, etc.)
  const { error } = await adminClient.auth.admin.deleteUser(user.id);
  
  if (error) {
    console.error("Supabase Admin Delete Error:", error);
    throw new Error(error.message || "Failed to delete user account");
  }

  await supabase.auth.signOut();
}
