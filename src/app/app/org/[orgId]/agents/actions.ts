// ============================================
// GitTy — AI Agents Server Actions
// ============================================
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createAgentAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const orgId = formData.get("orgId") as string;
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const avatar = formData.get("avatar") as string;
  const systemPrompt = formData.get("systemPrompt") as string;
  const provider = formData.get("provider") as string;
  const temperature = parseFloat(formData.get("temperature") as string);
  const visibility = formData.get("visibility") as string;

  // Validate inputs
  if (!name || !systemPrompt) {
    throw new Error("Missing required fields");
  }

  // Insert to DB
  const { error } = await supabase.from("agents").insert({
    org_id: orgId,
    name,
    description,
    avatar: avatar || "🤖",
    system_prompt: systemPrompt,
    provider,
    temperature,
    visibility,
    created_by: user.id,
  });

  if (error) {
    console.error("Failed to create agent:", error);
    throw new Error(error.message);
  }

  revalidatePath(`/app/org/${orgId}/agents`);
  redirect(`/app/org/${orgId}/agents`);
}
