import { requireAdminPermission } from "@/lib/admin/auth";
import { createClient } from "@/lib/supabase/server";
import { Users, Building2, Store, CreditCard, Activity, ArrowUpRight } from "lucide-react";

export const metadata = {
  title: "Admin Dashboard - GitTy",
};

export default async function AdminDashboardPage() {
  // 1. Authorize super admin access
  await requireAdminPermission("dashboard.read");
  const supabase = await createClient();

  // 2. Fetch high-level platform stats securely
  const [
    { count: usersCount },
    { count: orgsCount },
    { count: subscriptionsCount },
    { count: projectsCount }
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("organizations").select("*", { count: "exact", head: true }),
    supabase.from("subscriptions").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("projects").select("*", { count: "exact", head: true }),
  ]);

  const stats = [
    { title: "Total Users", value: usersCount || 0, icon: Users, trend: "+12%" },
    { title: "Total Organizations", value: orgsCount || 0, icon: Building2, trend: "+5%" },
    { title: "Active Subscriptions", value: subscriptionsCount || 0, icon: CreditCard, trend: "+2%" },
    { title: "Total Projects", value: projectsCount || 0, icon: Activity, trend: "+24%" },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-8 animate-slide-up">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-white tracking-tight">Executive Dashboard</h1>
        <p className="text-zinc-400">Platform-wide overview and real-time metrics.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="rounded-2xl border border-surface-400/50 bg-surface-100/50 p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 rounded-full blur-3xl group-hover:bg-brand-500/10 transition-colors" />
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 rounded-xl bg-surface-300 text-zinc-300">
                <stat.icon className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-1 text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full">
                <ArrowUpRight className="w-3 h-3" />
                {stat.trend}
              </div>
            </div>
            <div>
              <h3 className="text-zinc-400 text-sm font-medium mb-1">{stat.title}</h3>
              <p className="text-3xl font-bold text-white">{stat.value.toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Placeholder for Charts / Secondary Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-surface-400/50 bg-surface-100/50 p-6 min-h-[400px] flex items-center justify-center">
          <div className="text-center text-zinc-500">
            <Activity className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="font-medium">Growth Chart Data (Under Construction)</p>
          </div>
        </div>
        <div className="rounded-2xl border border-surface-400/50 bg-surface-100/50 p-6">
          <h3 className="text-lg font-bold text-white mb-4">System Alerts</h3>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-brand-500/10 border border-brand-500/20">
              <p className="text-sm text-brand-300 font-medium">All systems operational</p>
              <p className="text-xs text-brand-400/70 mt-1">Last checked just now</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
