// ============================================
// GitTy — AI Agent Builder Page
// ============================================
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AgentBuilderClient } from "./agent-builder-client";

export const metadata = {
  title: "Agent Builder",
};

export default async function AgentBuilderPage({
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

  // Verify membership role for permissions
  const { data: membership } = await supabase
    .from("org_members")
    .select("role")
    .eq("org_id", orgId)
    .eq("user_id", user.id)
    .single();

  if (!membership) redirect("/app/orgs");

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <span className="text-3xl">🛠️</span> Agent Builder
        </h1>
        <p className="text-zinc-400 mt-2">
          Create a custom AI agent tailored for your organization's specific workflows.
        </p>
      </div>

      <AgentBuilderClient orgId={orgId} />
    </div>
  );
}
