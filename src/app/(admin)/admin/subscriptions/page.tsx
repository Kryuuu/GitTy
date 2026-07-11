import { requireAdminPermission } from "@/lib/admin/auth";
import { createClient } from "@/lib/supabase/server";
import { Search, CreditCard, MoreVertical, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import PlanEditor from "./plan-editor";

export const metadata = {
  title: "Subscriptions - Admin",
};

export default async function AdminSubscriptionsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  await requireAdminPermission("subscriptions.read");
  const supabase = await createClient();

  const resolvedSearchParams = await searchParams;
  const page = Number(resolvedSearchParams.page) || 1;
  const query = (resolvedSearchParams.query as string) || "";
  
  const limit = 20;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let queryBuilder = supabase
    .from("subscriptions")
    .select("*, organization:organizations(name)", { count: "exact" });

  if (query) {
    queryBuilder = queryBuilder.ilike("organization.name", `%${query}%`);
  }

  const { data: subs, count } = await queryBuilder
    .order("created_at", { ascending: false })
    .range(from, to);

  const totalPages = Math.ceil((count || 0) / limit);

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-slide-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Subscriptions & Billing</h1>
          <p className="text-sm text-zinc-400">Manage organization subscriptions ({count || 0} total)</p>
        </div>
      </div>

      <div className="bg-surface-100 border border-surface-400/50 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-200/50 border-b border-surface-400/50 text-zinc-400">
              <tr>
                <th className="px-6 py-4 font-medium">Organization</th>
                <th className="px-6 py-4 font-medium">Plan</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Usage</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-400/30">
              {subs?.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                    No subscriptions found.
                  </td>
                </tr>
              )}
              {subs?.map((sub: any) => (
                <tr key={sub.id} className="hover:bg-surface-200/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-white">
                    {sub.organization?.name || "Unknown"}
                  </td>
                  <td className="px-6 py-4">
                    <PlanEditor subId={sub.id} currentPlan={sub.plan} orgId={sub.org_id} currentEnd={sub.current_period_end} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-xs">
                      {sub.status === 'active' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md">
                          <CheckCircle2 className="w-3 h-3" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-400 bg-red-500/10 px-2 py-1 rounded-md">
                          <XCircle className="w-3 h-3" /> {sub.status}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-zinc-400 text-xs">
                    {sub.usage_count} / {sub.usage_limit}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-zinc-400 hover:text-white hover:bg-surface-300 rounded-lg transition-colors inline-flex">
                      <MoreVertical className="w-4 h-4" />
                    </button>
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
