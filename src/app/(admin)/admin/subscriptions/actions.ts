"use server";

import { requireAdminPermission, logAdminAction } from "@/lib/admin/auth";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function overrideSubscriptionPlan(formData: FormData) {
  const admin = await requireAdminPermission("settings.update"); // Super admin required to give free subscriptions
  const supabase = await createClient();

  const subId = formData.get("sub_id") as string;
  const newPlan = formData.get("plan") as string;
  const orgId = formData.get("org_id") as string;
  const expiresAt = formData.get("expires_at") as string;

  // Determine usage limit based on plan
  let newLimit = 1000;
  if (newPlan === "pro") newLimit = 10000;
  else if (newPlan === "team") newLimit = 50000;
  else if (newPlan === "enterprise") newLimit = 999999;

  const { error } = await supabase
    .from("subscriptions")
    .update({
      plan: newPlan,
      status: "active",
      usage_limit: newLimit,
      current_period_end: expiresAt ? new Date(expiresAt).toISOString() : null,
      updated_at: new Date().toISOString()
    })
    .eq("id", subId);

  if (!error) {
    await logAdminAction(
      admin.id,
      "OVERRIDE_SUBSCRIPTION",
      "subscriptions",
      subId,
      null,
      `Admin forced subscription plan to ${newPlan}`,
      { plan: newPlan, org_id: orgId, expires_at: expiresAt }
    );
  } else {
    console.error("Failed to update subscription:", error);
  }

  revalidatePath("/admin/subscriptions");
}
