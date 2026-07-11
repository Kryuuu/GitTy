import { requireAdminPermission } from "@/lib/admin/auth";
import { createClient } from "@/lib/supabase/server";
import { Search, Receipt, CheckCircle, Clock } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Transactions - Admin" };

export default async function AdminTransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  await requireAdminPermission("transactions.read");
  const supabase = await createClient();

  const resolvedSearchParams = await searchParams;
  const page = Number(resolvedSearchParams.page) || 1;
  const limit = 20;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data: txs, count } = await supabase
    .from("marketplace_purchases")
    .select("*, item:marketplace_items(title), buyer:profiles!marketplace_purchases_buyer_id_fkey(email)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  const totalPages = Math.ceil((count || 0) / limit);

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Transactions</h1>
        <p className="text-sm text-zinc-400">Marketplace and subscription purchases ({count || 0} total)</p>
      </div>

      <div className="bg-surface-100 border border-surface-400/50 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-200/50 border-b border-surface-400/50 text-zinc-400">
              <tr>
                <th className="px-6 py-4 font-medium">Transaction ID</th>
                <th className="px-6 py-4 font-medium">Item</th>
                <th className="px-6 py-4 font-medium">Buyer</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-400/30">
              {txs?.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">No transactions found.</td>
                </tr>
              )}
              {txs?.map((tx: any) => (
                <tr key={tx.id} className="hover:bg-surface-200/30 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-zinc-400">{tx.midtrans_transaction_id || tx.id.slice(0,8)}</td>
                  <td className="px-6 py-4 text-white">{tx.item?.title || 'Unknown Item'}</td>
                  <td className="px-6 py-4 text-zinc-400">{tx.buyer?.email || tx.buyer_id}</td>
                  <td className="px-6 py-4 font-bold text-emerald-400">${(tx.price_cents / 100).toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded ${tx.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                      {tx.status === 'completed' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />} {tx.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-500 text-xs">{new Date(tx.created_at).toLocaleString()}</td>
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
