// ============================================
// GitTy — Marketplace Actions
// ============================================
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createMarketplaceItemAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const orgId = formData.get("orgId") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const type = formData.get("type") as string;
  const price = formData.get("price") as string;
  const isPublished = formData.get("isPublished") === "on";

  if (!title || !type) {
    throw new Error("Title and Type are required");
  }

  const priceCents = price ? Math.round(parseFloat(price)) : 0;

  const { error } = await supabase.from("marketplace_items").insert({
    creator_org_id: orgId,
    creator_id: user.id,
    title,
    description,
    type,
    price_cents: priceCents,
    is_published: isPublished,
  });

  if (error) {
    console.error("Failed to create marketplace item:", error);
    throw new Error(error.message);
  }

  revalidatePath(`/app/org/${orgId}/marketplace`);
}
