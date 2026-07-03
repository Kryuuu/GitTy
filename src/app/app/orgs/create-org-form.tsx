// ============================================
// GitTy — Create Organization Form
// ============================================
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { slugify } from "@/lib/utils";

export function CreateOrgForm({ userId }: { userId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    setError("");

    const supabase = createClient();
    const slug = slugify(name);

    // Create organization
    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .insert({
        name: name.trim(),
        slug,
        owner_id: userId,
      })
      .select()
      .single();

    if (orgError) {
      setError(orgError.message);
      setIsLoading(false);
      return;
    }

    // Add creator as owner member
    await supabase.from("org_members").insert({
      org_id: org.id,
      user_id: userId,
      role: "owner",
    });

    // Create default free subscription
    await supabase.from("subscriptions").insert({
      org_id: org.id,
      plan: "free",
      status: "active",
      usage_limit: 500,
    });

    setIsOpen(false);
    setName("");
    router.push(`/app/org/${org.id}/dashboard`);
    router.refresh();
  }

  return (
    <>
      <Button variant="gradient" onClick={() => setIsOpen(true)}>
        + New Organization
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Create Organization"
        description="Set up a new workspace for your team"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            id="org-name"
            label="Organization Name"
            placeholder="My Company"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          {name && (
            <p className="text-xs text-zinc-500">
              Slug: <span className="text-zinc-400">{slugify(name)}</span>
            </p>
          )}

          {error && (
            <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsOpen(false)}
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
              Create
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
