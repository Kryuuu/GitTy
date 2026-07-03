// ============================================
// GitTy — Projects Page
// ============================================
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProjectsList } from "./projects-list";

export default async function ProjectsPage({
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

  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });

  return (
    <div className="p-8">
      <ProjectsList
        orgId={orgId}
        userId={user.id}
        initialProjects={projects || []}
      />
    </div>
  );
}
