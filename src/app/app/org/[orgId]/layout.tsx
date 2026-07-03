// ============================================
// GitTy — Organization Layout (Sidebar + Content)
// ============================================
import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { OrgSidebar } from "./sidebar";

export default async function OrgLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Verify user is a member of this org
  const { data: membership } = await supabase
    .from("org_members")
    .select("*, organizations(*)")
    .eq("org_id", orgId)
    .eq("user_id", user.id)
    .single();

  if (!membership) notFound();

  const org = membership.organizations as {
    id: string;
    name: string;
    slug: string;
  };

  return (
    <div className="min-h-screen bg-surface-0 flex">
      <OrgSidebar
        orgId={orgId}
        orgName={org.name}
        orgSlug={org.slug}
        userRole={membership.role}
        userEmail={user.email || ""}
      />
      <main className="flex-1 md:ml-64 min-h-screen pt-16 md:pt-0 w-full overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
