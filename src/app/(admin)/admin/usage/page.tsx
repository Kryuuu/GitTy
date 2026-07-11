import { requireAdminPermission } from "@/lib/admin/auth";
import { createClient } from "@/lib/supabase/server";
import { Activity, Zap } from "lucide-react";

export const metadata = { title: "AI Usage - Admin" };

export default async function AdminUsagePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  await requireAdminPermission("usage.read");
  const supabase = await createClient();

  const resolvedSearchParams = await searchParams;
  const page = Number(resolvedSearchParams.page) || 1;
  const limit = 20;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data: logs, count } = await supabase
    .from("ai_logs")
    .select("*, user:profiles!ai_logs_user_id_fkey(email)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  const totalPages = Math.ceil((count || 0) / limit);

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Activity className="w-6 h-6 text-brand-400" /> AI Usage Logs
        </h1>
        <p className="text-sm text-zinc-400">Monitor platform-wide AI token consumption ({count || 0} requests)</p>
      </div>

      <div className="bg-surface-100 border border-surface-400/50 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-200/50 border-b border-surface-400/50 text-zinc-400">
              <tr>
                <th className="px-6 py-4 font-medium">Timestamp</th>
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Model</th>
                <th className="px-6 py-4 font-medium">Prompt Snippet</th>
                <th className="px-6 py-4 font-medium">Tokens</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-400/30">
              {logs?.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">No logs found.</td>
                </tr>
              )}
              {logs?.map((log: any) => (
                <tr key={log.id} className="hover:bg-surface-200/30 transition-colors">
                  <td className="px-6 py-4 text-zinc-500 text-xs">{new Date(log.created_at).toLocaleString()}</td>
                  <td className="px-6 py-4 text-white text-xs">{log.user?.email || log.user_id}</td>
                  <td className="px-6 py-4 text-brand-400 text-xs font-mono">{log.model || log.provider}</td>
                  <td className="px-6 py-4 text-zinc-300 text-xs max-w-[300px] truncate">{log.prompt}</td>
                  <td className="px-6 py-4 text-emerald-400 font-mono text-xs flex items-center gap-1">
                    <Zap className="w-3 h-3" /> {log.tokens_used}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {totalPages > 1 && (
        <div className="flex justify-between items-center bg-surface-100 p-4 rounded-2xl border border-surface-400/50">
          <div className="text-sm text-zinc-400">Page {page} of {totalPages}</div>
        </div>
      )}
    </div>
  );
}
