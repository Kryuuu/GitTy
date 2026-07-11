import { requireAdminPermission } from "@/lib/admin/auth";
import { createClient } from "@/lib/supabase/server";
import { Settings, Save, AlertTriangle } from "lucide-react";
import { updatePlatformSettings } from "./actions";

export const metadata = {
  title: "Platform Settings - Admin",
};

export default async function AdminSettingsPage() {
  await requireAdminPermission("settings.read");
  const supabase = await createClient();

  const { data: settings } = await supabase
    .from("platform_settings")
    .select("*")
    .single();

  return (
    <div className="p-6 lg:p-8 space-y-8 animate-slide-up max-w-4xl">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-brand-400" /> Platform Settings
        </h1>
        <p className="text-sm text-zinc-400">Configure global platform behavior and feature flags.</p>
      </div>

      <form action={updatePlatformSettings} className="space-y-6">
        <div className="bg-surface-100 border border-surface-400/50 rounded-2xl p-6 space-y-6">
          <h2 className="text-lg font-semibold text-white">General Configuration</h2>
          
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Platform Name</label>
              <input 
                type="text" 
                name="platform_name"
                defaultValue={settings?.platform_name || "GitTy"} 
                className="w-full px-4 py-2.5 bg-surface-200 border border-surface-400/50 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Marketplace Commission (%)</label>
              <input 
                type="number" 
                name="marketplace_commission_percent"
                step="0.01"
                defaultValue={settings?.marketplace_commission_percent || 10} 
                className="w-full px-4 py-2.5 bg-surface-200 border border-surface-400/50 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>
          </div>

          <div className="border-t border-surface-400/30 pt-6 space-y-4">
            <h2 className="text-lg font-semibold text-white">Toggles & Features</h2>
            
            <label className="flex items-start gap-3 p-4 rounded-xl border border-surface-400/30 bg-surface-200/50 cursor-pointer group hover:border-brand-500/50 transition-colors">
              <input type="checkbox" name="registration_enabled" defaultChecked={settings?.registration_enabled ?? true} className="mt-1 w-4 h-4 rounded border-zinc-600 text-brand-500 focus:ring-brand-500 bg-surface-400" />
              <div>
                <div className="text-sm font-medium text-white group-hover:text-brand-300 transition-colors">Enable Public Registration</div>
                <div className="text-xs text-zinc-500 mt-1">Allow new users to create accounts on the platform.</div>
              </div>
            </label>

            <label className="flex items-start gap-3 p-4 rounded-xl border border-surface-400/30 bg-surface-200/50 cursor-pointer group hover:border-brand-500/50 transition-colors">
              <input type="checkbox" name="marketplace_enabled" defaultChecked={settings?.marketplace_enabled ?? true} className="mt-1 w-4 h-4 rounded border-zinc-600 text-brand-500 focus:ring-brand-500 bg-surface-400" />
              <div>
                <div className="text-sm font-medium text-white group-hover:text-brand-300 transition-colors">Enable Marketplace</div>
                <div className="text-xs text-zinc-500 mt-1">Allow users to buy and sell AI assets.</div>
              </div>
            </label>
          </div>

          <div className="border-t border-red-500/20 pt-6 space-y-4">
            <h2 className="text-lg font-semibold text-red-400 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" /> Danger Zone
            </h2>
            
            <label className="flex items-start gap-3 p-4 rounded-xl border border-red-500/20 bg-red-500/5 cursor-pointer group hover:border-red-500/50 transition-colors">
              <input type="checkbox" name="maintenance_mode" defaultChecked={settings?.maintenance_mode ?? false} className="mt-1 w-4 h-4 rounded border-zinc-600 text-red-500 focus:ring-red-500 bg-surface-400" />
              <div>
                <div className="text-sm font-medium text-red-300">Maintenance Mode</div>
                <div className="text-xs text-red-400/70 mt-1">Block all non-admin traffic to the platform. Use only during major upgrades.</div>
              </div>
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button type="submit" className="flex items-center gap-2 px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-brand-500/20">
            <Save className="w-4 h-4" /> Save Configuration
          </button>
        </div>
      </form>
    </div>
  );
}
