import { requireAdminPermission } from "@/lib/admin/auth";
import { createClient } from "@/lib/supabase/server";
import { AlertTriangle, Flag } from "lucide-react";

export const metadata = { title: "Reports - Admin" };

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  await requireAdminPermission("reports.read");
  const supabase = await createClient();

  const resolvedSearchParams = await searchParams;
  const page = Number(resolvedSearchParams.page) || 1;
  const limit = 20;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data: reports, count } = await supabase
    .from("reports")
    .select("*, reporter:profiles!reports_reporter_id_fkey(email)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  const totalPages = Math.ceil((count || 0) / limit);

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-red-400" /> Moderation Reports
        </h1>
        <p className="text-sm text-zinc-400">User reports requiring moderation ({count || 0} total)</p>
      </div>

      <div className="bg-surface-100 border border-surface-400/50 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-200/50 border-b border-surface-400/50 text-zinc-400">
              <tr>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Reason</th>
                <th className="px-6 py-4 font-medium">Target ID</th>
                <th className="px-6 py-4 font-medium">Reporter</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-400/30">
              {reports?.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">No active reports. All good!</td>
                </tr>
              )}
              {reports?.map((report: any) => (
                <tr key={report.id} className="hover:bg-surface-200/30 transition-colors">
                  <td className="px-6 py-4 text-white capitalize">{report.entity_type}</td>
                  <td className="px-6 py-4">
                    <div className="text-white font-medium">{report.reason}</div>
                    <div className="text-xs text-zinc-500">{report.description}</div>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-zinc-400">{report.entity_id}</td>
                  <td className="px-6 py-4 text-zinc-400 text-xs">{report.reporter?.email || report.reporter_id}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-red-500/10 text-red-400">
                      <Flag className="w-3 h-3" /> {report.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
