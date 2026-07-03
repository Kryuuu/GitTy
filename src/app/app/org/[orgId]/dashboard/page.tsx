// ============================================
// GitTy — Organization Dashboard
// ============================================
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function OrgDashboard({
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

  // Fetch dashboard data
  const [projectsRes, membersRes, aiLogsRes, subscriptionRes] =
    await Promise.all([
      supabase
        .from("projects")
        .select("id", { count: "exact" })
        .eq("org_id", orgId),
      supabase
        .from("org_members")
        .select("id", { count: "exact" })
        .eq("org_id", orgId),
      supabase
        .from("ai_logs")
        .select("tokens_used")
        .eq("org_id", orgId),
      supabase
        .from("subscriptions")
        .select("*")
        .eq("org_id", orgId)
        .single(),
    ]);

  const projectCount = projectsRes.count || 0;
  const memberCount = membersRes.count || 0;
  const totalTokens =
    aiLogsRes.data?.reduce((sum, log) => sum + (log.tokens_used || 0), 0) || 0;
  const subscription = subscriptionRes.data;

  // Recent AI logs
  const { data: recentLogs } = await supabase
    .from("ai_logs")
    .select("*")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false })
    .limit(5);

  const stats = [
    {
      label: "Projects",
      value: projectCount,
      icon: "📁",
      href: `/app/org/${orgId}/projects`,
    },
    {
      label: "Members",
      value: memberCount,
      icon: "👥",
      href: `/app/org/${orgId}/members`,
    },
    {
      label: "AI Tokens Used",
      value: totalTokens.toLocaleString(),
      icon: "🤖",
      href: "#",
    },
    {
      label: "Plan",
      value: (subscription?.plan || "free").charAt(0).toUpperCase() +
        (subscription?.plan || "free").slice(1),
      icon: "💎",
      href: `/app/org/${orgId}/billing`,
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-zinc-400 mt-1">
          Overview of your organization&apos;s activity
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="glass-card rounded-2xl p-5 group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{stat.icon}</span>
              <svg
                className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-sm text-zinc-500 mt-1">{stat.label}</p>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            Quick Actions
          </h2>
          <div className="space-y-2">
            <Link
              href={`/app/org/${orgId}/projects`}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-200 transition-all text-zinc-400 hover:text-white"
            >
              <span className="w-8 h-8 rounded-lg bg-brand-600/10 flex items-center justify-center text-sm">
                ➕
              </span>
              <span className="text-sm">Create New Project</span>
            </Link>
            <Link
              href={`/app/org/${orgId}/members`}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-200 transition-all text-zinc-400 hover:text-white"
            >
              <span className="w-8 h-8 rounded-lg bg-green-600/10 flex items-center justify-center text-sm">
                👥
              </span>
              <span className="text-sm">Invite Team Members</span>
            </Link>
            <Link
              href={`/app/org/${orgId}/agents`}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-200 transition-all text-zinc-400 hover:text-white"
            >
              <span className="w-8 h-8 rounded-lg bg-accent-600/10 flex items-center justify-center text-sm">
                🤖
              </span>
              <span className="text-sm">Launch AI Agent</span>
            </Link>
          </div>
        </div>

        {/* Usage Chart Placeholder */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            AI Usage This Period
          </h2>
          <div className="flex items-end gap-1 h-40">
            {Array.from({ length: 14 }, (_, i) => {
              const height = Math.random() * 80 + 20;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t-md bg-gradient-to-t from-brand-600/50 to-brand-400/30 transition-all hover:from-brand-600 hover:to-brand-400"
                    style={{ height: `${height}%` }}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-3 text-xs text-zinc-600">
            <span>Jun 20</span>
            <span>Today</span>
          </div>
        </div>
      </div>

      {/* Recent AI Activity */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">
          Recent AI Activity
        </h2>
        {!recentLogs || recentLogs.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-zinc-500 text-sm">
              No AI activity yet. Start by creating a project and chatting with
              an AI agent.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-3 p-3 rounded-xl hover:bg-surface-200/50 transition-all"
              >
                <div className="w-8 h-8 rounded-lg bg-surface-200 flex items-center justify-center text-xs shrink-0">
                  🤖
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-white truncate">{log.prompt}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500">
                    <span>{log.provider}</span>
                    <span>•</span>
                    <span>{log.tokens_used} tokens</span>
                    <span>•</span>
                    <span>
                      {new Date(log.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
