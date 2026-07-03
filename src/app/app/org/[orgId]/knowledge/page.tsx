// ============================================
// GitTy — Knowledge Base Page
// ============================================
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { KnowledgeClient } from "./knowledge-client";
import type { Knowledge } from "@/lib/types";

export const metadata = {
  title: "Knowledge Base",
};

export default async function KnowledgePage({
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

  // Fetch knowledge files
  const { data: files } = await supabase
    .from("knowledge")
    .select("*")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <span className="text-3xl">📚</span> Knowledge Base
        </h1>
        <p className="text-zinc-400 mt-2">
          Upload documents and data to create custom AI context for your organization.
        </p>
      </div>

      <KnowledgeClient
        orgId={orgId}
        initialFiles={(files as Knowledge[]) || []}
      />
    </div>
  );
}
