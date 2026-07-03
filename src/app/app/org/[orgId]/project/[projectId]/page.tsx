// ============================================
// GitTy — Project Workspace (AI Chat + Agents)
// ============================================
import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { ProjectWorkspace } from "./workspace";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ orgId: string; projectId: string }>;
}) {
  const { orgId, projectId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch project
  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .eq("org_id", orgId)
    .single();

  if (!project) notFound();

  // Fetch recent AI logs for this project
  const { data: aiLogs } = await supabase
    .from("ai_logs")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: true })
    .limit(50);

  // Fetch AI memory
  const { data: memories } = await supabase
    .from("ai_memory")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <ProjectWorkspace
      project={project}
      orgId={orgId}
      userId={user.id}
      initialLogs={aiLogs || []}
      initialMemories={memories || []}
    />
  );
}
