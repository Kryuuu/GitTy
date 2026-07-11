import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export type PlatformRole = "user" | "support" | "admin" | "super_admin";

export interface AdminUser {
  id: string;
  email: string;
  platform_role: PlatformRole;
  account_status: string;
}

export type AdminPermission =
  | "dashboard.read"
  | "users.read"
  | "users.manage"
  | "organizations.read"
  | "organizations.manage"
  | "projects.read"
  | "agents.read"
  | "workflows.read"
  | "marketplace.moderate"
  | "subscriptions.read"
  | "transactions.read"
  | "usage.read"
  | "reports.read"
  | "reports.manage"
  | "audit.read"
  | "audit.export"
  | "system.read"
  | "settings.read"
  | "settings.update";

const ROLE_PERMISSIONS: Record<PlatformRole, AdminPermission[]> = {
  user: [],
  support: [
    "dashboard.read",
    "users.read",
    "organizations.read",
    "projects.read",
    "agents.read",
    "workflows.read",
    "subscriptions.read",
    "transactions.read",
    "usage.read",
    "reports.read",
    "audit.read",
  ],
  admin: [
    "dashboard.read",
    "users.read",
    "users.manage",
    "organizations.read",
    "organizations.manage",
    "projects.read",
    "agents.read",
    "workflows.read",
    "marketplace.moderate",
    "subscriptions.read",
    "transactions.read",
    "usage.read",
    "reports.read",
    "reports.manage",
    "audit.read",
    "system.read",
    "settings.read",
  ],
  super_admin: [
    "dashboard.read",
    "users.read",
    "users.manage",
    "organizations.read",
    "organizations.manage",
    "projects.read",
    "agents.read",
    "workflows.read",
    "marketplace.moderate",
    "subscriptions.read",
    "transactions.read",
    "usage.read",
    "reports.read",
    "reports.manage",
    "audit.read",
    "audit.export",
    "system.read",
    "settings.read",
    "settings.update",
  ],
};

export function hasAdminPermission(role: PlatformRole, permission: AdminPermission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

/**
 * Validates if the current user has the specified permission.
 * If not, it redirects them.
 */
export async function requireAdminPermission(permission: AdminPermission): Promise<AdminUser> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login?redirect=/admin");
  }

  // Fetch the user's platform role from profiles
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("platform_role, account_status")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    redirect("/app/orgs"); // Fallback to normal app if profile missing
  }

  const role = (profile.platform_role as PlatformRole) || "user";
  const status = profile.account_status || "active";

  if (status !== "active") {
    redirect("/app/orgs"); // Or a suspended page
  }

  if (!hasAdminPermission(role, permission)) {
    redirect("/app/orgs"); // Unauthorized
  }

  return {
    id: user.id,
    email: user.email ?? "",
    platform_role: role,
    account_status: status,
  };
}

/**
 * Creates an audit log entry for admin actions.
 */
export async function logAdminAction(
  actorId: string,
  action: string,
  entityType: string,
  entityId?: string | null,
  targetUserId?: string | null,
  reason?: string,
  metadata?: any
) {
  const supabase = await createClient();
  
  // Using service role is typically required for audit logs since RLS might block normal inserts
  // But our RLS allows 'admin' and 'super_admin' to insert.
  await supabase.from("admin_audit_logs").insert({
    actor_id: actorId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    target_user_id: targetUserId,
    reason,
    metadata: metadata || {},
  });
}
