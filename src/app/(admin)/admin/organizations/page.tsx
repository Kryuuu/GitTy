import { requireAdminPermission } from "@/lib/admin/auth";
import { createClient } from "@/lib/supabase/server";
import { Search, Building2, MoreVertical } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Organizations - Admin",
};

export default async function AdminOrganizationsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  await requireAdminPermission("organizations.read");
  const supabase = await createClient();

  const resolvedSearchParams = await searchParams;
  const page = Number(resolvedSearchParams.page) || 1;
  const query = (resolvedSearchParams.query as string) || "";
  
  const limit = 20;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let queryBuilder = supabase
    .from("organizations")
    .select("*, owner:profiles!organizations_owner_id_fkey(email, full_name)", { count: "exact" });

  if (query) {
    queryBuilder = queryBuilder.ilike("name", `%${query}%`);
  }

  const { data: orgs, count } = await queryBuilder
    .order("created_at", { ascending: false })
    .range(from, to);

  const totalPages = Math.ceil((count || 0) / limit);

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-slide-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Organizations</h1>
          <p className="text-sm text-zinc-400">Manage all workspaces ({count || 0} total)</p>
        </div>
        <div className="flex items-center gap-3">
           <form className="relative" action="/admin/organizations" method="GET">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
             <input 
               type="text" 
               name="query" 
               defaultValue={query}
               placeholder="Search organizations..." 
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
                <th className="px-6 py-4 font-medium">Organization</th>
                <th className="px-6 py-4 font-medium">Owner</th>
                <th className="px-6 py-4 font-medium">Created</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-400/30">
              {orgs?.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">
                    No organizations found.
                  </td>
                </tr>
              )}
              {orgs?.map((org: any) => (
                <tr key={org.id} className="hover:bg-surface-200/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-surface-300 flex items-center justify-center shrink-0">
                        {org.logo_url ? (
                          <img src={org.logo_url} alt="" className="w-10 h-10 rounded-xl object-cover" />
                        ) : (
                          <Building2 className="w-5 h-5 text-zinc-500" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-white">{org.name}</div>
                        <div className="text-xs text-zinc-500">/{org.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-white">{org.owner?.full_name || "Unknown"}</div>
                    <div className="text-xs text-zinc-500">{org.owner?.email || org.owner_id}</div>
                  </td>
                  <td className="px-6 py-4 text-zinc-400 text-xs">
                    {new Date(org.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/admin/organizations/${org.id}`} className="p-2 text-zinc-400 hover:text-white hover:bg-surface-300 rounded-lg transition-colors inline-flex">
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
              <Link href={`/admin/organizations?page=${page - 1}${query ? `&query=${query}` : ''}`} className="px-4 py-2 bg-surface-200 hover:bg-surface-300 rounded-lg text-sm text-white transition-colors">
                Previous
              </Link>
            )}
            {page < totalPages && (
              <Link href={`/admin/organizations?page=${page + 1}${query ? `&query=${query}` : ''}`} className="px-4 py-2 bg-brand-500 hover:bg-brand-600 rounded-lg text-sm text-white transition-colors">
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
