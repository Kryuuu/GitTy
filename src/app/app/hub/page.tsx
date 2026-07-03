// ============================================
// GitTy Hub — Main Dashboard
// ============================================
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { HubClient } from "./hub-client";
import type { Profile, PublicPage } from "@/lib/types";

export const metadata = {
  title: "GitTy Hub Builder",
};

export default async function HubDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  let { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Auto-create profile if it doesn't exist (e.g. users created before trigger)
  if (!profile) {
    const { data: newProfile } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        username: (user.email?.split("@")[0] || "user") + Math.floor(Math.random() * 1000),
        full_name: user.email?.split("@")[0] || "GitTy User"
      })
      .select()
      .single();
      
    if (newProfile) {
      profile = newProfile;
    } else {
      console.error("Hub profile error:", profileError);
      redirect("/app/orgs");
    }
  }

  const { data: publicPages } = await supabase
    .from("public_pages")
    .select("*")
    .eq("user_id", user.id);
  
  profile.public_pages = publicPages || [];

  const pageConfig = (profile.public_pages as PublicPage[])?.[0] || {
    is_published: false,
    theme: "dark",
    links: [],
    layout_config: {},
    booking_config: {},
    newsletter_config: {},
    seo_metadata: {},
  };

  // Fetch the user's marketplace items to display in the digital store section
  const { data: marketplaceItems } = await supabase
    .from("marketplace_items")
    .select("*")
    .eq("creator_id", user.id)
    .eq("is_published", true);

  return (
    <div className="min-h-screen bg-surface-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <span className="text-3xl">🌐</span> GitTy Hub
            </h1>
            <p className="text-zinc-400 mt-2">
              Build your AI-powered public business profile. Integrate links, portfolio, store, and an AI assistant.
            </p>
          </div>
          <a href="/app/orgs" className="inline-flex items-center justify-center rounded-xl text-sm font-bold transition-colors bg-surface-200 border border-surface-300/50 hover:bg-surface-300 text-white shadow-sm h-10 px-5">
            ← Back to Dashboard
          </a>
        </div>

        <HubClient 
          initialProfile={profile as Profile} 
          initialConfig={pageConfig as PublicPage} 
          storeItems={marketplaceItems || []}
        />
      </div>
    </div>
  );
}
