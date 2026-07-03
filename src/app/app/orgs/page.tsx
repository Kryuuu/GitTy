// ============================================
// GitTy — Organizations List Page
// ============================================
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { siteConfig } from "@/lib/config";
import { CreateOrgForm } from "./create-org-form";
import type { Organization, OrgMember } from "@/lib/types";

export const metadata = {
  title: `Organizations — ${siteConfig.name}`,
};

export default async function OrgsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Get user's org memberships
  const { data: memberships } = await supabase
    .from("org_members")
    .select("*, organizations(*)")
    .eq("user_id", user.id)
    .order("joined_at", { ascending: false });

  const orgs =
    (memberships as (OrgMember & { organizations: Organization })[] | null) ||
    [];

  return (
    <div className="min-h-screen bg-surface-0">
      {/* Top bar */}
      <header className="border-b border-surface-300/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/logo.png" alt="GitTy Logo" className="h-10 w-auto shrink-0 object-contain" />
            <span className="text-lg font-bold text-white hidden sm:block">
              {siteConfig.name}
            </span>
          </Link>
          <div className="flex items-center gap-4 sm:gap-6">
            <Link href="/" className="text-xs sm:text-sm font-medium text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5">
              <svg className="w-4 h-4 hidden sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back to Home</span>
            </Link>
            <div className="flex items-center gap-4 border-l border-surface-300/50 pl-4 sm:pl-6">
              <Link href="/app/settings" className="text-sm text-zinc-400 hover:text-white transition-colors hidden md:flex items-center gap-2 max-w-[200px] group">
                <div className="w-6 h-6 rounded-full bg-surface-300 flex items-center justify-center text-[10px] text-zinc-500 group-hover:bg-brand-500/20 group-hover:text-brand-400 transition-colors">
                  {user.email?.[0].toUpperCase()}
                </div>
                <span className="truncate">{user.email}</span>
              </Link>
              <form action="/auth/signout" method="POST">
                <button
                  type="submit"
                  className="text-xs sm:text-sm text-zinc-500 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
                >
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Your Organizations</h1>
            <p className="text-sm sm:text-base text-zinc-400 mt-1">
              Create or join an organization to get started
            </p>
          </div>
          <div className="w-full sm:w-auto">
            <CreateOrgForm userId={user.id} />
          </div>
        </div>

        {orgs.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-surface-200 flex items-center justify-center mx-auto mb-4 text-3xl">
              🏢
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">
              No organizations yet
            </h2>
            <p className="text-zinc-400 mb-6">
              Create your first organization to start building with AI
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {orgs.map((membership) => {
              const org = membership.organizations;
              return (
                <Link
                  key={org.id}
                  href={`/app/org/${org.id}/workspace`}
                  className="glass-card rounded-2xl p-6 group"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center text-white font-bold text-lg">
                      {org.name[0]}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white group-hover:gradient-text transition-all">
                        {org.name}
                      </h3>
                      <p className="text-xs text-zinc-500">/{org.slug}</p>
                    </div>
                  </div>
                  {org.description && (
                    <p className="text-sm text-zinc-400 line-clamp-2">
                      {org.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-4">
                    <span className="text-xs text-zinc-500 bg-surface-200 px-2.5 py-1 rounded-full capitalize">
                      {membership.role}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* GitTy Hub Special Card */}
        <div className="mt-6 sm:mt-8">
          <Link
            href="/app/hub"
            className="flex flex-col sm:flex-row sm:items-center justify-between p-6 rounded-2xl border border-brand-500/30 bg-brand-500/5 hover:bg-brand-500/10 transition-all group gap-4 sm:gap-0"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 shrink-0 rounded-xl gradient-brand flex items-center justify-center text-white text-xl shadow-lg shadow-brand-500/20 group-hover:scale-110 transition-transform">
                🌐
              </div>
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  GitTy Hub
                  <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 uppercase tracking-wider">
                    Public Profile
                  </span>
                </h3>
                <p className="text-sm text-zinc-400 mt-1">
                  Customize and share your AI portfolio to the world
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-brand-400 font-medium text-sm sm:text-base self-start sm:self-auto pl-16 sm:pl-0">
              Open Studio
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
