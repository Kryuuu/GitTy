import { requireAdminPermission } from "@/lib/admin/auth";
import { createClient } from "@/lib/supabase/server";
import { Search, Store, MoreVertical, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Marketplace Moderation - Admin",
};

export default async function AdminMarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  await requireAdminPermission("marketplace.moderate");
  const supabase = await createClient();

  const resolvedSearchParams = await searchParams;
  const page = Number(resolvedSearchParams.page) || 1;
  const query = (resolvedSearchParams.query as string) || "";
  
  const limit = 20;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let queryBuilder = supabase
    .from("marketplace_items")
    .select("*, organization:organizations(name), creator:profiles!marketplace_items_creator_id_fkey(email)", { count: "exact" });

  if (query) {
    queryBuilder = queryBuilder.ilike("title", `%${query}%`);
  }

  const { data: items, count } = await queryBuilder
    .order("created_at", { ascending: false })
    .range(from, to);

  const totalPages = Math.ceil((count || 0) / limit);

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-slide-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Marketplace Moderation</h1>
          <p className="text-sm text-zinc-400">Approve and moderate community items ({count || 0} total)</p>
        </div>
        <div className="flex items-center gap-3">
           <form className="relative" action="/admin/marketplace" method="GET">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
             <input 
               type="text" 
               name="query" 
               defaultValue={query}
               placeholder="Search items..." 
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
                <th className="px-6 py-4 font-medium">Item</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Price</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-400/30">
              {items?.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                    No marketplace items found.
                  </td>
                </tr>
              )}
              {items?.map((item: any) => (
                <tr key={item.id} className="hover:bg-surface-200/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-surface-300 flex items-center justify-center shrink-0">
                        <Store className="w-4 h-4 text-zinc-500" />
                      </div>
                      <div>
                        <div className="font-medium text-white">{item.title}</div>
                        <div className="text-xs text-zinc-500">by {item.organization?.name || 'Unknown'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="capitalize text-zinc-300">{item.type}</span>
                  </td>
                  <td className="px-6 py-4 font-medium text-brand-400">
                    {item.price_cents === 0 ? 'Free' : `$${(item.price_cents / 100).toFixed(2)}`}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-xs">
                      {item.is_published ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md">
                          <Eye className="w-3 h-3" /> Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-yellow-400 bg-yellow-500/10 px-2 py-1 rounded-md">
                          <EyeOff className="w-3 h-3" /> Pending
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/admin/marketplace/${item.id}`} className="p-2 text-zinc-400 hover:text-white hover:bg-surface-300 rounded-lg transition-colors inline-flex">
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
              <Link href={`/admin/marketplace?page=${page - 1}${query ? `&query=${query}` : ''}`} className="px-4 py-2 bg-surface-200 hover:bg-surface-300 rounded-lg text-sm text-white transition-colors">
                Previous
              </Link>
            )}
            {page < totalPages && (
              <Link href={`/admin/marketplace?page=${page + 1}${query ? `&query=${query}` : ''}`} className="px-4 py-2 bg-brand-500 hover:bg-brand-600 rounded-lg text-sm text-white transition-colors">
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
