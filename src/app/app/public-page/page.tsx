// ============================================
// GitTy — Public Page Editor
// ============================================
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PublicPageClient } from "./public-page-client";
import type { Profile, PublicPage } from "@/lib/types";

export const metadata = {
  title: "Public Hub Editor",
};

export default async function PublicPageEditor() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*, public_pages(*)")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/app/orgs");

  const pageConfig = (profile.public_pages as PublicPage[])?.[0] || {
    is_published: false,
    theme: "dark",
    links: [],
  };

  return (
    <div className="min-h-screen bg-surface-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <span className="text-3xl">🌐</span> Public Hub Editor
          </h1>
          <p className="text-zinc-400 mt-2">
            Configure your personal or business public page. Add links, connect your AI agent, and publish to the world.
          </p>
        </div>

        <PublicPageClient 
          initialProfile={profile as Profile} 
          initialConfig={pageConfig as PublicPage} 
        />
      </div>
    </div>
  );
}
