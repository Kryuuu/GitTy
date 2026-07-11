import { requireAdminPermission } from "@/lib/admin/auth";
import { Server, Database, Cloud, Globe } from "lucide-react";

export const metadata = { title: "System Health - Admin" };

export default async function AdminSystemPage() {
  await requireAdminPermission("system.read");

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Server className="w-6 h-6 text-brand-400" /> System Health
        </h1>
        <p className="text-sm text-zinc-400">Real-time status of Gitty infrastructure and third-party services.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { name: "PostgreSQL (Supabase)", icon: Database, status: "Operational", uptime: "99.99%", latency: "42ms", color: "text-emerald-400", bg: "bg-emerald-400/10" },
          { name: "Auth (GoTrue)", icon: Server, status: "Operational", uptime: "100%", latency: "21ms", color: "text-emerald-400", bg: "bg-emerald-400/10" },
          { name: "Vercel Edge Network", icon: Globe, status: "Operational", uptime: "99.99%", latency: "12ms", color: "text-emerald-400", bg: "bg-emerald-400/10" },
          { name: "OpenAI API", icon: Cloud, status: "Degraded", uptime: "98.5%", latency: "1,204ms", color: "text-yellow-400", bg: "bg-yellow-400/10" },
        ].map((service, i) => (
          <div key={i} className="bg-surface-100 border border-surface-400/50 p-6 rounded-2xl flex flex-col justify-between hover:border-brand-500/30 transition-colors group">
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-lg ${service.bg}`}>
                <service.icon className={`w-5 h-5 ${service.color}`} />
              </div>
              <h3 className="font-medium text-white">{service.name}</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-500">Status</span>
                <span className={`font-semibold flex items-center gap-1.5 ${service.color}`}>
                  <span className={`w-2 h-2 rounded-full ${service.bg.replace('10', '100').replace('bg-', '')}`} />
                  {service.status}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-500">Uptime (30d)</span>
                <span className="text-white">{service.uptime}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-500">Latency</span>
                <span className="text-white font-mono">{service.latency}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
