"use server";

import { requireAdminPermission, logAdminAction } from "@/lib/admin/auth";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updatePlatformSettings(formData: FormData) {
  const admin = await requireAdminPermission("settings.update");
  const supabase = await createClient();

  const platform_name = formData.get("platform_name") as string;
  const marketplace_commission_percent = parseFloat(formData.get("marketplace_commission_percent") as string);
  const registration_enabled = formData.get("registration_enabled") === "on";
  const marketplace_enabled = formData.get("marketplace_enabled") === "on";
  const maintenance_mode = formData.get("maintenance_mode") === "on";

  const { error } = await supabase
    .from("platform_settings")
    .update({
      platform_name,
      marketplace_commission_percent,
      registration_enabled,
      marketplace_enabled,
      maintenance_mode,
      updated_by: admin.id,
      updated_at: new Date().toISOString()
    })
    .eq("id", true);

  if (!error) {
    await logAdminAction(
      admin.id,
      "UPDATE_SETTINGS",
      "platform_settings",
      "global",
      null,
      "Updated platform configuration via admin panel",
      {
        platform_name,
        marketplace_commission_percent,
        registration_enabled,
        marketplace_enabled,
        maintenance_mode
      }
    );
  }

  revalidatePath("/admin/settings");
}
