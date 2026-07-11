// ============================================
// GitTy — Checkout Page
// ============================================
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { siteConfig } from "@/lib/config";
import type { Organization, OrgMember } from "@/lib/types";
import { CheckoutClient } from "./checkout-client";

export const metadata = {
  title: `Checkout — ${siteConfig.name}`,
};

export default async function CheckoutPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Get user's org memberships where they are admin or owner
  const { data: memberships } = await supabase
    .from("org_members")
    .select("*, organizations(*)")
    .eq("user_id", user.id)
    .in("role", ["owner", "admin"])
    .order("joined_at", { ascending: false });

  const orgs =
    (memberships as (OrgMember & { organizations: Organization })[] | null) ||
    [];

  return (
    <div className="min-h-screen bg-surface-0 flex flex-col">
      <header className="border-b border-surface-300/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="GitTy Logo" className="h-10 w-auto shrink-0 object-contain" />
            <span className="text-lg font-bold text-white hidden sm:block">
              {siteConfig.name}
            </span>
          </div>
          <div className="text-sm text-zinc-400 font-medium">Secure Checkout 🔒</div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <CheckoutClient orgs={orgs.map(m => m.organizations)} />
      </main>
    </div>
  );
}
