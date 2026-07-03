// ============================================
// GitTy — Account Settings Page
// ============================================
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { siteConfig } from "@/lib/config";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AvatarUpload } from "./avatar-upload";
import { DeleteAccountButton } from "./delete-account-button";

export const metadata = {
  title: `Account Settings — ${siteConfig.name}`,
};

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const avatarUrl = profile?.avatar_url;

  return (
    <div className="min-h-screen bg-surface-0">
      {/* Top bar */}
      <header className="border-b border-surface-300/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/app/orgs" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <img src="/logo.png" alt="GitTy Logo" className="h-10 w-auto shrink-0 object-contain" />
            <span className="text-lg font-bold text-white hidden sm:block">
              {siteConfig.name}
            </span>
          </Link>
          <div className="flex items-center gap-4 sm:gap-6">
            <Link href="/app/orgs" className="text-xs sm:text-sm font-medium text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5">
              <svg className="w-4 h-4 hidden sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Account Settings</h1>
          <p className="text-sm sm:text-base text-zinc-400 mt-1">
            Manage your personal profile and preferences
          </p>
        </div>

        <div className="space-y-6">
          {/* Profile Section */}
          <div className="glass-card rounded-3xl p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-white mb-6">Profile Information</h2>
            
            <div className="flex flex-col sm:flex-row gap-8 items-start sm:items-center">
              <div className="relative shrink-0">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-2 border-surface-300 gradient-brand flex items-center justify-center text-4xl sm:text-5xl text-white font-bold shadow-xl shadow-brand-500/20">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    user.email?.[0].toUpperCase()
                  )}
                </div>
              </div>
              
              <div className="flex-1 space-y-4 w-full">
                <AvatarUpload initialUrl={avatarUrl || ""} />

                <div>
                  <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Email Address</label>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-surface-200/50 border border-surface-300/30 rounded-xl px-4 py-2.5 text-white">
                      {user.email}
                    </div>
                    <Badge variant="brand" className="shrink-0 bg-green-500/20 text-green-400 border-0">Verified</Badge>
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">User ID</label>
                  <div className="bg-surface-200/50 border border-surface-300/30 rounded-xl px-4 py-2.5 text-zinc-400 text-sm font-mono truncate">
                    {user.id}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Preferences Section */}
          <div className="glass-card rounded-3xl p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-white mb-6">Preferences</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-surface-200/50 border border-surface-300/30 rounded-2xl">
                <div>
                  <h3 className="font-medium text-white">Theme</h3>
                  <p className="text-sm text-zinc-400">Select your preferred interface theme</p>
                </div>
                <div className="flex items-center gap-2 bg-surface-300/50 p-1 rounded-xl border border-surface-400/50">
                  <button className="px-3 py-1.5 rounded-lg bg-surface-100 text-white shadow-sm text-sm font-medium">Dark</button>
                  <button className="px-3 py-1.5 rounded-lg text-zinc-400 hover:text-white text-sm font-medium transition-colors">Light</button>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-surface-200/50 border border-surface-300/30 rounded-2xl">
                <div>
                  <h3 className="font-medium text-white">Email Notifications</h3>
                  <p className="text-sm text-zinc-400">Receive updates about your agents and projects</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-surface-400 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-500"></div>
                </label>
              </div>
            </div>
          </div>
          
          {/* Danger Zone */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 border-red-500/20 bg-red-500/5">
            <h2 className="text-lg font-semibold text-red-400 mb-2">Danger Zone</h2>
            <p className="text-sm text-zinc-400 mb-6">Irreversible and destructive actions</p>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-surface-200/50 border border-red-500/20 rounded-2xl">
              <div>
                <h3 className="font-medium text-white">Delete Account</h3>
                <p className="text-sm text-zinc-400">Permanently delete your account and all data</p>
              </div>
              <DeleteAccountButton />
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}
