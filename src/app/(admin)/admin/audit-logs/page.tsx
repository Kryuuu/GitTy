import { requireAdminPermission } from "@/lib/admin/auth";
import { createClient } from "@/lib/supabase/server";
import { ShieldAlert } from "lucide-react";

export const metadata = {
  title: "Audit Logs - Admin",
};

export default async function AdminAuditLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  await requireAdminPermission("audit.read");
  const supabase = await createClient();

  const resolvedSearchParams = await searchParams;
  const page = Number(resolvedSearchParams.page) || 1;
  
  const limit = 50; // More rows per page for logs
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data: logs, count } = await supabase
    .from("admin_audit_logs")
    .select("*, actor:profiles!admin_audit_logs_actor_id_fkey(email)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  const totalPages = Math.ceil((count || 0) / limit);

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-slide-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-brand-400" /> Audit Logs
          </h1>
          <p className="text-sm text-zinc-400">Immutable record of all privileged actions ({count || 0} events)</p>
        </div>
      </div>

      <div className="bg-surface-100 border border-surface-400/50 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm font-mono">
            <thead className="bg-surface-200/50 border-b border-surface-400/50 text-zinc-400">
              <tr>
                <th className="px-6 py-3 font-medium">Timestamp</th>
                <th className="px-6 py-3 font-medium">Actor</th>
                <th className="px-6 py-3 font-medium">Action</th>
                <th className="px-6 py-3 font-medium">Entity</th>
                <th className="px-6 py-3 font-medium">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-400/30">
              {logs?.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-500 font-sans">
                    No audit logs found.
                  </td>
                </tr>
              )}
              {logs?.map((log: any) => (
                <tr key={log.id} className="hover:bg-surface-200/30 transition-colors text-xs text-zinc-300">
                  <td className="px-6 py-3 whitespace-nowrap text-zinc-500">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-3 text-brand-300">
                    {log.actor?.email || log.actor_id || 'System'}
                  </td>
                  <td className="px-6 py-3">
                    <span className="px-2 py-0.5 rounded bg-surface-300 text-white font-semibold">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    {log.entity_type} {log.entity_id ? `(${log.entity_id.slice(0,8)}...)` : ''}
                  </td>
                  <td className="px-6 py-3 text-zinc-500">
                    {log.ip_address || 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {totalPages > 1 && (
        <div className="flex justify-between items-center bg-surface-100 p-4 rounded-2xl border border-surface-400/50">
          <div className="text-sm text-zinc-400 font-sans">
            Page {page} of {totalPages}
          </div>
        </div>
      )}
    </div>
  );
}
