import { requireAdminPermission } from "@/lib/admin/auth";
import { createClient } from "@/lib/supabase/server";
import { Search, Bot, MoreVertical, Globe, Lock } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "AI Agents - Admin",
};

export default async function AdminAgentsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  await requireAdminPermission("agents.read");
  const supabase = await createClient();

  const resolvedSearchParams = await searchParams;
  const page = Number(resolvedSearchParams.page) || 1;
  const query = (resolvedSearchParams.query as string) || "";
  
  const limit = 20;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let queryBuilder = supabase
    .from("agents")
    .select("*, organization:organizations(name), creator:profiles!agents_created_by_fkey(email)", { count: "exact" });

  if (query) {
    queryBuilder = queryBuilder.ilike("name", `%${query}%`);
  }

  const { data: agents, count } = await queryBuilder
    .order("created_at", { ascending: false })
    .range(from, to);

  const totalPages = Math.ceil((count || 0) / limit);

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-slide-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">AI Agents</h1>
          <p className="text-sm text-zinc-400">Manage all AI assistants ({count || 0} total)</p>
        </div>
        <div className="flex items-center gap-3">
           <form className="relative" action="/admin/agents" method="GET">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
             <input 
               type="text" 
               name="query" 
               defaultValue={query}
               placeholder="Search agents..." 
               className="pl-9 pr-4 py-2 bg-surface-200 border border-surface-400/50 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500 transition-colors w-full sm:w-64"
             />
           </form>
        </div>
      </div>

      <div className="bg-surface-100 border border-surface-400/50 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-200/50 border-b border-surface-400/50 text-zinc-400">
              <tr>
                <th className="px-6 py-4 font-medium">Agent</th>
                <th className="px-6 py-4 font-medium">Organization</th>
                <th className="px-6 py-4 font-medium">Provider</th>
                <th className="px-6 py-4 font-medium">Visibility</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-400/30">
              {agents?.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                    No agents found.
                  </td>
                </tr>
              )}
              {agents?.map((agent: any) => (
                <tr key={agent.id} className="hover:bg-surface-200/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-surface-300 flex items-center justify-center shrink-0 text-xl">
                        {agent.avatar || '🤖'}
                      </div>
                      <div>
                        <div className="font-medium text-white">{agent.name}</div>
                        <div className="text-xs text-zinc-500 max-w-[200px] truncate">{agent.description || 'No description'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-white">{agent.organization?.name || "Global"}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-surface-300 text-zinc-400">
                      {agent.provider || 'openai'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-xs text-zinc-400">
                      {agent.visibility === 'public' ? <Globe className="w-3 h-3 text-emerald-400" /> : <Lock className="w-3 h-3 text-zinc-500" />}
                      <span className="capitalize">{agent.visibility}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/admin/agents/${agent.id}`} className="p-2 text-zinc-400 hover:text-white hover:bg-surface-300 rounded-lg transition-colors inline-flex">
                      <MoreVertical className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {totalPages > 1 && (
        <div className="flex justify-between items-center bg-surface-100 p-4 rounded-2xl border border-surface-400/50">
          <div className="text-sm text-zinc-400">
            Page {page} of {totalPages}
          </div>
          <div className="flex gap-2">
            {page > 1 && (
              <Link href={`/admin/agents?page=${page - 1}${query ? `&query=${query}` : ''}`} className="px-4 py-2 bg-surface-200 hover:bg-surface-300 rounded-lg text-sm text-white transition-colors">
                Previous
              </Link>
            )}
            {page < totalPages && (
              <Link href={`/admin/agents?page=${page + 1}${query ? `&query=${query}` : ''}`} className="px-4 py-2 bg-brand-500 hover:bg-brand-600 rounded-lg text-sm text-white transition-colors">
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
