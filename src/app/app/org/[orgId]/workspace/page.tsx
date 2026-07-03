// ============================================
// GitTy — Global AI Workspace Page
// ============================================
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { GlobalWorkspace } from "./global-workspace";
import type { Project, AILog } from "@/lib/types";

export default async function WorkspacePage({
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

  // Fetch recent projects
  const { data: recentProjects } = await supabase
    .from("projects")
    .select("*")
    .eq("org_id", orgId)
    .order("updated_at", { ascending: false })
    .limit(3);

  // Fetch recent global AI logs (where project_id is null, meaning global chat)
  const { data: recentLogs } = await supabase
    .from("ai_logs")
    .select("*")
    .eq("org_id", orgId)
    .is("project_id", null)
    .order("created_at", { ascending: false })
    .limit(10);

  // Fetch memory stats
  const { count: memoryCount } = await supabase
    .from("ai_memory")
    .select("*", { count: "exact", head: true })
    .eq("org_id", orgId);

  return (
    <div className="flex h-[calc(100vh-theme(spacing.16))] w-full">
      <GlobalWorkspace
        orgId={orgId}
        userEmail={user.email || ""}
        recentProjects={(recentProjects as Project[]) || []}
        recentLogs={(recentLogs as AILog[]) || []}
        memoryCount={memoryCount || 0}
      />
    </div>
  );
}
