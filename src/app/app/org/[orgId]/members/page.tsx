// ============================================
// GitTy — Members Page
// ============================================
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { MembersList } from "./members-list";

export default async function MembersPage({
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

  // Get current user's role
  const { data: currentMember } = await supabase
    .from("org_members")
    .select("role")
    .eq("org_id", orgId)
    .eq("user_id", user.id)
    .single();

  // Get all members with profiles
  const { data: members } = await supabase
    .from("org_members")
    .select("*, profiles(*)")
    .eq("org_id", orgId)
    .order("joined_at", { ascending: true });

  return (
    <div className="p-8">
      <MembersList
        orgId={orgId}
        currentUserId={user.id}
        currentRole={currentMember?.role || "member"}
        initialMembers={members || []}
      />
    </div>
  );
}
