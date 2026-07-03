// ============================================
// GitTy — Members List Client Component
// ============================================
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { formatDate } from "@/lib/utils";
import type { OrgMember, OrgRole, Profile } from "@/lib/types";

interface MembersListProps {
  orgId: string;
  currentUserId: string;
  currentRole: OrgRole;
  initialMembers: (OrgMember & { profiles: Profile })[];
}

export function MembersList({
  orgId,
  currentUserId,
  currentRole,
  initialMembers,
}: MembersListProps) {
  const [members, setMembers] = useState(initialMembers);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<OrgRole>("member");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const isAdmin = currentRole === "owner" || currentRole === "admin";

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    // Note: In production, you'd send an email invite.
    // For MVP, we look up the user by email and add them directly.
    const supabase = createClient();

    // Find user by email (via profiles or auth)
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id")
      .ilike("username", inviteEmail.split("@")[0]);

    if (!profiles || profiles.length === 0) {
      setError("User not found. They need to create an account first.");
      setIsLoading(false);
      return;
    }

    const targetUserId = profiles[0].id;

    // Check if already a member
    const existing = members.find((m) => m.user_id === targetUserId);
    if (existing) {
      setError("This user is already a member.");
      setIsLoading(false);
      return;
    }

    const { data, error: addError } = await supabase
      .from("org_members")
      .insert({
        org_id: orgId,
        user_id: targetUserId,
        role: inviteRole,
      })
      .select("*, profiles(*)")
      .single();

    if (addError) {
      setError(addError.message);
      setIsLoading(false);
      return;
    }

    setMembers([
      ...members,
      data as OrgMember & { profiles: Profile },
    ]);
    setSuccess("Member added successfully!");
    setInviteEmail("");
    setIsLoading(false);
    router.refresh();
  }

  async function handleRemove(memberId: string) {
    if (!confirm("Remove this member from the organization?")) return;
    const supabase = createClient();
    await supabase.from("org_members").delete().eq("id", memberId);
    setMembers(members.filter((m) => m.id !== memberId));
    router.refresh();
  }

  async function handleRoleChange(memberId: string, newRole: OrgRole) {
    const supabase = createClient();
    await supabase
      .from("org_members")
      .update({ role: newRole })
      .eq("id", memberId);
    setMembers(
      members.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
    );
    router.refresh();
  }

  const roleBadgeVariant = (role: OrgRole) => {
    switch (role) {
      case "owner":
        return "brand" as const;
      case "admin":
        return "warning" as const;
      default:
        return "default" as const;
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Team Members</h1>
          <p className="text-zinc-400 mt-1">
            Manage who has access to this organization
          </p>
        </div>
        {isAdmin && (
          <Button variant="gradient" onClick={() => setIsInviteOpen(true)}>
            + Invite Member
          </Button>
        )}
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="divide-y divide-surface-300/30">
          {members.map((member) => {
            const profile = member.profiles;
            return (
              <div
                key={member.id}
                className="flex items-center justify-between p-5 hover:bg-surface-200/30 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-surface-300 flex items-center justify-center text-sm font-bold text-zinc-400">
                    {profile?.full_name?.[0] || profile?.username?.[0] || "?"}
                  </div>
                  <div>
                    <p className="font-medium text-white">
                      {profile?.full_name || profile?.username || "Unknown"}
                    </p>
                    <p className="text-xs text-zinc-500">
                      @{profile?.username || "unknown"} · Joined{" "}
                      {formatDate(member.joined_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {isAdmin && member.user_id !== currentUserId ? (
                    <select
                      value={member.role}
                      onChange={(e) =>
                        handleRoleChange(member.id, e.target.value as OrgRole)
                      }
                      className="bg-surface-200 border border-surface-400/50 rounded-lg px-3 py-1.5 text-xs text-zinc-300 focus:outline-none cursor-pointer"
                    >
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                      <option value="owner">Owner</option>
                    </select>
                  ) : (
                    <Badge variant={roleBadgeVariant(member.role)}>
                      {member.role}
                    </Badge>
                  )}

                  {isAdmin &&
                    member.user_id !== currentUserId &&
                    member.role !== "owner" && (
                      <button
                        onClick={() => handleRemove(member.id)}
                        className="text-zinc-600 hover:text-red-400 transition-colors cursor-pointer"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Invite Modal */}
      <Modal
        isOpen={isInviteOpen}
        onClose={() => {
          setIsInviteOpen(false);
          setError("");
          setSuccess("");
        }}
        title="Invite Team Member"
        description="Add a new member to your organization"
      >
        <form onSubmit={handleInvite} className="space-y-4">
          <Input
            id="invite-email"
            label="Email Address"
            type="email"
            placeholder="teammate@company.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            required
          />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-zinc-300">
              Role
            </label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as OrgRole)}
              className="w-full rounded-xl bg-surface-100 border border-surface-400/50 px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 cursor-pointer"
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {error && (
            <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">
              {error}
            </div>
          )}
          {success && (
            <div className="text-sm text-green-400 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-2.5">
              {success}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsInviteOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="gradient"
              className="flex-1"
              isLoading={isLoading}
            >
              Send Invite
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
