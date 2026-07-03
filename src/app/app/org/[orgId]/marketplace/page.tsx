// ============================================
// GitTy — Marketplace Dashboard Page
// ============================================
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { MarketplaceClient } from "./marketplace-client";
import type { MarketplaceItem } from "@/lib/types";

export const metadata = {
  title: "Vendor Dashboard",
};

export default async function MarketplaceDashboardPage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = await params;
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Verify membership
  const { data: membership } = await supabase
    .from("org_members")
    .select("role")
    .eq("org_id", orgId)
    .eq("user_id", user.id)
    .single();

  if (!membership) redirect("/app/orgs");

  const { data: items } = await supabase
    .from("marketplace_items")
    .select("*")
    .eq("creator_org_id", orgId)
    .order("created_at", { ascending: false });

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <span className="text-3xl">🏪</span> Vendor Dashboard
        </h1>
        <p className="text-zinc-400 mt-2">
          Manage and publish your AI agents, prompts, and workflows to the GitTy Marketplace.
        </p>
      </div>

      <MarketplaceClient 
        orgId={orgId} 
        initialItems={(items as MarketplaceItem[]) || []} 
      />
    </div>
  );
}
