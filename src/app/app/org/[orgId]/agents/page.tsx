// ============================================
// GitTy — AI Agents Page
// ============================================
import { agentTypes } from "@/lib/config";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Agent } from "@/lib/types";

export default async function AgentsPage({
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

  // Fetch custom agents for this org
  const { data: customAgents } = await supabase
    .from("agents")
    .select("*")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <span className="text-3xl">🤖</span> AI Agents
          </h1>
          <p className="text-zinc-400 mt-2">
            Deploy specialized AI agents to work inside your projects
          </p>
        </div>
        <Link
          href={`/app/org/${orgId}/agents/builder`}
          className="inline-flex items-center justify-center h-10 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-xl transition-colors shadow-[0_0_20px_rgba(var(--brand-500),0.3)]"
        >
          + Create Custom Agent
        </Link>
      </div>

      <div className="space-y-10">
        
        {/* Custom Agents Section */}
        {customAgents && customAgents.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-400"></span>
              Your Custom Agents
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(customAgents as Agent[]).map((agent) => (
                <div key={agent.id} className="glass-card rounded-2xl p-6 group flex flex-col h-full">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-surface-200 border border-brand-500/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shadow-lg shadow-brand-500/10">
                        {agent.avatar}
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-white">
                          {agent.name}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                          <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Custom • {agent.provider}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-zinc-400 mb-6 flex-1">
                    {agent.description || "No description provided."}
                  </p>

                  <div className="flex items-center gap-2 text-xs text-zinc-500 mb-4 bg-surface-200/50 p-2.5 rounded-xl border border-surface-300/30">
                    <span className="text-brand-400 capitalize">{agent.visibility}</span>
                    <span>•</span>
                    <span>Temp: {agent.temperature}</span>
                  </div>

                  <Link
                    href={`/app/org/${orgId}/projects`}
                    className="block text-center py-2.5 rounded-xl border border-surface-300/50 text-sm text-zinc-300 hover:bg-surface-200 hover:text-white transition-all"
                  >
                    Launch in Project →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Built-in Agents Section */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-zinc-500"></span>
            Built-in Agents
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agentTypes.map((agent) => (
              <div key={agent.id} className="glass-card rounded-2xl p-6 group flex flex-col h-full">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-surface-200 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                    {agent.icon}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">
                      {agent.name}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wider">System Default</span>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-zinc-400 mb-6 flex-1">
                  {agent.description}
                </p>

                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <span>🔒</span>
                    <span>Org-scoped permissions</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <span>🧠</span>
                    <span>Persistent memory</span>
                  </div>
                </div>

                <Link
                  href={`/app/org/${orgId}/projects`}
                  className="block text-center py-2.5 rounded-xl bg-surface-200 text-sm text-zinc-300 hover:bg-surface-300 transition-all mt-auto"
                >
                  Launch in Project →
                </Link>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
