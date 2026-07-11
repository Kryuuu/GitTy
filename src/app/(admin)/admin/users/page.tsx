import { requireAdminPermission } from "@/lib/admin/auth";
import { createClient } from "@/lib/supabase/server";
import { Search, UserCog, MoreVertical, Ban, ShieldAlert, ArrowUpDown } from "lucide-react";
import Link from "next/link";
import RoleFilter from "./role-filter";
import { redirect } from "next/navigation";

export const metadata = {
  title: "User Management - Admin",
};

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  await requireAdminPermission("users.read");
  const supabase = await createClient();

  const resolvedSearchParams = await searchParams;
  const page = Number(resolvedSearchParams.page) || 1;
  const query = (resolvedSearchParams.query as string) || "";
  const role = (resolvedSearchParams.role as string) || "all";
  
  const limit = 20;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let queryBuilder = supabase
    .from("profiles")
    .select("*", { count: "exact" });

  if (query) {
    queryBuilder = queryBuilder.or(`username.ilike.%${query}%,email.ilike.%${query}%,full_name.ilike.%${query}%`);
  }
  
  if (role && role !== "all") {
    queryBuilder = queryBuilder.eq("platform_role", role);
  }

  const { data: users, count } = await queryBuilder
    .order("created_at", { ascending: false })
    .range(from, to);

  const totalPages = Math.ceil((count || 0) / limit);

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-slide-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Users</h1>
          <p className="text-sm text-zinc-400">Manage all platform accounts ({count || 0} total)</p>
        </div>
        <div className="flex items-center gap-3">
           <form className="relative" action="/admin/users" method="GET">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
             <input 
               type="text" 
               name="query" 
               defaultValue={query}
               placeholder="Search users..." 
               className="pl-9 pr-4 py-2 bg-surface-200 border border-surface-400/50 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500 transition-colors w-full sm:w-64"
             />
             {role !== "all" && <input type="hidden" name="role" value={role} />}
           </form>
           <RoleFilter currentRole={role} currentQuery={query} />
        </div>
      </div>

      <div className="bg-surface-100 border border-surface-400/50 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-200/50 border-b border-surface-400/50 text-zinc-400">
              <tr>
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Joined</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-400/30">
              {users?.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                    No users found.
                  </td>
                </tr>
              )}
              {users?.map((user) => (
                <tr key={user.id} className="hover:bg-surface-200/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-surface-300 flex items-center justify-center shrink-0">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <span className="text-zinc-400 font-medium">{user.username?.[0]?.toUpperCase() || "?"}</span>
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-white">{user.full_name || "Unknown"}</div>
                        <div className="text-xs text-zinc-500">@{user.username || user.id.slice(0,8)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                      user.platform_role === 'super_admin' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                      user.platform_role === 'admin' ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20' :
                      user.platform_role === 'support' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                      'bg-surface-300 text-zinc-400'
                    }`}>
                      {user.platform_role || 'user'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                      user.account_status === 'active' ? 'bg-emerald-500/10 text-emerald-400' :
                      user.account_status === 'suspended' ? 'bg-yellow-500/10 text-yellow-400' :
                      'bg-red-500/10 text-red-400'
                    }`}>
                      {user.account_status || 'active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-400 text-xs">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/admin/users/${user.id}`} className="p-2 text-zinc-400 hover:text-white hover:bg-surface-300 rounded-lg transition-colors inline-flex">
                      <UserCog className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center bg-surface-100 p-4 rounded-2xl border border-surface-400/50">
          <div className="text-sm text-zinc-400">
            Page {page} of {totalPages}
          </div>
          <div className="flex gap-2">
            {page > 1 && (
              <Link href={`/admin/users?page=${page - 1}${query ? `&query=${query}` : ''}${role !== 'all' ? `&role=${role}` : ''}`} className="px-4 py-2 bg-surface-200 hover:bg-surface-300 rounded-lg text-sm text-white transition-colors">
                Previous
              </Link>
            )}
            {page < totalPages && (
              <Link href={`/admin/users?page=${page + 1}${query ? `&query=${query}` : ''}${role !== 'all' ? `&role=${role}` : ''}`} className="px-4 py-2 bg-brand-500 hover:bg-brand-600 rounded-lg text-sm text-white transition-colors">
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
